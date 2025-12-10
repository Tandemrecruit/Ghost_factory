# Ghost Factory â€“ Agent Alignment Document

**Version:** 1.0
**Last Updated:** 2025-12-10
**Purpose:** Global "constitution" for all external coding agents working in this repository.

---

## 1. Project Overview

Ghost Factory is an **internal landing-page factory tool** that automatically generates high-converting landing pages for clients using:

- A file-based client directory structure under `clients/<client-id>/`
- A Python automation pipeline in `automation/`
- A Next.js 15 app with a component library
- Multiple prompt files for individual sub-agents (router, critics, palette generator, etc.)

**Important clarifications:**

- Ghost Factory is built for **internal use** to quickly generate client landing pages using AI agents and a component library.
- It is **not** a public SaaS product (yet).
- The system watches for client intake files and orchestrates multiple AI agents to produce a complete, renderable landing page.

---

## 2. Current Milestone â€“ v1.0

### What v1.0 IS

v1.0 is a **single reliable happy path**:

> Take one demo client (`demo-hvac`) from raw intake through the full pipeline to a rendered page at `/clients/demo-hvac` with no runtime errors.

When this works end-to-end on a fresh machine, v1.0 is **done**.

### What is IN SCOPE for v1.0

| Area | v1.0 Requirement |
|------|------------------|
| **Clients** | Single demo client (`demo-hvac`) |
| **Intake** | Manual copy of raw answers into `clients/<client-id>/intake-raw.md` |
| **Sanitization** | `intake_sanitizer.py` converts `intake-raw.md` â†’ `intake.md` |
| **Architect** | Router classifies niche; Strategist generates `brief.md` |
| **Visual Designer** | Generates `theme.json` with basic colors/fonts |
| **Copywriter** | Generates `content.md` from the brief |
| **Critics** | Strategy Critic and Copy Critic enforce quality with PASS/FAIL loops |
| **Builder** | Generates `page.tsx` using only manifest components |
| **QA (minimal)** | Dev server runs; page renders; required sections exist |

### What is OUT OF SCOPE for v1.0

These belong to v1.5+ and must NOT be implemented unless explicitly requested:

- Multi-client management or client indexing pages
- Automated syncing from Google Sheets to `intake-raw.md`
- Advanced analytics, CTR tracking, conversion dashboards
- A/B variants and experiments
- Playwright screenshot automation (code exists but not v1.0 requirement)
- Vision model visual QA (code exists but not v1.0 requirement)
- Discord notifications (code exists but not v1.0 requirement)
- Auto git commit/push (code exists but not v1.0 requirement)
- Full "studio" UI or admin dashboards
- Public SaaS features (auth, billing, user accounts)

---

## 3. Canonical v1.0 Client Pipeline

### Stage 1: Raw Intake Collection

1. Client fills a Google Form (outside this repo).
2. Responses are stored in Google Sheets.
3. **Manual step:** Human copies answers into `clients/<client-id>/intake-raw.md`.

### Stage 2: Intake Sanitization

**Script:** `automation/intake_sanitizer.py`

**CLI usage:**

```bash
python automation/intake_sanitizer.py clients/<client-id>/intake-raw.md
```

**Behavior:**
- Reads `intake-raw.md`
- Calls OpenAI (model: `gpt-5-nano-latest` by default) with a structured system prompt
- Produces `intake.md` with these **exact sections**:
  - Client Overview
  - Core Messaging
  - Page Requirements
  - Assets & Constraints
  - Project Logistics
  - Notes from Client
- Archives the original file as `intake-source.md`

### Stage 3: Architect Stage

**Function:** `factory.py:run_architect()`

**Substeps:**
1. **Router** (`prompts/router.md`) classifies the client into a niche:
   - `SAAS_B2B` â†’ `strategy/saas.md`
   - `LOCAL_SERVICE` â†’ `strategy/local_service.md`
   - `ECOMMERCE_DTC` â†’ `strategy/ecommerce.md`
   - `PERSONAL_BRAND` â†’ `strategy/personal_brand.md`
   - `WEBINAR_FUNNEL` â†’ `strategy/webinar.md`

2. **Strategist** (Claude Opus) generates:
   - `brief.md` (working copy)
   - `brief.orig.md` (immutable original)

3. **Strategy Critic** (`prompts/critique/strategy_critic.md`) reviews the brief:
   - Returns `PASS` or `FAIL: [issues]`
   - On FAIL, feeds feedback back to Strategist for retry (max 3 attempts)

4. **Visual Designer** (runs in parallel):
   - Uses `prompts/design/palette_generator.md`
   - Generates `theme.json` with colors, fonts, and styling values
   - **A11y Critic** (`prompts/critique/a11y_critic.md`) validates color contrast

### Stage 4: Copywriter Stage

**Function:** `factory.py:run_copywriter()`

**Behavior:**
- Reads `brief.md` and `intake.md`
- Produces:
  - `content.md` (working copy)
  - `content.orig.md` (immutable original)
