# Ghost Factory Metrics Tracking (v1)

A lightweight, privacy-friendly metrics system for measuring landing page performance.

## Overview

The metrics system tracks three event types:
- **page_view** - Tracks when a client page is loaded
- **cta_click** - Tracks clicks on primary CTAs
- **conversion** - Tracks successful conversions (form submits, booking clicks)

### Privacy Principles

- No PII collected (no names, emails, phone numbers, or form contents)
- No cookies or localStorage used for tracking
- No ad pixels or remarketing integrations
- All data is anonymous and aggregate-friendly

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Enable/disable metrics collection
GF_METRICS_ENABLED=true

# Optional: Send events to an external webhook
GF_METRICS_WEBHOOK_URL=https://your-analytics-receiver.com/webhook

# Optional: Auth secret for webhook (sent as Bearer token)
GF_METRICS_WEBHOOK_SECRET=your-secret-here
```

### Behavior by Environment

| GF_METRICS_ENABLED | GF_METRICS_WEBHOOK_URL | NODE_ENV | Behavior |
|--------------------|------------------------|----------|----------|
| `false` | any | any | No-op (events accepted but not processed) |
| `true` | not set | development | Events logged to console with `[GF_METRICS_EVENT]` prefix |
| `true` | not set | production | Events validated but not persisted |
| `true` | set | any | Events POSTed to webhook URL |

## Event Schema

All events include:

```typescript
type MetricsEvent = {
  type: 'page_view' | 'cta_click' | 'conversion'
  timestamp: string       // ISO 8601, server-generated
  clientId: string        // From URL path /clients/[clientId]
  pageId: string          // Page identifier (usually same as clientId)
  blockId?: string        // Component that fired event (e.g., 'hero_simple_v1')
  variantId?: string      // For A/B testing
  metadata?: {            // Additional context
    [key: string]: string | number | boolean | null
  }
}
```

## Integration Points

### 1. Client Page Wrapper

For `/clients/[clientId]` pages, wrap content with `MetricsProvider`:

```tsx
// app/clients/[clientId]/page.tsx
import { MetricsProvider } from '@/components'

export default async function ClientPage({ params }) {
  const { clientId } = await params
  const metricsEnabled = process.env.GF_METRICS_ENABLED === 'true'

  return (
    <MetricsProvider clientId={clientId} enabled={metricsEnabled}>
      <NavSimple ... />
      <HeroSimple ... />
      <FeatureGrid ... />
      <CtaBanner ... />
      <FooterSimple ... />
    </MetricsProvider>
  )
}
```

The `MetricsProvider`:
- Automatically tracks page views on mount
- Listens for clicks on `data-gf-cta="primary"` elements
- Listens for form submits and clicks on `data-gf-conversion="primary"` elements
- Detects `blockId` from nearest `data-gf-block` ancestor

### 2. Component Block IDs

Key components now support a `blockId` prop:

| Component | Default blockId |
|-----------|-----------------|
| `HeroSimple` | `hero_simple_v1` |
| `HeroSplit` | `hero_split_v1` |
| `PricingSimple` | `pricing_simple_v1` |
| `CtaBanner` | `cta_banner_v1` |

These components automatically:
- Render `data-gf-block={blockId}` on their root element
- Render `data-gf-cta="primary"` on their primary CTA buttons

### 3. Manual Tracking

For custom scenarios, use the client API directly:

```tsx
'use client'
import { trackPageView, trackCtaClick, trackConversion } from '@/lib/metrics'

// Track custom events
trackCtaClick({
  clientId: 'ember-roasters',
  pageId: 'ember-roasters',
  blockId: 'custom_component',
  metadata: { cta_label: 'Get Started' }
})
```

### 4. Data Attributes

| Attribute | Purpose |
|-----------|---------|
| `data-gf-block="block_id"` | Identifies the component block |
| `data-gf-cta="primary"` | Marks element for CTA click tracking |
| `data-gf-cta-label="text"` | Override CTA label in metadata |
| `data-gf-conversion="primary"` | Marks element/form for conversion tracking |

## API Endpoint

**POST `/api/gf-track`**

Accepts single event or batch:

```json
// Single event
{
  "type": "page_view",
  "clientId": "ember-roasters",
  "pageId": "ember-roasters"
}

// Batch (up to 100 events)
{
  "events": [
    { "type": "page_view", "clientId": "ember-roasters", "pageId": "ember-roasters" },
    { "type": "cta_click", "clientId": "ember-roasters", "pageId": "ember-roasters", "blockId": "hero_simple_v1" }
  ]
}
```

Responses:
- `204 No Content` - Success
- `400 Bad Request` - Validation error

## Webhook Integration

When `GF_METRICS_WEBHOOK_URL` is set, events are POSTed as:

```json
POST https://your-webhook.com/endpoint
Authorization: Bearer {GF_METRICS_WEBHOOK_SECRET}
Content-Type: application/json

{
  "events": [
    {
      "type": "page_view",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "clientId": "ember-roasters",
      "pageId": "ember-roasters"
    }
  ]
}
```

This allows you to connect to any backend (Python pipeline, data warehouse, etc.) without changing client code.

## Testing

Run metrics tests:

```bash
npm test
```

Tests cover:
- Schema validation (15 tests)
- API route behavior (10 tests)
- Client-side helpers (14 tests)

## Files Changed

```
lib/
├── metrics.ts           # Client-side tracking helpers
├── metrics-schema.ts    # Zod schemas for events

app/api/gf-track/
└── route.ts             # API endpoint

components/
├── MetricsProvider.tsx  # Page wrapper with auto-tracking
├── HeroSimple.tsx       # + blockId prop
├── HeroSplit.tsx        # + blockId prop
├── PricingSimple.tsx    # + blockId prop
├── CtaBanner.tsx        # + blockId prop
└── index.ts             # + MetricsProvider export

tests/ts/
├── metrics-schema.test.ts
├── metrics-client.test.ts
└── gf-track-route.test.ts
```

## Future Extensions

The schema includes `variantId` for A/B testing support. When needed:

1. Pass `variantId` to `MetricsProvider`
2. Override component `blockId` with variant suffix (e.g., `hero_simple_v1_variant_b`)
3. Analyze conversion rates by variant in your analytics backend
