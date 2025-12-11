# Ghost Factory "“ Agent Rules for Coding Assistants

**Version:** 1.0

**Last Updated:** 2025-12-10

**Purpose:** Practical checklist and rules for external coding agents (Claude, GPT, Codex, Gemini) working in this repository.

> **Always read [`AGENT_ALIGNMENT.md`](./AGENT_ALIGNMENT.md) first.**

> This file is the practical "how to behave" companion to that constitution.

---

## 1. Scope Reminder "“ v1.0

**You are working on Ghost Factory v1.0.**

Your job is to help make the **single demo client pipeline** work end-to-end:

```text

intake-raw.md → intake.md → brief.md → content.md → page.tsx → rendered page

```

### You ARE Here To

- Fix bugs in the existing pipeline
- Improve code quality within v1.0 scope
- Ensure the demo client (`demo-hvac`) renders correctly
- Help the pipeline stages work reliably

### You Are NOT Here To

- Implement multi-client workflows
- Build analytics tracking systems
- Create A/B testing infrastructure
- Build admin dashboards
- Add Discord/Slack notifications
- Implement automated git commits
- Add Google Sheets integrations

If asked about these features, say: **"This is out of scope for v1.0."**

---

## 2. File & Pipeline Awareness

### Key Files You Must Know

| File | Purpose | Read Before... |

|------|---------|----------------|

| `README.md` | Project overview | Starting any work |

| `.cursorrules` | Coding standards | Writing any code |

| `design-system/manifest.md` | Component API | Editing page generation |

| `automation/intake_sanitizer.py` | Intake schema | Changing intake logic |

| `automation/factory.py` | Pipeline orchestration | Modifying any pipeline stage |

| `prompts/router.md` | Niche classification | Touching router logic |

| `prompts/critique/copy_critic.md` | Content validation | Editing critic behavior |

| `prompts/critique/strategy_critic.md` | Brief validation | Editing critic behavior |

| `prompts/design/palette_generator.md` | Theme generation | Changing visual design |

| `docs/internal/AGENT_ALIGNMENT.md` | Agent constitution | Any significant change |

### v1.0 Pipeline Summary

```text

1. intake-raw.md       (manual: human copies from Google Sheets)

        ↓

2. intake_sanitizer.py (GPT-5 Nano normalizes to fixed schema)

        ↓

3. intake.md           (canonical input for all stages)

        ↓

4. run_architect()     (Router → Strategist → Strategy Critic → brief.md)

   └── Visual Designer (parallel: theme.json)

        ↓

5. run_copywriter()    (Copywriter → Copy Critic → content.md)

        ↓

6. run_builder()       (Builder → Syntax Check → page.tsx)

        ↓

7. run_qa()            (Server check → page renders)

        ↓

8. finalize_client()   (rename intake.md → intake-processed.md)

```

### Client Directory Structure

```text

clients/demo-hvac/

├── intake-raw.md       # Raw form answers (input)

├── intake.md           # Sanitized intake (generated)

├── intake-source.md    # Archived original (generated)

├── brief.md            # Strategy brief (generated)

├── brief.orig.md       # Original AI output (generated)

├── content.md          # Website copy (generated)

├── content.orig.md     # Original AI output (generated)

├── theme.json          # Color/font theme (generated)

└── assets/             # Client images (optional)

```

---

## 3. Rules for Changing Code

### DO

- Keep changes small, focused, and related to the v1.0 pipeline
- Preserve existing function signatures unless you update all callers
- Maintain compatibility with the `intake.md` schema from `intake_sanitizer.py`
- Use only components from `design-system/manifest.md` in generated pages
- Validate client IDs before file operations (use `client_utils.py` helpers)
- Use `atomic_write()` from `file_utils.py` for file writes
- Follow the "Processed" protocol: rename trigger files after completion
- Test changes against the `demo-hvac` client

### DO NOT

- Introduce new external dependencies without stated justification
- Implement multi-client routing or client index pages
- Implement new analytics/metrics storage systems
- Implement A/B testing, variants, or experiment infrastructure
- Implement Playwright visual QA beyond simple fixes to existing code
- Implement Discord/Slack notifications for v1.0
- Implement auto git commit/push for v1.0
- Create new components not in the manifest
- Cross-contaminate client data (read from one client while working on another)
- Use hardcoded hex colors (use Tailwind variables)
- Use `<img>` tags (use `next/image`)
- Use `<a>` tags (use `next/link`)
- Add Lorem Ipsum or placeholder text

---

## 4. Rules for Using Prompt Files

### Router (`prompts/router.md`)

- Input: Client intake text
- Output: **One of exactly these values:**
  - `SAAS_B2B`
  - `LOCAL_SERVICE`
  - `ECOMMERCE_DTC`
  - `PERSONAL_BRAND`
  - `WEBINAR_FUNNEL`
- Do NOT change the output format or add new categories without updating `factory.py:select_niche_persona()`

### Strategy/Copy Critics (`prompts/critique/*.md`)

- Output must start with either `PASS` or `FAIL:`
- `PASS` = content approved, proceed to next stage
- `FAIL: [list]` = content rejected, retry with feedback
- Do NOT change the PASS/FAIL contract
- Do NOT add new response formats

### Palette Generator (`prompts/design/palette_generator.md`)

