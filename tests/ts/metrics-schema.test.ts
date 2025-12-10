import { describe, it, expect } from 'vitest'
import {
  MetricsEventSchema,
  MetricsClientEventSchema,
  MetricsApiRequestSchema,
  isBatchRequest,
  type MetricsClientEvent,
} from '@/lib/metrics-schema'

describe('MetricsEventSchema', () => {
  it('validates a valid page_view event', () => {
    const event = {
      type: 'page_view',
      clientId: 'ember-roasters',
      pageId: 'ember-roasters',
      timestamp: '2024-01-15T10:30:00.000Z',
    }

    const result = MetricsEventSchema.safeParse(event)
    expect(result.success).toBe(true)
  })

  it('validates a valid cta_click event with optional fields', () => {
    const event = {
      type: 'cta_click',
      clientId: 'ember-roasters',
      pageId: 'ember-roasters',
      blockId: 'hero_simple_v1',
      variantId: 'variant_a',
      metadata: { cta_label: 'Book a call' },
      timestamp: '2024-01-15T10:30:00.000Z',
    }

    const result = MetricsEventSchema.safeParse(event)
    expect(result.success).toBe(true)
  })

  it('validates a valid conversion event', () => {
    const event = {
      type: 'conversion',
      clientId: 'ember-roasters',
      pageId: 'ember-roasters',
      blockId: 'pricing_simple_v1',
      metadata: { trigger: 'form_submit' },
    }

    const result = MetricsEventSchema.safeParse(event)
    expect(result.success).toBe(true)
  })

  it('rejects invalid event type', () => {
    const event = {
      type: 'invalid_type',
      clientId: 'ember-roasters',
      pageId: 'ember-roasters',
    }

    const result = MetricsEventSchema.safeParse(event)
    expect(result.success).toBe(false)
  })

  it('rejects missing clientId', () => {
    const event = {
      type: 'page_view',
      pageId: 'ember-roasters',
    }

    const result = MetricsEventSchema.safeParse(event)
    expect(result.success).toBe(false)
  })

  it('rejects empty clientId', () => {
    const event = {
      type: 'page_view',
      clientId: '',
      pageId: 'ember-roasters',
    }

    const result = MetricsEventSchema.safeParse(event)
    expect(result.success).toBe(false)
  })

  it('rejects missing pageId', () => {
    const event = {
      type: 'page_view',
      clientId: 'ember-roasters',
    }

    const result = MetricsEventSchema.safeParse(event)
    expect(result.success).toBe(false)
  })

  it('allows various metadata value types', () => {
    const event = {
      type: 'cta_click',
      clientId: 'ember-roasters',
      pageId: 'ember-roasters',
      metadata: {
        string_val: 'hello',
        number_val: 42,
        bool_val: true,
        null_val: null,
      },
    }

    const result = MetricsEventSchema.safeParse(event)
    expect(result.success).toBe(true)
  })
})

describe('MetricsClientEventSchema', () => {
  it('validates without timestamp', () => {
    const event = {
      type: 'page_view',
      clientId: 'ember-roasters',
      pageId: 'ember-roasters',
    }

    const result = MetricsClientEventSchema.safeParse(event)
    expect(result.success).toBe(true)
  })
})

describe('MetricsApiRequestSchema', () => {
  it('validates single event', () => {
    const request = {
      type: 'page_view',
      clientId: 'ember-roasters',
      pageId: 'ember-roasters',
    }

    const result = MetricsApiRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('validates batch of events', () => {
    const request = {
      events: [
        {
          type: 'page_view',
          clientId: 'ember-roasters',
          pageId: 'ember-roasters',
        },
        {
          type: 'cta_click',
          clientId: 'ember-roasters',
          pageId: 'ember-roasters',
          blockId: 'hero_simple_v1',
        },
      ],
    }

    const result = MetricsApiRequestSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('rejects empty batch', () => {
    const request = {
      events: [],
    }

    const result = MetricsApiRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })

  it('rejects batch with invalid event', () => {
    const request = {
      events: [
        {
          type: 'page_view',
          clientId: 'ember-roasters',
          pageId: 'ember-roasters',
        },
        {
          type: 'invalid_type',
          clientId: 'ember-roasters',
          pageId: 'ember-roasters',
        },
      ],
    }

    const result = MetricsApiRequestSchema.safeParse(request)
    expect(result.success).toBe(false)
  })
})

describe('isBatchRequest', () => {
  it('returns true for batch request', () => {
    const request = {
      events: [{ type: 'page_view', clientId: 'test', pageId: 'test' }],
    } as { events: MetricsClientEvent[] }

    expect(isBatchRequest(request)).toBe(true)
  })

  it('returns false for single event request', () => {
    const request = {
      type: 'page_view',
      clientId: 'test',
      pageId: 'test',
    } as MetricsClientEvent

    expect(isBatchRequest(request)).toBe(false)
  })
})