- **Copy Critic** (`prompts/critique/copy_critic.md`) reviews content:
  - Checks for hallucinations, placeholder text, weak CTAs, forbidden terms
  - Returns `PASS` or `FAIL: [issues]`
  - On FAIL, retries with feedback (max 3 attempts)

### Stage 5: Builder Stage

**Function:** `factory.py:run_builder()`

**Behavior:**
- Consumes: `content.md`, `brief.md`, `theme.json`, `design-system/manifest.md`
- Generates: `app/clients/<client-id>/page.tsx`
- **Self-correcting loop:**
  1. Generate code
  2. Run TypeScript syntax check (`check_syntax()`)
  3. On syntax error: retry with error feedback
  4. On syntax pass: save file, run QA
  5. On QA fail: retry with visual feedback
  6. Max total attempts: 6 (3 syntax + 3 visual)

**Critical rule:** Builder MUST only use components from `design-system/manifest.md`. Do not invent new components.

### Stage 6: QA Expectations for v1.0

**Minimum requirements:**
- `npm run dev` starts without crashing
- Visiting `/clients/<client-id>` renders without runtime errors
- The page includes core sections:
  - Hero (headline + CTA)
  - Problem/Solution
  - Features/Benefits
  - Social proof placeholder
  - Final CTA

---

## 4. Source-of-Truth Files

All agents must treat these files as **primary reality**:

| File | Purpose |
|------|---------|
| `README.md` | Project overview and getting started |
| `.cursorrules` | Coding standards and protocols |
| `design-system/manifest.md` | Component library API reference |
| `automation/intake_sanitizer.py` | Intake schema and sanitization logic |
| `automation/factory.py` | Pipeline orchestration and stage logic |
| `prompts/router.md` | Niche classification rules |
| `prompts/critique/strategy_critic.md` | Brief validation rules |
| `prompts/critique/copy_critic.md` | Content validation rules |
| `prompts/critique/a11y_critic.md` | Accessibility validation rules |
| `prompts/design/palette_generator.md` | Theme generation rules |
| `prompts/strategy/*.md` | Niche-specific strategy prompts |
| `docs/internal/AGENT_ALIGNMENT.md` | This document |
| `docs/internal/ghost-factory-agent-rules.md` | Practical coding rules |

### Conflict Resolution Rule

**Repo files > Memory > External context**

If there is a conflict between:
- What you remember from previous conversations
- What older documentation says
- What the actual code does

**The repository files win.**

Do NOT "fix" code to match outdated docs. Instead:
1. Assume the code is ground truth
2. Note the mismatch in your response
3. Suggest a documentation update if appropriate

---

## 5. Global Behavior Rules for All Agents

### Before Making Changes

1. **Read relevant repo files first.** Never design or modify behavior without understanding current implementation.
2. **Check the manifest** (`design-system/manifest.md`) before adding or using components.
3. **Review `.cursorrules`** for coding standards.
4. **Check this document** for scope boundaries.

### Priority Order

```text
Repo Files > Memory > External Chat Context
```

### Scope Discipline

- Do NOT silently expand scope beyond v1.0.
- If code contains stubs for v1.5+ features (Playwright, Discord, etc.), treat them as **future work** unless explicitly instructed to activate them.
- Do NOT hallucinate new directories, components, or config files that aren't present in the repo.

### Handling Out-of-Scope Requests

If asked to implement features outside v1.0 scope (multi-client, analytics dashboards, A/B tests, etc.):

1. **State clearly:** "This is out of scope for v1.0."
2. **Optionally outline** how it could be approached in v1.5+.
3. **Keep actual code changes** strictly within v1.0 behavior.

### Client Isolation

- **Never cross-contaminate** client data.
- If working on `demo-hvac`, do not read files from other client folders.
- Validate client IDs before any file operations.

### Code Quality

- Prefer Server Components by default.
- Client Components: use `'use client'` only for interactivity.
- Images: use `next/image` for all images.
- Links: use `next/link` for all links.
- Icons: source from `lucide-react` only.
- Colors: avoid hardcoded hex; use Tailwind variables.
- Tags: no `<img>` or `<a>` tags permitted.
- Placeholder text: avoid Lorem Ipsum.

## Using docs/DECISIONS_INBOX.md (for all agents)

The Decisions Inbox is the **staging area** for thoughts and potential decisions. It exists so Ryan and the agents donâ€™t have to remember everything in their heads.

### Inbox legend

Each bullet in `docs/DECISIONS_INBOX.md` must start with one of:

- **[NOTE]** â€“ Brain dump, observation, or reminder  
  - â€œThis might matter later.â€
  - Safe place for models to say â€œhey, watch thisâ€ without changing any rules.

- **[PROPOSAL]** â€“ Suggested decision or rule change  
  - â€œWe *should probably* make this an explicit rule.â€
  - Used when an agent spots a consistent pattern that deserves a formal decision.

- **[DECISION]** â€“ Approved decision, ready to be logged as a D-XXXX  
  - **Only Ryan** is allowed to mark an item as `[DECISION]`.
  - The Decisions Scribe promotes these into `docs/DECISIONS_LOG.md`.

