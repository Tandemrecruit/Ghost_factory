/**
 * Ghost Factory Metrics Client (v1)
 *
 * Privacy-friendly, fire-and-forget metrics tracking for client landing pages.
 *
 * Features:
 * - Only runs in browser (guards against SSR)
 * - Uses sendBeacon when available, falls back to fetch with keepalive
 * - Never blocks rendering
 * - Failures are non-fatal (logged in dev only)
 * - Respects GF_METRICS_ENABLED env var
 */

import type { MetricsClientEvent, MetricsEventType, MetricsMetadata } from './metrics-schema'

// Track endpoint - relative path works in browser
const TRACK_ENDPOINT = '/api/gf-track'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Check if metrics are enabled (client-side check via injected value)
// This will be set by the MetricsProvider or can be checked server-side
let metricsEnabled: boolean | null = null

/**
 * Set whether metrics are enabled (called by MetricsProvider)
 */
export function setMetricsEnabled(enabled: boolean): void {
  metricsEnabled = enabled
}

/**
 * Check if metrics are enabled
 */
export function isMetricsEnabled(): boolean {
  // Default to false if not explicitly set
  return metricsEnabled === true
}

/**
 * Send event(s) to the tracking endpoint
 * Fire-and-forget: never throws, never blocks
 */
function sendEvent(event: MetricsClientEvent): void {
  if (!isBrowser || !isMetricsEnabled()) {
    return
  }

  const payload = JSON.stringify(event)

  // Try sendBeacon first (most reliable for fire-and-forget)
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([payload], { type: 'application/json' })
      const sent = navigator.sendBeacon(TRACK_ENDPOINT, blob)
      if (sent) {
        logDebug('Event sent via sendBeacon', event.type)
        return
      }
    } catch {
      // Fall through to fetch
    }
  }

  // Fallback to fetch with keepalive
  try {
    fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch((error) => {
      logDebug('Fetch error (non-fatal)', error)
    })
    logDebug('Event sent via fetch', event.type)
  } catch (error) {
    logDebug('Send error (non-fatal)', error)
  }
}

/**
 * Log debug messages in development only
 */
function logDebug(message: string, ...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[GF_METRICS] ${message}`, ...args)
  }
}

// Common tracking arguments
export interface TrackArgs {
  clientId: string
  pageId: string
  blockId?: string
  variantId?: string
  metadata?: MetricsMetadata
}

/**
 * Track a page view event
 */
export function trackPageView(args: TrackArgs): void {
  sendEvent({
    type: 'page_view',
    ...args,
  })
}

/**
 * Track a CTA click event
 */
export function trackCtaClick(args: TrackArgs): void {
  sendEvent({
    type: 'cta_click',
    ...args,
  })
}

/**
 * Track a conversion event
 */
export function trackConversion(args: TrackArgs): void {
  sendEvent({
    type: 'conversion',
    ...args,
  })
}

/**
 * Generic track function for custom event types
 */
export function track(type: MetricsEventType, args: TrackArgs): void {
  sendEvent({
    type,
    ...args,
  })
}

/**
 * Send multiple events in a batch
 */
export function trackBatch(events: MetricsClientEvent[]): void {
  if (!isBrowser || !isMetricsEnabled() || events.length === 0) {
    return
  }

  const payload = JSON.stringify({ events })

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([payload], { type: 'application/json' })
      const sent = navigator.sendBeacon(TRACK_ENDPOINT, blob)
      if (sent) {
        logDebug('Batch sent via sendBeacon', events.length)
        return
      }
    } catch {
      // Fall through to fetch
    }
  }

  try {
    fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch((error) => {
      logDebug('Batch fetch error (non-fatal)', error)
    })
    logDebug('Batch sent via fetch', events.length)
  } catch (error) {
    logDebug('Batch send error (non-fatal)', error)
  }
}
