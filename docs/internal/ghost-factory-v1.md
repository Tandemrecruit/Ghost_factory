# Ghost Factory v1.0 â€“ Single Happy Path Guide

**Project:** Ghost Factory  
**Milestone:** `v1.0` (single-client happy path)  
**Owner:** Ryan (`Tandemrecruit`)  
**Last updated:** 2025-12-09

---

## 1. Purpose of v1.0

v1.0 is **not** the full vision of Ghost Factory.

v1.0 is a **single reliable happy path**:

> Take one demo client from intake â†’ brief â†’ content â†’ generated page, and render it at `/clients/<client-id>` with no errors.

Once this works end-to-end on a fresh machine with a few simple commands, v1.0 is considered **done**.

Anything beyond that (multi-client, tracking, experiments, dashboards, etc.) belongs to later milestones (v1.5, v2.0).

---

## 2. Demo Client for v1.0

For v1.0, we standardize on **one demo client**.

**Demo client ID (example):**

- `demo-hvac`

You can change the exact ID later, but v1.0 assumes:

- There is exactly **one** canonical demo client.
- All v1.0 behavior is verified against this client.

**Expected folder structure:**

Under `clients/`:

- `clients/demo-hvac/`
  - `intake.md` â€“ human-provided intake / raw notes
  - `brief.md` â€“ Strategist output (generated)
  - `content.md` â€“ Copywriter output (generated)
  - `assets/` â€“ Optional images or static assets for the client
  - (Optional) `decision-log.md` â€“ notes about choices, if used

Under `app/clients/`:

- `app/clients/[clientId]/page.tsx` â€“ dynamic route that reads the generated page for `demo-hvac`.

The exact file names can be updated as long as this flow remains true:

- Intake â†’ brief â†’ content â†’ generated page â†’ `/clients/demo-hvac`

---

## 3. Prerequisites

### System requirements

- Node.js 18+  
- Python 3.10+ (or compatible with `automation/requirements.txt`)  
- npm (or yarn)  

### Project dependencies

From the repo root:

    npm install

To set up Python dependencies for the automation pipeline:

    pip install -r requirements.txt

(If you are using a virtual environment, activate it before installing.)

---

## 4. v1.0 Workflow Overview

High-level flow:

1. **Prepare intake** for the demo client:
   - Edit `clients/demo-hvac/intake.md` with the scenario you want (e.g. a local salon landing page).

2. **Run the factory** for that client:
   - `python automation/factory.py demo-hvac`  
   - This should:
     - Read `intake.md`
     - Generate or update `brief.md`
     - Generate or update `content.md`
     - Generate or update the page component for this client (e.g. under `app/clients/[clientId]/page.tsx` or a client-specific file the route uses)

3. **Start the Next.js dev server:**
   - `npm run dev`

4. **Preview the client page:**
   - Visit `http://localhost:3000/clients/demo-hvac`
   - Confirm the page renders without errors and includes all required sections.

---

## 5. Required Sections in the v1.0 Page

The v1.0 page uses a **small, fixed section set**. The exact component names can vary, but the structure should be equivalent:

1. **Hero section**
   - Clear headline and subheadline
   - Primary call-to-action (button or link)

2. **Problem / solution section**
   - Explain the main problem the client solves
   - Show how the offer or service addresses it

3. **Features / benefits section**
   - 3â€“6 key features, benefits, or outcomes
   - Can be shown as a grid, list, or steps

4. **Social proof placeholder**
   - Even if you have no real testimonials yet, include:
     - Placeholder testimonials, trust badges, or a â€œwhat to expectâ€ style block.
   - v1.0 does **not** require real testimonials; it just reserves the section.

5. **Final CTA section**
   - Simple, clear call-to-action
   - Matches the main goal of the page (book a call, request a quote, join waitlist, etc.)

6. **Tracking slot (no-op)**
   - A small placeholder in the layout where tracking scripts will plug in later.
   - In v1.0 this can render nothing or a minimal wrapper; it should not include real analytics logic.

---

## 6. Step-by-Step: Running v1.0 on a Fresh Machine

This is the **canonical test** for v1.0.

From a newly cloned repo:

1. **Clone and install**

    git clone https://github.com/Tandemrecruit/Ghost_factory.git
    cd Ghost_factory
    npm install
    pip install -r requirements.txt

2. **Confirm demo client exists**

   Ensure the following files exist:

   - `clients/demo-hvac/intake.md`
   - `clients/demo-hvac/` folder structure as described above

   If they donâ€™t, create them using the expected structure.

3. **Run the factory for the demo client**

    python automation/factory.py demo-hvac

   Expected results:

   - Script completes without an unhandled exception.
   - `clients/demo-hvac/brief.md` exists and is non-empty.
   - `clients/demo-hvac/content.md` exists and is non-empty.
   - The corresponding page component for `demo-hvac` is generated/updated in the app layer.  
     (Implementation detail can vary, but there must be a deterministic mapping from this client to `/clients/demo-hvac`.)

4. **Start the Next.js dev server**

    npm run dev

   Expected result:

   - Next server starts without crashing.

5. **Visit the client page**

   - In a browser: `http://localhost:3000/clients/demo-hvac`

   Expected results:

   - The page loads with no runtime errors.
   - All required sections are present:
     - Hero
     - Problem / solution
     - Features / benefits
     - Social proof placeholder
     - Final CTA
   - Page content matches what youâ€™d expect based on `intake.md` â†’ `brief.md` â†’ `content.md`.

If all of the above pass, v1.0 is functioning correctly on that machine.

---

## 7. Definition of â€œDoneâ€ for v1.0

v1.0 is considered **done** when all of the following are true:

- **Setup:**
  - A new machine can:
    - Clone the repo
    - Install Node/Python dependencies
    - Run the Next dev server without manual fixes

- **Demo client pipeline:**
  - `clients/demo-hvac/intake.md` exists and is used as the source for the pipeline
  - Running `python automation/factory.py demo-hvac`:
    - Reads the intake
    - Writes or updates `brief.md` and `content.md`
    - Writes or updates the page component used for `/clients/demo-hvac`

- **Page rendering:**
  - Visiting `/clients/demo-hvac`:
    - Renders successfully with no errors
    - Shows the required sections (hero, problem/solution, features, social proof placeholder, final CTA)
    - Content is coherent and maps back to the intake/brief/content

- **Tracking hook:**
  - The layout includes a no-op tracking hook/slot ready to be wired in later (v1.5+)
  - There is no real analytics logic or third-party integration yet

- **Documentation:**
  - This file (`docs/internal/ghost-factory-v1.md`) accurately describes:
    - How to run v1.0
    - What â€œdoneâ€ means
  - If commands or paths change, this doc is updated.

When all items above are true, you can lock v1.0 and move work for multi-client, tracking, experiments, etc. into **v1.5** and beyond.

---

## 8. Explicitly Out of Scope for v1.0

The following are **not** part of v1.0, even if partial code exists in the repo:

- Multi-client support or client indexing pages
- New-client scaffolding scripts
- Real analytics plumbing (CTR, conversions, dashboards, etc.)
- A/B tests, variants, or experiment configs
- Internal studio/dashboard UI
- Any kind of public-facing SaaS features (auth, billing, user accounts)

These belong to later milestones (v1.5, v2.0) and should not block shipping v1.0.

---