- Must output valid JSON with this schema:

  ```json
  {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX",
    "background": "white" | "slate-900" | "stone-100",
    "font_heading": "Inter" | "Playfair Display" | "Space Grotesk",
    "font_body": "Inter" | "Lato",
    "border_radius": "0.5rem" | "0px" | "1.5rem",
    "source": "intake" | "generated"
  }
  ```

- **Critical:** If the intake specifies brand colors, use them. Set `"source": "intake"`.
- Only generate colors if none are provided. Set `"source": "generated"`.

### Editing Prompt Files

If you edit any prompt file:

1. Preserve the output structure and contract
2. You may improve wording, examples, or clarity
3. Add a comment at the top noting what changed and why
4. Do NOT change the expected output format without updating all consumers in `factory.py`

---

## 5. Rules for Components

### Using the Manifest

The Builder must ONLY use components from `design-system/manifest.md`.

**Before generating a page:**

1. Read `design-system/manifest.md`
2. Identify which components match the content sections
3. Use exact prop names and types from the manifest
4. Do NOT invent new components or props

### Component Categories Available

| Category | Components |

|----------|------------|

| Hero | `HeroSimple`, `HeroSplit` |

| Features | `FeatureGrid`, `FeatureSteps`, `BentoGrid` |

| Trust | `TestimonialCards`, `StatsHighlight`, `TrustBadges`, `LogoCloud` |

| Pricing | `PricingSimple`, `PricingTiers` |

| FAQ | `FaqAccordion`, `GuaranteeBlock` |

| Contact | `ContactForm`, `NewsletterSignup` |

| Navigation | `NavSimple`, `FooterSimple` |

| Utility | `SectionWrapper`, `CtaBanner` |

| Media | `VideoEmbed`, `ComparisonTable`, `TeamGrid` |

| Analytics | `MetricsProvider` |

### Metrics Tracking Attributes

For v1.0, use default `blockId` values. The manifest defines:

- `data-gf-block` for section identification
- `data-gf-cta` for CTA click tracking
- Do NOT implement custom tracking logic for v1.0

---

## 6. Drift & Conflict Handling

### When Docs and Code Disagree

If you find that:

- README says one thing but `factory.py` does another
- `intake_sanitizer.py` schema doesn't match what docs claim
- Existing code contradicts these rules

**Follow this protocol:**

1. **Assume the code is ground truth** (not the docs)
2. **Do NOT rewrite behavior** to match old documentation
3. **Call out the mismatch** in your response
4. **Suggest a doc update** if appropriate
5. **Ask the human** if you're unsure which is correct

### Example Response

```text

I noticed that the README mentions "intake.md is renamed to intake-processed.md

at the end of the pipeline," but factory.py:finalize_client() currently does this.

I'll proceed with the code's behavior. Should I update the README to clarify this?

```

### Handling Ambiguity

When requirements are unclear:

1. State your assumptions explicitly
2. Ask for clarification before making significant changes
3. Default to the simplest interpretation that fits v1.0 scope

---

## 7. Testing Your Changes

### Minimum Verification for v1.0

After any change, verify:

1. **Intake sanitization works:**

   ```bash

   python automation/intake_sanitizer.py clients/demo-hvac/intake-raw.md

   ```

   - Should produce `intake.md` and `intake-source.md`

2. **Pipeline completes:**

   ```bash

   python automation/factory.py

   ```

   - Should process `demo-hvac` without unhandled exceptions

3. **Dev server starts:**

   ```bash

   npm run dev

   ```

   - Should start without errors

4. **Page renders:**
   - Visit `http://localhost:3000/clients/demo-hvac`
   - Should load without runtime errors
   - Should show: Hero, Features, Social Proof, CTA sections

---

## 8. Short Snippet for Prompts

Copy this snippet when prompting any AI coding assistant:

```text

You are working on Ghost Factory v1.0.

GOAL: Make the single demo client pipeline work from intake-raw.md to a rendered page.

RULES:

- Read docs/internal/AGENT_ALIGNMENT.md before making changes
- Obey docs/internal/ghost-factory-agent-rules.md
- Use only components from design-system/manifest.md
- Treat repo files as source of truth over any prior context
- Stay inside v1.0 scope

DO NOT implement for v1.0:

- Multi-client features
- Analytics dashboards
- A/B tests or variants
- Discord notifications
- Auto git commit/push

If you encounter conflicts between docs and code, assume code is correct.

```

---

## Quick Reference Card

```text

v1.0 SCOPE

----------

YES: Single client (demo-hvac), intake→brief→content→page, basic QA

NO:  Multi-client, analytics, A/B tests, dashboards, notifications

KEY FILES

---------

Constitution:      docs/internal/AGENT_ALIGNMENT.md

Rules:             docs/internal/ghost-factory-agent-rules.md (this file)

Components:        design-system/manifest.md

Coding Standards:  .cursorrules

Pipeline:          automation/factory.py

Sanitizer:         automation/intake_sanitizer.py

CONFLICT RESOLUTION

-------------------

Priority: Repo Files > Memory > External Context

If docs ≠ code: Trust the code, suggest doc update

TESTING

-------

1. python automation/intake_sanitizer.py clients/demo-hvac/intake-raw.md
2. python automation/factory.py
3. npm run dev
4. Visit http://localhost:3000/clients/demo-hvac

```

---

*These rules ensure consistency across all coding assistants working on Ghost Factory v1.0.*
