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
 * Attach a server-side ISO 8601 timestamp to the provided metrics event.
 *
 * @param event - The client-originated metrics event to augment
 * @returns A `MetricsProcessedEvent` containing all original event fields plus a `timestamp` set to the current time in ISO 8601 format
 */
function processEvent(event: MetricsClientEvent): MetricsProcessedEvent {
  return {
    ...event,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Log a processed metrics event to the console with a [GF_METRICS_EVENT] prefix.
 *
 * @param event - The processed metrics event to log
 */
function logEvent(event: MetricsProcessedEvent): void {
  console.log('[GF_METRICS_EVENT]', JSON.stringify(event))
}

/**
 * Send processed metrics events to the configured webhook endpoint.
 *
 * If no webhook URL is configured this function is a no-op. Includes an
 * Authorization Bearer header when a webhook secret is configured. Errors
 * and non-OK responses are logged but not propagated.
 *
 * @param events - Array of processed metrics events to include in the request body as `{ events }`
 * @returns `void`
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
 * Persist processed metric events according to the configured strategy.
 *
 * If a webhook URL is configured, POSTs the events to that webhook; otherwise, in development each event is logged locally; in production without a webhook this is a no-op.
 *
 * @param events - Array of processed metric events (each includes a server-side timestamp) to be persisted
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

/**
 * HTTP POST handler that accepts metrics events, validates and processes them, and persists or forwards them according to configuration.
 *
 * Validates the incoming JSON against the metrics API schema, normalizes single or batched events, attaches a server timestamp to each event, and persists them via the configured strategy (webhook, development logging, or no-op in production). If metrics are disabled, it accepts the request without processing.
 *
 * @param request - Incoming NextRequest whose JSON body must match the metrics API request schema (single event or batch).
 * @returns A Response: 204 No Content when accepted (including when metrics are disabled), 400 with a JSON error for invalid JSON or schema validation failures, or 500 with a JSON error for unexpected server errors.
 */
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

/**
 * Handles CORS preflight requests by returning an empty 204 response with appropriate CORS headers.
 *
 * @returns A `Response` with HTTP status 204 (No Content) and headers `Access-Control-Allow-Methods: POST, OPTIONS` and `Access-Control-Allow-Headers: Content-Type`.
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}