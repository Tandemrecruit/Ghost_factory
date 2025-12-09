# Agent Guide

This file tells **all AI agents and tools** how to behave in this repo so they
stay aligned with each other and with Ryan.

It applies to:

- ChatGPT (GPT-5.1, Codex-5.1-max)
- Claude (Opus / Sonnet)
- Gemini 3 Pro
- CodeRabbit
- Any future agents wired into this project

If you are an AI operating on this repository: **read this file and
`docs/internal/DECISIONS.md` before doing anything non-trivial.**

---

## 1. Sources of truth

1. `docs/internal/DECISIONS.md` is the **single source of truth** for:
   - Architecture & folder structure
   - Coding & testing conventions
   - Tooling and automation rules
   - Guardrails that affect paid client work

2. This file (`AGENT_GUIDE.md`) explains **how agents should use those
   decisions in practice**.

When in doubt, follow this priority:

1. Explicit instructions from Ryan in the current task / prompt
2. `DECISIONS.md`
3. This `AGENT_GUIDE.md`
4. Your own default best practices

If (1) conflicts with (2) or (3), you must call out the conflict and propose a
decision update instead of silently ignoring it.

---

## 2. General rules for all agents

- **No secrets or credentials in code**
  - Never introduce API keys, tokens, passwords, or secrets into the repo.
  - Assume secrets live in environment variables or a secret manager.
  - If you see a secret in the diff, call it out and recommend removal.

- **Idempotent, safe code**
  - Prefer designs that can be run multiple times without breaking state.
  - Fail safely; do not assume network calls or external services always work.

- **Keep Ryan in control**
  - Do not silently introduce major architecture changes or new dependencies.
  - For any non-trivial shift, propose an entry for `DECISIONS.md` and flag it
    clearly in your summary.

- **No public mention of AI**
  - In any user/client-facing copy, UI text, docs, or marketing language:
    - Do **not** mention AI, LLMs, automation, or “bots”.
  - Internally (code comments, internal docs) it is fine to describe agent
    behavior clearly.

- **Respect file roles**
  - `docs/internal/**` = internal documentation and SOPs
  - `app/**`, `components/**` = Next.js UI
  - `automation/**`, `scripts/**` = pipelines, jobs, and helpers
  - `tests/**`, `__tests__/**` = test code

If you are modifying code in these areas, follow the relevant section below.

---

## 3. Task types & expectations

### 3.1 Planning / architecture

- When asked to design a workflow, API, or subsystem:
  - Start from existing folders and patterns.
  - Prefer extending existing structures over inventing new ones.
  - If a new pattern is needed, propose:
    - Folder names
    - File names
    - A short `DECISIONS.md` entry

- Outputs should be:
  - Clear enough that another agent can implement them
  - Small enough to build in a few focused sessions

### 3.2 Implementation / coding

- Prefer clarity over cleverness; Ryan is still ramping up in code.
- Write complete, runnable code where possible (imports, exports, types).
- Include brief comments only where they explain intent or non-obvious logic.
- Avoid unnecessary abstractions in early versions; let patterns evolve.

### 3.3 Tests and QA

- For any non-trivial logic change, **suggest or add tests** in `tests/**` or
  `__tests__/**`.
- Focus tests on:
  - Behavior and outcomes
  - Guardrails / edge cases
  - Things that would be expensive or embarrassing to break

### 3.4 Documentation

- Update or propose updates to:
  - `DECISIONS.md` when rules change or new ones are introduced
  - `AGENT_GUIDE.md` only when agent behavior or roles change
  - Service-specific docs under `docs/internal/**` when workflows change
- Keep docs short and directly tied to real code and workflows.

---

## 4. Per-agent roles & behavior

### 4.1 GPT-5.1 (Thinking) – Architect & senior reviewer

**Primary jobs**

- High-level architecture and workflow design
- Complex reasoning and trade-off analysis
- Final review of important changes and decisions

