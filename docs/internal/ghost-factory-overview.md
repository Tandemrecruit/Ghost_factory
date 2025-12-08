# Ghost Factory – Internal Service Overview

> Internal use only. This file is for me and future collaborators. Never share this file (or its language) directly with clients.

---

## 1. What Ghost Factory Is

Ghost Factory is my internal engine for building modern, conversion-focused landing pages quickly and consistently.

- Frontend: Next.js App Router (`app/` directory) with React components and Tailwind CSS.
- Automation: Python pipeline in `automation/factory.py` that orchestrates the workflow across client files.
- Content system: markdown and configuration files in `clients/[client-id]/` that describe the client, their offer, and the page content.
- Design system: reusable components documented in `design-system/manifest.md` and implemented in `components/`.

**Key idea:** All of this exists to support my freelance services (starting with Fiverr gigs). Clients never need to know how the internals work. Publicly, it is “a custom workflow and template library” instead of “AI agents and automation.”

---

## 2. Core Workflow (Internal View)

High-level automation flow based on the current architecture:

1. **Intake**
   - I collect client information (Fiverr order, messages, optional questionnaire).
   - I save or update `clients/[client-id]/intake.md` with their:
     - Business, audience, offer
     - Goal for the page
     - Design preferences and references
     - Must-have sections and constraints

2. **Strategy / Brief**
   - The “Strategist” stage turns the intake into a focused `brief.md`:
     - Positioning and angle
     - Main promise and key benefits
     - Suggested section order and content hierarchy
   - This can be done via my AI tools and/or manual editing.

3. **Copywriting**
   - The “Copywriter” stage produces `content.md`:
     - Headline, subheadline
     - Section-by-section copy
     - CTAs, FAQs, guarantees, etc.

4. **Page Assembly**
   - The “Builder” stage uses the component library to assemble a page for that client.
   - Output is a React/Next.js page (for example, in `app/clients/[clientId]/page.tsx` or a similar structure).
   - Components used are defined in the design system (`design-system/manifest.md` and `components/`).

5. **QA and Preview**
   - I run the Next.js dev server (`npm run dev`) and visit the client page route.
   - I check:
     - Layout (no broken sections, spacing issues, obvious visual bugs)
     - Responsiveness (desktop / mobile)
     - Copy (typos, clarity, consistent tone)
     - Links and CTAs (buttons go where they should)

6. **Packaging for Delivery**
   - Depending on the service package, I deliver:
     - A deployed link (e.g., Vercel URL) and/or
     - Screenshots / scrollshot of the page and/or
     - Code bundle or export.

   The exact packaging rules live in `FIVERR_LANDING_PAGE_WORKFLOW.md`.

---

## 3. What Is Automated vs Manual

### Automated / semi-automated

- Turning intake notes into a structured `brief.md` (using my tools).
- Drafting most of the copy in `content.md`.
- Choosing components based on the brief.
- Generating a first draft of the page using the component library.

### Manual / human steps

- Deciding which client requests are realistic or should be pushed back on.
- Adjusting the brief and copy so it matches the client’s personality and niche.
- Fixing layout edge cases, visual polish, and design choices.
- Final QA and sign-off before anything is delivered.
- Communicating with the client on Fiverr (questions, clarifications, revision handling).

---

## 4. Business Constraints (Rules for Myself)

1. **No AI language in public**
   - Never mention “AI,” “agents,” or “automation” in:
     - Fiverr gig titles or descriptions
     - Client messages
     - Any public documentation
   - Public language is about “process,” “workflow,” “templates,” and “experience.”

2. **Realistic timelines**
   - Even if Ghost Factory can produce a page draft in hours, I give clients a longer deadline (several days) to protect:
     - My schedule (two jobs + side projects)
     - Buffer for revisions and emergencies
     - The perceived value of the work

3. **Scope discipline**
   - Start with **one primary service**: landing page design/build.
   - Avoid custom web apps, complex integrations, or full-branding retainers until the base offer is proven.

4. **Technical boundaries**
   - Keep the tech stack simple:
     - Next.js, React, Tailwind, basic forms.
   - Avoid:
     - Heavy CMS integrations
     - Complicated backends
     - Anything that will be painful to maintain as a solo operator.

---

## 5. How This Ties into Fiverr

Ghost Factory is the engine behind my first Fiverr gig:

- Gig: “I will design a clean, conversion-focused landing page.”
- Fiverr is the front door; Ghost Factory is the workshop behind the scenes.
- Internal mapping:
  - Fiverr order → `clients/[client-id]/intake.md`
  - Draft page → Next.js route under `app/clients/[clientId]/`
  - Delivery → combination of link, screenshots, and/or code bundle.

The detailed mapping between Fiverr packages and what I deliver lives in `FIVERR_LANDING_PAGE_WORKFLOW.md`.

---

## 6. Next Steps / TODOs (Internal)

- Refine the intake structure I want to use for `intake.md`.
- Tighten the component library so I have 1–2 favorite patterns for:
  - Hero
  - Features
  - Social proof
  - Pricing
  - CTA
- Keep a running list of “good examples” I’ve shipped so I can reuse structures and patterns.
