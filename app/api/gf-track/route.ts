import { NextRequest } from 'next/server'
import {
  MetricsApiRequestSchema,
  MetricsProcessedEvent,
  isBatchRequest,
  type MetricsClientEvent,
} from '@/lib/metrics-schema'

/**
 * Ghost Factory Metrics API Route (v1)
 *
 * Accepts POST requests with tracking events and processes them according
 * to the configured persistence strategy.
 *
 * Persistence strategies:
 * 1. If GF_METRICS_WEBHOOK_URL is NOT set:
 *    - Development: console.log events with [GF_METRICS_EVENT] prefix
 *    - Production: accept and validate, but no-op (no persistence)
 *
 * 2. If GF_METRICS_WEBHOOK_URL IS set:
 *    - POST validated events to the webhook URL
 *    - Include auth header if GF_METRICS_WEBHOOK_SECRET is defined
 */

// Environment variables
const METRICS_ENABLED = process.env.GF_METRICS_ENABLED === 'true'
const WEBHOOK_URL = process.env.GF_METRICS_WEBHOOK_URL
const WEBHOOK_SECRET = process.env.GF_METRICS_WEBHOOK_SECRET
const IS_DEV = process.env.NODE_ENV !== 'production'

/**
 * Add server-side timestamp to an event
 */
function processEvent(event: MetricsClientEvent): MetricsProcessedEvent {
  return {
    ...event,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Log event in development mode
 */
function logEvent(event: MetricsProcessedEvent): void {
  console.log('[GF_METRICS_EVENT]', JSON.stringify(event))
}

/**
 * Send events to configured webhook
 */
async function sendToWebhook(events: MetricsProcessedEvent[]): Promise<void> {
  if (!WEBHOOK_URL) return

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add auth header if secret is configured
    if (WEBHOOK_SECRET) {
      headers['Authorization'] = `Bearer ${WEBHOOK_SECRET}`
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ events }),
    })

    if (!response.ok) {
      console.error(
        `[GF_METRICS] Webhook returned ${response.status}: ${response.statusText}`
      )
    }
  } catch (error) {
    console.error('[GF_METRICS] Webhook error:', error)
    // Swallow error - don't throw
  }
}

/**
 * Process events according to persistence strategy
 */
async function persistEvents(events: MetricsProcessedEvent[]): Promise<void> {
  if (WEBHOOK_URL) {
    // Strategy 2: Send to webhook
    await sendToWebhook(events)
  } else if (IS_DEV) {
    // Strategy 1a: Log in development
    events.forEach(logEvent)
  }
  // Strategy 1b: No-op in production without webhook
}

export async function POST(request: NextRequest) {
  // Check if metrics are enabled
  if (!METRICS_ENABLED) {
    // Silently accept but don't process
    return new Response(null, { status: 204 })
  }

  try {
    // Parse request body
    const body = await request.json()

    // Validate payload
    const parseResult = MetricsApiRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid event payload',
          details: parseResult.error.issues,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const data = parseResult.data

    // Normalize to array of events
    const clientEvents: MetricsClientEvent[] = isBatchRequest(data)
      ? data.events
      : [data]

    // Process events (add timestamps)
    const processedEvents = clientEvents.map(processEvent)

    // Persist events
    await persistEvents(processedEvents)

    // Return 204 No Content on success
    return new Response(null, { status: 204 })
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Log unexpected errors
    console.error('[GF_METRICS] Unexpected error:', error)

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Also support OPTIONS for CORS preflight if needed
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