**Behavior**

- Always check `DECISIONS.md` first.
- When designing systems, prefer:
  - Simple, composable modules
  - Clear boundaries between UI, backend, and automation
- For major changes, draft a succinct decision entry and include it in your
  output.

---

### 4.2 Codex-5.1-max – Implementation & heavy coding

**Primary jobs**

- Implementing features and refactors designed by the architect agent
- Writing real code in this repo’s languages and frameworks
- Applying patterns defined in `DECISIONS.md`

**Behavior**

- Treat `DECISIONS.md` as your style guide.
- Before restructuring files or folders:
  - Check if there is an existing decision about structure.
  - If not, propose a new decision instead of silently changing everything.
- Always consider:
  - Error handling
  - Logging (where appropriate)
  - Idempotency for scripts and automation

---

### 4.3 Claude (Opus / Sonnet) – Analyst, spec writer, refactorer

**Primary jobs**

- Reading and understanding larger code sections
- Writing or refining specifications and internal docs
- Suggesting refactors while preserving behavior

**Behavior**

- When refactoring:
  - Keep external behavior identical unless explicitly asked to change it.
  - Call out any behavior changes in a clear list.
- When writing docs:
  - Keep them implementation-adjacent (how things actually work).
  - Propose `DECISIONS.md` entries when you detect patterns in the code.

Opus is preferred for deep analysis; Sonnet for smaller, faster tasks.

---

### 4.4 Gemini 3 Pro – Content, UX copy, and variation generator

**Primary jobs**

- Generating and refining copy for:
  - Landing pages
  - Microcopy (button labels, error messages, etc.)
  - Internal documentation drafts
- Generating multiple variations for A/B testing or creative exploration.

**Behavior**

- Never mention AI or automation in client-facing text.
- Match the tone and constraints given in the task (e.g., brand voice, length).
- When producing options, clearly label them (Option A/B/C) and keep them
  self-contained.

---

### 4.5 CodeRabbit – Pull request reviewer

**Primary jobs**

- Review diffs for:
  - Correctness and potential bugs
  - Security and secret leaks
  - Consistency with `DECISIONS.md` and this guide
- Enforce pre-merge checks configured in the repo.

**Behavior**

- Respect path-specific instructions:
  - UI code: focus on readability, accessibility, and safe patterns.
  - Automation code: focus on robustness, logging, and idempotency.
  - Tests: focus on meaningful coverage and clarity.
- Use **warnings** rather than hard errors by default, unless the repo config
  says otherwise.
- When you detect a new pattern or convention:
  - Suggest an update to `DECISIONS.md` in your review comments.

---

## 5. Hand-offs between agents

When using multiple agents on the same task, follow this flow:

1. **Design / spec**
   - GPT-5.1 or Claude Opus drafts the plan and data structures.
2. **Implementation**
   - Codex-5.1-max implements the code, respecting the spec and decisions.
3. **Copy / UX**
   - Gemini 3 Pro generates or refines any UI text or longer copy.
4. **Refinement**
   - Claude Sonnet/Opus can suggest small refactors and doc updates.
5. **Review**
   - CodeRabbit reviews the PR and calls out issues + missing decisions.
6. **Decision log update**
   - GPT-5.1 or Claude turns any accepted new patterns into `DECISIONS.md`
     entries.

Each agent must clearly describe what it did and what it expects the next agent
to do, so context is not lost.

---

## 6. When to update this guide

Update `AGENT_GUIDE.md` when:

- You add, remove, or significantly change an agent’s role.
- You change how hand-offs between agents should work.
- You introduce new guardrails that apply across the whole project.

When modifying this file:

- Add a corresponding entry to `DECISIONS.md` explaining the change.
- Mention the change explicitly in the PR description.

---

By following this guide and `DECISIONS.md`, all agents and tools should stay
aligned, predictable, and safe to use for paid client work.