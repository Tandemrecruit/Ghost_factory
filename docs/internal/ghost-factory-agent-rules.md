## Current v1.0 Pipeline (for External Coding Assistants)

You are working on Ghost Factory **v1.0**.

Do NOT redesign the pipeline from scratch. Work with this structure and stay inside the allowed scope.

### Stage 1 – Raw Intake (ALLOWED, but manual)

- Source: Google Form → Google Sheet (already exists).
- v1.0 behavior:
  - Ryan manually copies answers into `clients/<client-id>/intake-raw.md`.
- You MAY:
  - Assume `intake-raw.md` is the starting point.
- You MUST NOT:
  - Implement Google Sheets / Forms automation yet (that’s v1.5+).

### Stage 2 – Intake Sanitizer (ALLOWED for v1.0)

Script: `intake_sanitizer.py`

- Input: `clients/<client-id>/intake-raw.md`
- Output (canonical intake for all later stages): `clients/<client-id>/intake.md`
- Optional archive: `clients/<client-id>/intake-source.md`

Behavior for v1.0:

- Use GPT-5 Nano (or equivalent) to produce a normalized `intake.md` with these sections:
  - Client Overview
  - Core Messaging
  - Page Requirements
  - Assets & Constraints
  - Project Logistics
- It only needs to handle **one demo client type well** (e.g. a local HVAC company).
- Fail loudly (non-zero exit + clear error) if the input is missing or unusable.

You MUST:

- Keep `intake.md` as the canonical file read by later stages.
- NOT rename `intake.md` at the end of the pipeline in v1.0.

### Stage 3 – Architect (`factory.py:run_architect`) (ALLOWED with constraints)

- For v1.0:
  - Treat the router as fixed to a single niche (e.g. `local_service` / HVAC).
  - Strategist (Claude Opus) reads `intake.md` and writes:
    - `brief.md`
    - Optionally `brief.orig.md`
  - Strategy Critic may request up to ~3 retries, but the logic can be simple.

- Visual Designer:
  - MAY generate a simple `theme.json` (basic colors/fonts).
  - Do NOT build a complex theming system for multiple niches yet.

### Stage 4 – Copywriter (`factory.py:run_copywriter`) (ALLOWED with constraints)

- Reads `brief.md`.
- Writes:
  - `content.md`
  - Optionally `content.orig.md`.

Content for v1.0 MUST:

- Map cleanly to the fixed layout sections:
  - Hero
  - Problem / solution
  - Features / benefits
  - Social proof placeholder
  - Final CTA

You MUST NOT:

- Add advanced sections that require new components or layouts (pricing grids, complex multi-step timelines, etc.) unless explicitly approved.

### Stage 5 – Builder (`factory.py:run_builder`) (ALLOWED with constraints)

- Generates `page.tsx` using the existing component library.
- For v1.0:
  - Only needs to support ONE client and ONE layout style.
  - Basic self-check loop is allowed (syntax/TS check → simple repair attempt).

You MUST NOT:

- Implement multiple layouts based on niche or “layout style” settings.
- Implement variant/A/B logic.

### Stage 6 – QA & Finalization (PARTIAL; most is FUTURE)

For v1.0:

- QA requirements:
  - The dev server (`npm run dev`) starts successfully.
  - Visiting `/clients/<client-id>` renders without runtime errors.
- You MAY:
  - Add a simple script or test that verifies the page renders.

You MUST NOT implement for v1.0:

- Playwright screenshot capture.
- Vision-model-based visual QA.
- Discord notifications on completion.
- Automatic `git commit` / `git push`.
- Renaming `intake.md` → `intake-processed.md`.

Those behaviors belong to **v1.5+**.

---