### Rules for all agents

- You **MAY add** new `[NOTE]` and `[PROPOSAL]` bullets to `DECISIONS_INBOX.md` when you:
  - Notice a mismatch between docs and code.
  - Think a behavior should be standardized (e.g., error-handling style, stack choices).
  - Want to remind Future Ryan about a potential improvement or risk.

- You **MUST NOT**:
  - Change `[NOTE]` or `[PROPOSAL]` items into `[DECISION]`.
  - Edit existing D-XXXX entries in `DECISIONS_LOG.md`.
  - Treat `[NOTE]` or `[PROPOSAL]` as if they are already binding rules.

### How the pipeline uses the inbox

- Ryan reviews `[NOTE]` / `[PROPOSAL]` items and, when ready, turns selected bullets into `[DECISION]`.
- The **Decisions Scribe** agent:
  - Reads `DECISIONS_INBOX.md` and `DECISIONS_LOG.md`.
  - Converts only `[DECISION]` bullets into new `D-XXXX` entries.
  - Cleans them out of the inbox, leaving `[NOTE]` and `[PROPOSAL]` untouched.

### When you should add a note or proposal

As an agent, add a `[NOTE]` or `[PROPOSAL]` when, for example:

- You see behavior in `factory.py` or `intake_sanitizer.py` that **isnâ€™t documented** in AGENT_ALIGNMENT yet.
- You think a recurring pattern should be codified (e.g., â€œQA can return FAIL/ERROR/SKIPPED as long as the page still rendersâ€).
- You suspect a future conflict or ambiguity (â€œBuilder is using a pattern that isnâ€™t reflected in the manifestâ€).

Use the inbox as the **scratchpad for future decisions**, but remember:  
**Only logged D-XXXX entries and the alignment docs define the current rules.**

---

## 6. How to Use This Document in Prompts

### For the Human Owner

When prompting external coding assistants (Claude, GPT, Codex, Gemini, etc.), include a reference to this document.

### Suggested Prompt Snippet

```text
Before making any changes, read and obey docs/internal/AGENT_ALIGNMENT.md.
Restate the v1.0 client pipeline in your own words before doing any work.
If you encounter any conflicts between docs and code, treat the code as ground truth.
```

### Longer Context Snippet

```text
You are working on Ghost Factory v1.0.

Key files to read:
- docs/internal/AGENT_ALIGNMENT.md (constitution)
- docs/internal/ghost-factory-agent-rules.md (practical rules)
- design-system/manifest.md (component library)
- .cursorrules (coding standards)

Scope: Single demo client (demo-hvac) flowing from intake-raw.md â†’ intake.md â†’ brief.md â†’ content.md â†’ page.tsx â†’ rendered page.

Do NOT implement: multi-client, analytics dashboards, A/B tests, experiments, or features marked as v1.5+.
```

---

## 7. Definition of "Done" for v1.0

v1.0 is complete when:

- [ ] A fresh clone can `npm install` and `pip install -r requirements.txt` successfully
- [ ] `clients/demo-hvac/intake-raw.md` exists with realistic demo content
- [ ] `python automation/intake_sanitizer.py clients/demo-hvac/intake-raw.md` produces `intake.md`
- [ ] `python automation/factory.py` processes `demo-hvac` and produces `brief.md`, `content.md`, and `page.tsx`
- [ ] `npm run dev` starts the Next.js server without errors
- [ ] Visiting `http://localhost:3000/clients/demo-hvac` renders a page with all required sections
- [ ] No runtime errors in the browser console

---

## Appendix A: File State Conventions

| File | State | Meaning |
|------|-------|---------|
| `intake-raw.md` | Present | Raw intake waiting to be sanitized |
| `intake.md` | Present | Sanitized intake ready for pipeline |
| `intake-source.md` | Present | Archived original raw intake |
| `intake-processed.md` | Present | Pipeline completed (intake renamed) |
| `brief.md` | Present | Strategy brief generated |
| `brief.orig.md` | Present | Immutable original AI output |
| `content.md` | Present | Website copy generated |
| `content.orig.md` | Present | Immutable original AI output |
| `theme.json` | Present | Color/typography theme generated |
| `page.tsx` | Present | Page component generated |

## Appendix B: Model Configuration (Reference)

| Role | Model | Purpose |
|------|-------|---------|
| Strategy | `claude-opus-4-5` | Complex reasoning, brand analysis |
| Coder | `claude-sonnet-4-5` | Code generation |
| Copy | `claude-sonnet-4-5` | Creative writing |
| QA | `claude-haiku-4-5` | Visual inspection |
| Router | `claude-haiku-4-5` | Fast classification |
| Critic | `claude-sonnet-4-5` | Quality review |
| Sanitizer | `gpt-5-nano-latest` | Structured extraction |

---

*This document is the single source of truth for agent behavior in Ghost Factory v1.0. When in doubt, read the repo.*
