# Draft → Final Delivery SOP

Purpose  
Define the exact steps from “draft is ready for my review” to “final page delivered and project complete,” including client preview, revisions, final payment, and hosting/hand-off.

This SOP is internal only. Clients never see this file.

---

## 1. Starting Point

This SOP starts when:

- The Ghost_factory pipeline has produced:
  - clients/<client_id>/intake.md
  - clients/<client_id>/brief.md
  - clients/<client_id>/content.md
  - clients/<client_id>/qa_report.md
  - A routable page file (for example app/clients/<client_id>/page.tsx)
- You can load the page locally without crashes.
- In docs/project_tracker.md:
  - draft_ready_date is set
  - status = DRAFT_REVIEW

From here, you move toward client preview, revision, final payment, and delivery.

---

## 2. Internal Draft Review

Goal: Decide if the draft is good enough to show the client.

Steps:

1. Run the dev server locally and open the client page route:
   - Example: http://localhost:3000/clients/<client_id>
2. Use docs/qa_checklist.md as a guide and spot-check:
   - The hero clearly states:
     - Who it’s for
     - What problem it solves
     - What the main offer is
     - What action to take
   - Primary CTA:
     - Visible
     - Clickable
     - Goes somewhere reasonable (even if still a placeholder link)
   - Layout:
     - Not obviously broken on desktop
     - Sections are in a logical order
   - Tone:
     - Roughly matches the intake (professional vs friendly vs premium)
   - Risk:
     - No wild claims you didn’t get from the intake
     - Must-avoid phrases from the intake are not present

If the draft is clearly broken (layout or copy), fix or regenerate before proceeding. The client should never see an obviously bad version.

---

## 3. Prepare the Preview for the Client

Goal: Give the client a private preview **without** giving them deployable assets.

1. Deploy the draft to a preview/staging environment that you control.
   - For example:
     - A dedicated staging URL
     - A route under your own domain
   - The client should not have source code or production domain access yet.
2. Confirm:
   - The preview URL loads correctly.
   - CTAs behave as expected (even if they point to test or placeholder URLs).
3. (Optional but recommended) Add a small non-intrusive note on the page:
   - E.g., “Draft preview for review only – not final.”

You are still in DRAFT_REVIEW status at this step.

---

## 4. Send the Draft to the Client

Goal: Move from internal draft to client review.

1. Write a short draft email/message (template lives elsewhere, but basic content is):
   - Preview link
   - Reminder of project goal
   - Instructions on how to give feedback (ideally one consolidated list)
   - Reminder that one revision round is included

2. After sending the preview link:
   - In docs/project_tracker.md:
     - Set sent_to_client_date to today’s date.
     - Set status = SENT_TO_CLIENT.

From now until feedback arrives, you do not change the tracker status.

---

## 5. Waiting for Feedback

Goal: Keep things moving without chasing endlessly.

Guidelines:

- Standard window:
  - Encourage feedback within about 7 days.
- If no response:
  - Optionally send a polite follow-up reminder.
- If still no response after a reasonable period:
  - Consider moving status to ON_HOLD and note this in the tracker.

You do not change files during this period unless the client sends feedback.

---

## 6. Handle Client Feedback

When feedback arrives, you need to decide:

- Which requests are “included revision”
- Which requests are “new scope”

### 6.1. Consolidate Feedback

1. Read all feedback once without reacting.
2. Summarize for yourself:
   - What they like
   - What they don’t like
   - Specific requested changes

If they send feedback in many small messages, try to consolidate into a single list for your own use.

### 6.2. Determine Scope

Use docs/revisions_and_refunds.md as the rulebook.

“In scope” examples (revision):

- Change headlines/subheadlines and body copy
- Swap testimonials or add one where implied by the intake
- Tweaks to colors and small visual accents
- Reordering or lightly adjusting existing sections

“Out of scope” examples (new scope):

- Entirely new sections not implied by the original intake
- Changing the main offer, pricing model, or audience
- Rebuilding layout in a completely new style
- Adding complex integrations or forms that weren’t in the brief

If feedback is mostly in scope:

- Proceed with the included revision round.

If feedback is significantly out of scope:

- Plan to reply explaining:
  - Which parts are included
  - Which parts require a new quote or mini-project
- Decide whether to:
  - Handle out-of-scope items as a follow-up project, or
  - Decline them if they don’t fit your service model.

---

## 7. Implement the Revision Round

When you decide to proceed with the included revision:

1. In docs/project_tracker.md:
   - Set revision_request_date to today’s date.
   - Set status = REVISION_IN_PROGRESS.

2. Implement changes:
   - Update the relevant source files (e.g., content.md, page.tsx).
   - Optionally re-run parts of the pipeline (e.g., copy or layout tweaks) if you’ve built support for that.
   - Keep revisions focused; avoid turning this into a brand-new build.

3. Run through a light QA again:
   - Make sure requested changes are actually reflected.
   - Check that you didn’t break headings, CTAs, or layout.

4. Deploy updated draft to the same preview/staging environment.
   - Confirm preview URL still works.

5. In docs/project_tracker.md:
   - Set revision_complete_date to today’s date.
   - Set status = AWAITING_FINAL_PAYMENT.

