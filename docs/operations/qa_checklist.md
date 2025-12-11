# docs/qa_checklist.md

# QA Checklist "“ Pre-Client Delivery

This is an internal checklist to run **before** sending any draft or final landing page to a client.

---

## 1. Functional QA

- [ ] **Primary CTA works**
  - Button text matches the client"™s desired action
  - Click goes to the correct:
    - Phone number (`tel:` link)
    - Booking/calendar URL
    - Contact/quote form
    - Checkout/product URL

- [ ] **Secondary CTA (if present) works**
  - Text is clear and not competing with the primary CTA
  - Link points to the correct place

- [ ] **Forms (if used) submit correctly**
  - Form sends/redirects as expected
  - No obvious errors on submit

---

## 2. Layout & Responsive QA

- [ ] **Mobile layout**
  - Hero section renders cleanly on a typical phone viewport
  - Primary CTA visible without excessive scrolling
  - No overlapping text or broken components
  - Spacing between sections is reasonable

- [ ] **Desktop layout**
  - Page looks balanced on a laptop/desktop width
  - Text lines are readable (not too wide or cramped)
  - Images and icons are not distorted
  - No obvious misalignments or broken grids

- [ ] **Headings and hierarchy**
  - Headline, subheadline, and section headings are clearly distinct
  - Key messages are easy to scan

- [ ] **Text contrast and readability**
  - All text is clearly readable against its background
  - Headlines are dark enough on light backgrounds (check in both light and dark mode)
  - Body text has sufficient contrast (WCAG AA minimum)
  - No light gray text on white backgrounds

- [ ] **Images and assets**
  - All referenced images load correctly or show appropriate fallbacks
  - Logo fallbacks are visible and readable (not just tiny text)
  - Missing images don't break the layout
  - Image alt text is present and descriptive

---

## 3. Content QA

- [ ] **Business details correct**
  - Business name is spelled correctly everywhere
  - Location and service areas match the intake
  - Contact details (phone/email/URL) are correct

- [ ] **Offer and audience alignment**
  - The copy clearly describes the client"™s actual offer
  - The primary audience matches the intake (no mismatched personas)
  - Benefits and promises align with what the client provided

- [ ] **Tone and brand voice**
  - Tone matches the requested style (e.g., friendly vs professional vs premium)
  - No jarring changes in tone between sections

- [ ] **Typos and clarity**
  - Run a quick spell-check
  - Fix obvious typos and grammar errors
  - Re-word any confusing sentences

---

## 4. Risk & Safety QA

- [ ] **No invented promises**
  - No guarantees that were not provided or clearly implied
  - No claims of specific financial results or ROI unless the client explicitly provided and approved them
  - No medical or legal claims that could be risky

- [ ] **Must-avoid topics honored**
  - Check the intake for "red flags" or "don"™t say this"
  - Confirm those phrases and ideas are **not** present on the page

- [ ] **Legal/disclaimer notes included if needed**
  - If the client mentioned disclaimers, required statements, or industry rules, confirm:
    - They are present, or
    - You"™ve flagged them to the client as a needed addition

---

## 5. System & Process QA

- [ ] **Files are in the right place**
  - `clients/<client-id>/intake.md`
  - `clients/<client-id>/brief.md`
  - `clients/<client-id>/content.md`
  - `clients/<client-id>/qa_report.md`
  - `app/clients/<client-id>/page.tsx` (or equivalent)

- [ ] **Git is clean**
  - Changes committed with a clear message
  - Ability to rollback to pre-build state if needed

- [ ] **QA agent feedback reviewed**
  - Check the automated QA report
  - Address any major issues it flagged

---

## 6. Final "Human Feel" Check

Take 30"“60 seconds and ask:

- [ ] Would I be comfortable sending this page to a paying client as a first draft?
- [ ] Does the page clearly communicate:
  - Who this is for
  - What problem it solves
  - What the offer is
  - What action the visitor should take next?

If yes, it"™s ready to send to the client as a draft or final.  

If no, fix the biggest issue first, then re-check.

