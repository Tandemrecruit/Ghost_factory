# Decisions Log

Single source of truth for **long-lived decisions** in this repo:
- Architecture & folder structure
- Code style & patterns
- Testing strategy
- Tooling & automation (CodeRabbit, CI, agents)
- Guardrails for paid client work

If a decision should still matter a month from now, it belongs here.

---

## How to use this log

**For humans**

- Add a new entry whenever you:
  - Introduce a new pattern or convention
  - Change how folders or files are organized
  - Change how tools/agents (CodeRabbit, CI, LLMs) should behave
  - Tighten or relax any guardrail that affects client deliverables
- Keep entries **short and specific** (aim for 3–10 bullets).
- Never rewrite history; instead, add a new entry and mark the old one as
  `Deprecated` if it’s no longer valid.

**For AI agents (all models)**

When proposing or generating changes:

1. **Read this file first.** Treat these decisions as higher priority than your own defaults.
2. If your suggestion **would change a decision**, you must:
   - Call out which decision is affected, and
   - Suggest a new entry (or update) in the “Proposed decisions” section.
3. When you implement a change that clearly introduces a new pattern or rule,
   you must:
   - Draft a new decision entry using the template below.
   - Mention it explicitly in your PR description.

---

## Entry naming & IDs

- Each decision gets an ID: `DEC-YYYYMMDD-XXX`
  - `YYYYMMDD` = date the decision was made
  - `XXX` = incremental number for that day starting from `001`
- Put **newest entries at the top** of each section.

Example ID: `DEC-2025-12-09-001`

---

## Status values

- `Proposed` – idea or pattern under consideration
- `Active` – current rule of record; should be followed
- `Deprecated` – kept for history; no longer followed

---

## Decision entry template (copy/paste)

Use this template for each new decision entry:

## [DEC-YYYYMMDD-XXX] Short decision title

- **Status:** Active | Proposed | Deprecated  
- **Date:** YYYY-MM-DD  
- **Owner:** Ryan (human) | Agent name | Mixed  
- **Area:** Architecture | Workflow | Code Style | Testing | Tooling | Guardrails | Other  
- **Applies to:** brief list of folders/files or “entire repo”

**Summary**

- One or two sentences that explain the decision in plain language.

**Details**

- Bullet 1
- Bullet 2
- Bullet 3 (optional)

**Rationale**

- Why this decision exists (tradeoffs, constraints, or real problems it solves).

**Implications for agents**

- How GPT-5.1 / Codex / Claude / Gemini should apply this.
- What they must **avoid** suggesting if it would violate this decision.
- Any prompts or patterns they should prefer.

**Examples**

- Good: short concrete example of following the decision.
- Bad: short example of what not to do (if helpful).

---

## Active decisions

### [DEC-2025-12-09-001] This file is the single source of truth for repo rules

- **Status:** Active  
- **Date:** 2025-12-09  
- **Owner:** Ryan  
- **Area:** Workflow  
- **Applies to:** Entire repo

**Summary**

- All long-lived conventions and rules for this repo must be captured in
  `docs/internal/DECISIONS.md` so humans and agents stay aligned.

**Details**

- Any change that affects architecture, patterns, or workflows should result in
  either:
  - a new decision entry, or
  - an update to the status of an existing one.
- PR descriptions should reference any decisions they add or change.
- CodeRabbit, CI, and other agents should assume this file overrides their
  default style preferences.

**Rationale**

- Keeps multiple models and tools from drifting in different directions.
- Makes it easy to audit “why is it like this?” later.

**Implications for agents**

- Before suggesting a new pattern, agents should quickly scan this file.
- If a suggestion conflicts with an existing decision, agents should:
  - highlight the conflict, and
  - draft an updated or replacement decision for review.

---

### [DEC-2025-12-09-002] CodeRabbit review scope and behavior

- **Status:** Active  
- **Date:** 2025-12-09  
- **Owner:** Ryan  
- **Area:** Tooling  
- **Applies to:** CodeRabbit configuration, PR reviews

**Summary**

- CodeRabbit should focus on **meaningful quality issues** and alignment with
  this log, not nitpicking or blocking progress.

**Details**

- CodeRabbit runs with an **assertive** profile but should:
  - Prioritize correctness, security, and maintainability over style nits.
  - Respect folder-specific instructions (UI, automation, tests).
  - Treat this decisions log as the authoritative style and workflow guide.
- Pre-merge checks start as **warnings**, not hard errors, while the system is
  still evolving.

**Rationale**

- You’re building a paid-deliverable system; quality matters.
- At the same time, hard blocks can slow iteration while patterns are still
  stabilizing.

**Implications for agents**

- When CodeRabbit suggests changes, other agents (and humans) should interpret
  them in the context of this file.
- If CodeRabbit suggestions repeatedly contradict a decision here, update
  either:
  - this decision (if the decision is wrong), or
  - CodeRabbit path instructions and add a new decision explaining the change.

---

## Proposed decisions

(Add future ideas here with `Status: Proposed` until you’re sure you want them.)

## Deprecated decisions

(When a decision is replaced, move it here and mark `Status: Deprecated` rather
than deleting it.)