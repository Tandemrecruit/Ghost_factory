import { z } from 'zod'

/**
 * Ghost Factory Metrics - Event Schema (v1)
 *
 * Privacy-first event tracking for client landing pages.
 * - No PII collection
 * - No cookies or localStorage
 * - Anonymous, aggregate-friendly data
 */

// Event types supported in v1
export const MetricsEventType = z.enum(['page_view', 'cta_click', 'conversion'])
export type MetricsEventType = z.infer<typeof MetricsEventType>

// Metadata schema - JSON-safe object for additional context
export const MetricsMetadata = z.record(z.string(), z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
])).optional()
export type MetricsMetadata = z.infer<typeof MetricsMetadata>

// Single event schema
export const MetricsEventSchema = z.object({
  // Required fields
  type: MetricsEventType,
  clientId: z.string().min(1, 'clientId is required'),
  pageId: z.string().min(1, 'pageId is required'),

  // Server-generated timestamp (ISO string)
  // When receiving from client, this is optional and will be set server-side
  timestamp: z.string().datetime().optional(),

  // Optional fields for v1
  blockId: z.string().optional(),
  variantId: z.string().optional(),
  metadata: MetricsMetadata,
})
export type MetricsEvent = z.infer<typeof MetricsEventSchema>

// Client-side event payload (without timestamp, will be added server-side)
export const MetricsClientEventSchema = MetricsEventSchema.omit({ timestamp: true })
export type MetricsClientEvent = z.infer<typeof MetricsClientEventSchema>

// API request body - single event or batch
export const MetricsApiRequestSchema = z.union([
  // Single event
  MetricsClientEventSchema,
  // Batch of events
  z.object({
    events: z.array(MetricsClientEventSchema).min(1).max(100),
  }),
])
export type MetricsApiRequest = z.infer<typeof MetricsApiRequestSchema>

/**
 * Determine whether an API request represents a batch of client events.
 *
 * @param request - API request payload to inspect
 * @returns `true` if the request contains an `events` array of client events, `false` otherwise.
 */
export function isBatchRequest(
  request: MetricsApiRequest
): request is { events: MetricsClientEvent[] } {
  return 'events' in request && Array.isArray(request.events)
}

// Event with server-assigned timestamp (after processing)
export const MetricsProcessedEventSchema = MetricsEventSchema.required({
  timestamp: true,
})
export type MetricsProcessedEvent = z.infer<typeof MetricsProcessedEventSchema>