At this point, the client has seen:
- Initial draft
- Updated draft after one included revision

---

## 8. Request Final Payment

Goal: Clearly signal that you’ve done the agreed work and it’s time for the final 50%.

1. Send a “Ready for final payment” email/message:
   - Recap what’s included:
     - 1-page landing built
     - Revisions applied as requested (within scope)
   - Confirm:
     - Any final polish you already did
   - Provide:
     - Link to pay the remaining 50%
   - Explain next steps:
     - After final payment, you will:
       - Either connect their domain (Managed Hosting)
       - Or deliver code/asset hand-off (Self-Hosted)

2. Do not:
   - Connect to their production domain
   - Send source code
   - Send asset packs or deployment instructions

…until the final payment is confirmed.

The tracker remains at AWAITING_FINAL_PAYMENT until the second payment is actually received.

---

## 9. After Final Payment – Delivery & Hosting

When final payment arrives:

1. In docs/project_tracker.md:
   - Set final_payment_date to today’s date.

2. Depending on hosting type:

### 9.1. Managed Hosting

1. Set up or confirm production deployment on your hosting platform.
2. Provide DNS instructions to the client, for example:
   - “Point landing.yourdomain.com to this CNAME/target.”
3. Once DNS is set and propagated:
   - Verify:
     - Page loads at the agreed domain.
     - Primary and secondary CTAs work correctly.
   - Run a quick QA pass:
     - Desktop + mobile
4. In docs/project_tracker.md:
   - Set final_delivery_date to the date you confirm production is live.
   - Set status = COMPLETE.

### 9.2. Self-Hosted Handoff

1. Prepare a handoff package:
   - The page source file(s) (e.g., page.tsx or equivalent)
   - Any related components or config needed
   - README_deploy.md with:
     - Framework/stack details
     - Where to place the files in their app
     - Any dependency or environment notes
2. Send the package to the client or their developer:
   - Via a shared drive link, zip file, or a separate repo, according to your process.
3. Clarify in your message:
   - Their dev team is responsible for:
     - Integrating the page
     - Deployment
     - DNS and hosting
4. In docs/project_tracker.md:
   - Set final_delivery_date to the date you send the completed handoff.
   - Set status = COMPLETE.

---

## 10. Handling ON_HOLD and CANCELLED

### 10.1. ON_HOLD

Use ON_HOLD when:

- The client disappears for an extended period.
- You’re blocked on required information.
- There is a long delay between draft and feedback or between revision and payment.

Actions:

- Update status = ON_HOLD.
- Add a note in the tracker explaining why:
  - “No feedback after draft + reminder”
  - “Client requested pause until Q2”

### 10.2. CANCELLED

Use CANCELLED when:

- The client explicitly cancels.
- You decide to end the project after clear, documented communication.

Actions:

- Set status = CANCELLED.
- Add a note explaining:
  - “Client cancelled before form – deposit refunded”
  - “Client cancelled after draft – deposit kept, no further work”

Follow docs/revisions_and_refunds.md for how to handle money in each scenario.

---

## 11. IP / Ownership Guardrails (Reminder)

Throughout this process:

- Before final payment:
  - All work remains your IP.
  - Client has preview-only rights:
    - They can view the draft privately.
    - They cannot deploy, copy, or commercially use it.
- After final payment:
  - Client receives usage rights as defined in payment_and_ownership.md.
  - You may still reuse generic layouts and non-specific structures.

Operational rules:

- Do not push code into their repos before final payment.
- Do not hand over source files or deploy to their live domain before final payment.

---

## 12. Summary Checklist

From “draft ready for my review” to “project complete”:

- [ ] Load the draft page locally; run internal QA.
- [ ] Deploy draft to a preview/staging environment you control.
- [ ] Send preview link and request one consolidated feedback round.
- [ ] Update tracker: sent_to_client_date, status = SENT_TO_CLIENT.
- [ ] Receive and consolidate feedback.
- [ ] Decide what is in-scope vs new scope.
- [ ] If in-scope revision:
  - [ ] Update tracker: revision_request_date, status = REVISION_IN_PROGRESS.
  - [ ] Implement changes; re-run light QA.
  - [ ] Redeploy preview with updated draft.
  - [ ] Update tracker: revision_complete_date, status = AWAITING_FINAL_PAYMENT.
- [ ] Request final 50% payment with a clear summary of what’s done and what happens after payment.
- [ ] When final payment arrives:
  - [ ] Update tracker: final_payment_date.
  - [ ] For Managed Hosting:
    - [ ] Set up production deployment.
    - [ ] Verify DNS and CTAs.
  - [ ] For Self-Hosted:
    - [ ] Prepare and send code + README_deploy.md.
  - [ ] Update tracker: final_delivery_date, status = COMPLETE.
- [ ] If delays or cancellation:
  - [ ] Use ON_HOLD or CANCELLED status in tracker with a clear note.

This closes the loop from DRAFT_REVIEW → SENT_TO_CLIENT → REVISION_IN_PROGRESS → AWAITING_FINAL_PAYMENT → COMPLETE for each project.