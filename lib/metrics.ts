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
 * Set the runtime flag that enables or disables metrics collection.
 *
 * @param enabled - `true` to enable metrics, `false` to disable them
 */
export function setMetricsEnabled(enabled: boolean): void {
  metricsEnabled = enabled
}

/**
 * Determine whether metrics collection is enabled.
 *
 * @returns `true` if metrics collection has been explicitly enabled, `false` otherwise.
 */
export function isMetricsEnabled(): boolean {
  // Default to false if not explicitly set
  return metricsEnabled === true
}

/**
 * Send a single tracking event to the configured tracking endpoint using a fire-and-forget strategy.
 *
 * This is a no-op outside a browser or when metrics are disabled. It attempts to deliver the event without
 * blocking rendering and treats network failures as non-fatal (errors are logged in development only).
 *
 * @param event - The tracking event to send (must conform to `MetricsClientEvent`, including its `type` and payload)
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
 * Logs a debug message to the console when NODE_ENV is 'development'.
 *
 * The message is prefixed with "[GF_METRICS]" and additional values are forwarded to console.debug.
 *
 * @param message - The primary debug message or format string
 * @param args - Additional values to include with the message
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
 * Sends a page view tracking event to the Ghost Factory metrics endpoint.
 *
 * @param args - Tracking parameters including `clientId` and `pageId`; may include optional `blockId`, `variantId`, and `metadata`
 */
export function trackPageView(args: TrackArgs): void {
  sendEvent({
    type: 'page_view',
    ...args,
  })
}

/**
 * Send a 'cta_click' metrics event using the provided tracking arguments.
 *
 * @param args - Tracking details: `clientId`, `pageId`, and optional `blockId`, `variantId`, and `metadata`
 */
export function trackCtaClick(args: TrackArgs): void {
  sendEvent({
    type: 'cta_click',
    ...args,
  })
}

/**
 * Send a conversion event to the metrics endpoint for the current client and page.
 *
 * @param args - Tracking details including `clientId`, `pageId`, optional `blockId`, optional `variantId`, and optional `metadata`
 */
export function trackConversion(args: TrackArgs): void {
  sendEvent({
    type: 'conversion',
    ...args,
  })
}

/**
 * Emit a metrics event with the given event type and tracking arguments.
 *
 * @param type - The metrics event type to record
 * @param args - Tracking details (e.g., `clientId`, `pageId`, optional `blockId`, `variantId`, and `metadata`)
 */
export function track(type: MetricsEventType, args: TrackArgs): void {
  sendEvent({
    type,
    ...args,
  })
}

/**
 * Send multiple metrics events as a single batched request.
 *
 * No-op when executed outside a browser, when metrics are disabled, or when `events` is empty. Network failures are non-fatal.
 *
 * @param events - Array of metrics events to include in the batch
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