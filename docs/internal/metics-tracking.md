# Ghost Factory Metrics Tracking (Internal)

Status: v1  
Owner: [YOU]  
Scope: Landing page performance tracking across client projects

---

## 1. Purpose

Ghost Factory needs real-world feedback to improve:

- Component design (heroes, pricing blocks, CTAs, etc.)
- Layout choices
- Copy patterns and CTA language

The metrics system exists to:

1. Give each client a simple, honest view of how their page performs.
2. Build an internal “pattern library of what works” based on actual data.
3. Stay privacy-friendly and lightweight enough to be safe on any client site.

This document defines the conventions that code, automation, and future agents must follow.

---

## 2. Event model

All metrics are modeled as anonymous events.

### 2.1 Event types (v1)

- `page_view`
- `cta_click`
- `conversion`

### 2.2 Core fields

Every event should be expressible in this shape (names may differ slightly in code):

- `type`: `page_view | cta_click | conversion`
- `timestamp`: ISO string generated server-side
- `clientId`: matches the client’s folder / route (`clients/[clientId]`)
- `pageId`: identifies an individual landing page (may equal `clientId` if there is only one)
- `blockId` (optional): identifies the section or component that fired the event
- `variantId` (optional): identifies A/B variants or experimental versions
- `metadata` (optional): extra JSON-safe fields (e.g. `{ "cta_label": "Book a free call" }`)

Constraints:

- No PII. Do not store user names, emails, phone numbers, or raw form contents here.
- No per-user identities. Events are aggregated by page and block, not by person.

---

## 3. Frontend conventions

### 3.1 Data attributes

We use data attributes in the rendered HTML to connect components to events:

- `data-gf-block="<block-id>"`  
  Set on the root element of important sections (heroes, pricing, CTA banners, etc.).
  Examples:
  - `hero_simple_v1`
  - `hero_split_v1`
  - `pricing_simple_v1`
  - `cta_banner_v1`

- `data-gf-cta="primary"`  
  Set on the primary call-to-action elements (buttons/links).

- `data-gf-conversion="primary"`  
  Set on the element that represents a successful conversion (e.g. a submit button or a confirmation action).

Optional helper attributes:

- `data-gf-cta-label="Book a free call"`  
  If present, use this for `metadata.cta_label` instead of inferring from `innerText`.

### 3.2 Component APIs

Key components in `components/` and the design system should expose an optional `blockId?: string` prop.

Rules:

1. Each component that represents a meaningful section should:
   - Accept `blockId` with a default (e.g. `hero_simple_v1`).
   - Render its wrapper with `data-gf-block={blockId}`.

2. The automation pipeline can override `blockId` when instantiating components for:
   - A/B tests
   - Custom layouts per client
   - Future experiments

All block IDs must be documented in `design-system/manifest.md` so agents and prompts can refer to them consistently.

---

## 4. Client-side tracking helper

A helper module (e.g. `lib/metrics.ts`) is responsible for sending events to the server.

### 4.1 Public functions

- `trackPageView({ clientId, pageId, blockId?, variantId?, metadata? })`
- `trackCtaClick({ clientId, pageId, blockId?, variantId?, metadata? })`
- `trackConversion({ clientId, pageId, blockId?, variantId?, metadata? })`

Expectations:

- Safe to call from client components only.
- No-op when metrics are disabled via environment configuration.
- Use `navigator.sendBeacon` when available; otherwise `fetch` with `keepalive: true`.
- Never throw in production; failures are non-fatal.

### 4.2 Wiring pattern

For `/clients/[clientId]/`:

- A small client wrapper component is responsible for:
  - Reading `clientId` (and optional `pageId`) from props.
  - Calling `trackPageView` once per page load.
  - Attaching click/submit listeners that:
    - Detect `data-gf-cta="primary"` and `data-gf-conversion="primary"`.
    - Derive `blockId` from the nearest `data-gf-block` ancestor.
    - Pass through optional metadata (e.g. CTA label).

Keep SSR pages as server components; only the metrics wrapper uses `'use client'`.

---

## 5. Backend and configuration

### 5.1 API endpoint

Canonical endpoint: `/api/gf-track`

Responsibilities:

- Accept events via `POST`.
- Validate against the event schema.
- Return `204 No Content` on success, `4xx` on validation errors.

### 5.2 Env configuration

Env variables (defined in `.env.example`):

- `GF_METRICS_ENABLED=true`
- `GF_METRICS_WEBHOOK_URL=`
- `GF_METRICS_WEBHOOK_SECRET=`

Behavior:

- If `GF_METRICS_ENABLED` is not `true`:
  - Client helpers are no-ops.
  - API route may still validate but can short-circuit.

- If `GF_METRICS_ENABLED` is `true`:
  - In local/dev with no webhook URL:
    - Log events to the server console with a clear prefix:
      - Example: `[GF_METRICS_EVENT] { ... }`
  - With `GF_METRICS_WEBHOOK_URL` set:
    - Forward events to that URL as JSON batches.
    - If `GF_METRICS_WEBHOOK_SECRET` is set, include an auth header.

This keeps storage and analysis pluggable (Python pipeline, database, external service) without changing the frontend contract.

---

## 6. Client communication rules

When talking to clients:

- Describe this as **basic performance analytics**, not a full analytics suite.
- Be explicit that:
  - It is used to measure page performance (visits, clicks, conversions).
  - No personal form data is used in the performance logs.
  - It is not used for advertising or retargeting.

If you want to show client-specific numbers in marketing material, get their permission first.

---

## 7. How this feeds back into Ghost Factory

Over time, aggregate data should answer:

- Which hero variants have higher CTA CTR across projects?
- Which pricing layouts tend to convert better for certain offer types?
- Does a particular CTA style consistently outperform others?

Future internal work (not implemented in v1):

- A small dashboard that ranks components by performance.
- Tagging by niche/offer type so you can say:
  - “For service businesses, this hero variant usually performs best.”
- Using this data to update defaults in the design system and automation prompts.

---

## 8. Quick checklist before launch

For each new client page:

1. Confirm `GF_METRICS_ENABLED` is set appropriately.
2. Set a clear `pageId` for the main landing page.
3. Ensure the main sections have `blockId` defaults and `data-gf-block` attributes.
4. Verify the primary CTA has `data-gf-cta="primary"`.
5. Agree on what counts as a `conversion` and set `data-gf-conversion="primary"` on the correct element.
6. Double-check your public-facing explanation (email, proposal, or page copy) matches the behavior defined here.

Once that’s done, the numbers you see should line up with how you and the client talk about “results.”