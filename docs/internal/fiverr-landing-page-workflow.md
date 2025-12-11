# Fiverr Landing Page Workflow (Internal)

> Internal use only. This doc connects Fiverr orders to the Ghost Factory pipeline. Never paste this file into Fiverr. Use it as a checklist.

---

## 1. Offer Positioning (Internal Summary)

Public offer: I design clean, modern, conversion-focused landing pages for solo founders, small businesses, and early-stage products.

- Platforms: Primarily modern web (Next.js / React) hosted on my stack (e.g., Vercel) with shareable links and visual deliverables.
- Client experience: Simple process, clear communication, and 1"“3 rounds of structured revisions depending on package.
- Public language: "custom workflow," "proven layout patterns," "template library" "“ no references to AI or automation.

---

## 2. Package Mapping (Fiverr → Internal Deliverables)

### Basic Package (Starter)

- Working name: "Launch-Ready Starter Section"
- Public promise:
  - One-page layout with up to **3 sections**:
    - Hero
    - Short "How it helps" feature section
    - Simple CTA or contact section
- Internal deliverables:
  - `intake.md` (light, but still structured)
  - `brief.md` (short; focused on one core promise)
  - `content.md` (hero + 1"“2 sections)
  - Page built using a small subset of components (e.g., `HeroSimple`, `FeatureGrid` or `FeatureSteps`, `CtaBanner`).
- Client-facing deliverables:
  - One live preview link (my hosting)
  - Screenshot(s) of the page (full-page scrollshot or key sections)
  - Optional: zipped static export or code bundle (if I decide to include this later)
- Revisions and timing (default starting point):
  - Delivery time: 5 days
  - Revisions: 1 round

### Standard Package (Full Landing Page)

- Working name: "Conversion-Focused Landing Page"
- Public promise:
  - Full landing page with up to **6 sections**:
    - Hero
    - Features / benefits
    - How it works
    - Social proof (testimonials, stats, trust badges)
    - Pricing or offer explanation
    - Final CTA / FAQ
- Internal deliverables:
  - Full `intake.md`, `brief.md`, `content.md`
  - Page assembled with multiple components from the design system.
- Client-facing deliverables:
  - Live preview link on my hosting
  - Full-page screenshot(s)
  - Section-by-section outline in a text doc (optional extra clarity)
- Revisions and timing:
  - Delivery time: 7 days
  - Revisions: 2 rounds

### Premium Package (Landing Page + Simple Form)

- Working name: "Landing Page + Lead Capture"
- Public promise:
  - Everything in Standard, plus:
    - Simple, working contact or opt-in form:
      - Either a basic form on my hosted page (email sent to them), or
      - Connected to a form provider they already use (if reasonable within time).
- Internal deliverables:
  - Same as Standard, plus basic form wiring on the page.
- Client-facing deliverables:
  - Live preview link
  - Screenshots
  - Instructions or notes on how the form is wired (where submissions go).
- Revisions and timing:
  - Delivery time: 10 days
  - Revisions: 3 rounds (for copy/design, not for new features).

---

## 3. Order-to-Delivery Checklist

### Step 1 "“ Pre-Order Communication (Optional but Ideal)

- Ask the potential client:
  - What is your offer?
  - Who is your target audience?
  - What is the main goal of this page (book calls, sell product, collect emails, etc.)?
  - Do you have any existing logo, brand colors, or site examples you like?
- Confirm:
  - Which package fits them best.
  - That you build clean, modern landing pages and you are not doing complex apps or full websites.

### Step 2 "“ When an Order Comes In

1. Create a new `client-id`
   - Simple format: `client-YYYYMMDD-shortname`
   - Example: `client-20251208-tinylunch`

2. Create directory:
   - `clients/[client-id]/`

3. Create or update these files:
   - `clients/[client-id]/intake.md`
   - Optional: `clients/[client-id]/assets/` for any logos/images they send.

4. Copy info from:
   - Fiverr order details
   - Client messages
   - Any attachments they upload

### Step 3 "“ Intake Structure (intake.md)

Keep `intake.md` simple and predictable:

- Client name / business name
- Offer description (what they sell)
- Target audience
- Primary goal of the page
- Key benefits / reasons to choose them
- Brand voice notes (formal, friendly, playful, etc.)
- Preferred colors / references
- Required sections or elements
- Things to avoid

This file is the single source of truth for the rest of the pipeline.

### Step 4 "“ Brief and Content

1. **Brief (`brief.md`)**
   - Turn `intake.md` into:
     - One clear main promise
     - 3"“5 key benefits
     - Suggested section order
     - Notes on tone and angle

2. **Content (`content.md`)**
   - Write out:
     - Headline and subheadline
     - Hero body text and CTA
     - Section-by-section copy
     - FAQ entries
     - Any guarantee, social proof, pricing explanations

Use whatever AI tools and prompts you want internally, then edit for clarity and fit.

### Step 5 "“ Build the Page

1. Run dev server:
   - From repo root, standard flow:
     - `npm install` (only once per environment)
     - `npm run dev`

2. Implement / generate the page using the component library:
   - Use components from `components/` guided by `design-system/manifest.md`.
   - Make sure:
     - Sections line up with the brief
     - The page looks coherent on desktop and mobile
     - CTA buttons are obvious and repeated where needed

3. Save the page under the appropriate route using the current project structure (for example, under `app/clients/[clientId]/`).

### Step 6 "“ QA Checklist

Before you send anything to the client, check:

- Layout:
  - No broken sections, overlapping text, or unstyled components.
- Mobile:
  - Text is readable and buttons tappable.
- Copy:
  - No obvious typos.
  - The main promise is clear above the fold.
- Flow:
  - The sections follow a logical story from problem → solution → proof → action.
- Links:
  - All CTAs go to the right place (or placeholder link if client hasn't decided yet, with a note explaining it).

If something feels off, fix it here rather than waiting for the client to point it out.

### Step 7 "“ Packaging & Delivery

Baseline approach (adjust package by package):

- Provide:
  - A live preview link (hosted on my stack).
  - 1"“3 screenshots (including full-page or sectional scrollshots).
  - A short message describing:
    - The main goal of the page.
    - The sections included.
    - How revisions work (what is included, what is not).

- Optional (if I choose to offer it):
  - A zipped bundle of the page code or static export.
  - Simple written instructions if the client wants to move it to their own hosting later.

---

## 4. Revision Policy (Internal)

General rules:

- Revisions are for:
  - Copy tweaks
  - Visual polish
  - Reordering sections
- Revisions are not for:
  - Completely new offers or audiences
  - Adding complex new features (multi-step forms, dashboards, etc.)
  - Turning a landing page into a full multi-page site

If a requested change is out of scope:

- Politely explain the scope of the package.
- Offer a paid extra or a separate project if it makes sense.
- Keep scope creep off the main gig unless it clearly upgrades your portfolio and is worth the time.

---

## 5. Time Management (Internal)

Because I work two jobs and have limited hours:

- I set **generous public delivery times** (5 / 7 / 10 days).
- Internally, I aim to:
  - Draft the page within 1"“2 focused sessions.
  - Leave at least 1"“2 days of buffer before the Fiverr deadline.
- I track:
  - Actual hours spent per project to understand my real hourly rate.
  - Where the time goes (intake, copy, build, QA, revisions).

If a client is slow to respond or unclear:

- Ask 1"“2 clear follow-up questions.
- If needed, propose a direction and move forward rather than waiting forever.
