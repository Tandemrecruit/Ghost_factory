# Intake → Draft Ready SOP

Purpose  
Define the exact steps from “client pays deposit” to “internal draft is ready for my review,” using the Google Form, Sanitizer, and Ghost_factory.

This SOP is internal only. Clients never see this file.

---

## 1. Preconditions

Before starting this flow:

- The project is confirmed as a good fit for a 1-page landing.
- Client has agreed to:
  - 50/50 payment structure
  - One revision round
  - Basic IP/ownership terms
- 50% deposit has been paid.

Once those are true, this SOP starts.

---

## 2. Files and Systems Involved

- Google Form – client-facing intake questionnaire.
- Google Sheet – stores each form submission.
- Ghost_factory repo – local / GitHub project:
  - docs/project_tracker.md
  - clients/<client_id>/
    - intake-raw.md (temporary raw answers)
    - intake-source.md (archived original)
    - intake.md (sanitized, structured intake used by pipeline)
    - brief.md (architecture/strategy)
    - content.md (copy and sections)
    - qa_report.md (agent QA output)
- Discord (optional) – notifications/logs from Ghost_factory.

---

## 3. Create / Update Project Tracker Entry

1. Open docs/project_tracker.md.
2. Add a row to the table for the new client.

   Example row:

   | client_id    | business_name          | contact_name | contact_email     | status           | package     | hosting  | deposit_date | form_sent_date | form_received_date | draft_ready_date | sent_to_client_date | revision_request_date | revision_complete_date | final_payment_date | final_delivery_date | notes                         |
   |--------------|------------------------|--------------|-------------------|------------------|-------------|----------|--------------|----------------|--------------------|------------------|----------------------|-----------------------|-----------------------|--------------------|---------------------|-------------------------------|
   | clearflow-oh | ClearFlow Plumbing LLC | Jamie Carter | jamie@example.com | INTAKE_PENDING   | LP-Standard | managed  | 2025-12-07   | 2025-12-07     |                    |                  |                      |                       |                       |                    |                     | Internal dry run (test only). |

3. Fill in at least:
   - client_id
   - business_name
   - contact_name
   - contact_email
   - status = INTAKE_PENDING
   - package (e.g., LP-Standard)
   - hosting (managed or self_hosted)
   - deposit_date
   - form_sent_date

Rule: Every deposit = a tracker row.

---

## 4. Client Fills Out the Google Form

1. Send the intake form link to the client.
2. Client completes the form.
3. Confirm the response appears in the linked Google Sheet.

At this point:

- Tracker status stays INTAKE_PENDING until intake-raw.md exists.

---

## 5. Create clients/<client_id>/intake-raw.md

This step will eventually be automated with Google Apps Script. For now, it’s manual but follows a strict format.

1. In the repo, create the client folder:

   - clients/<client_id>/
   - Example: clients/clearflow-oh/

2. Open the Google Sheet row for this client’s response.
3. Create a new file: clients/<client_id>/intake-raw.md.
4. Copy questions and answers into the file in this structure:

   (Each question, then its answer, then a blank line.)

       What is your business name?
       ClearFlow Plumbing LLC

       Do you have an existing page or website? If yes, paste the URL
       https://clearflowplumbing.com

       Where are you located? (Business location or “Online Only”)
       Dayton, OH

       In one sentence, what does your business do?
       We provide 24/7 emergency plumbing services for homeowners in Dayton.

5. Save the file.
6. Update the project tracker:

   - Set form_received_date to today’s date.
   - Set status = PIPELINE_RUNNING.

---

## 6. Run the Intake Sanitizer (Conceptual)

This documents the logic; you’ll actually run the script when you’re at your desktop.

The Sanitizer should:

- Take clients/<client_id>/intake-raw.md.
- Send it to the model with the schema/system prompt.
- Write a normalized clients/<client_id>/intake.md.
- Rename the original file to intake-source.md.

Expected results after it runs:

- intake-source.md exists (archived original).
- intake.md exists (clean structured intake used by Ghost_factory).

When you’re at your machine, the command will look like:

    python scripts\intake_sanitizer.py clients\<client_id>\intake-raw.md

After this completes in practice:

- Tracker status stays PIPELINE_RUNNING.
- The internal pipeline (Architect/Copy/Builder/QA) is now safe to start.

---

## 7. Ghost_factory Pipeline (Conceptual)

Once intake.md exists for client_id, Ghost_factory should:

1. Read clients/<client_id>/intake.md.
2. Generate clients/<client_id>/brief.md (architecture/strategy).
3. Generate clients/<client_id>/content.md (copy sections).
4. Build the React/Next page for that client (for example app/clients/<client_id>/page.tsx).
5. Run QA and write clients/<client_id>/qa_report.md.

You don’t manually edit the tracker during these internal steps; status remains PIPELINE_RUNNING.

---

## 8. When Is a Draft Considered “Ready” Internally?

A draft is considered internally ready when:

- The pipeline has produced:
  - intake.md
  - brief.md
  - content.md
  - qa_report.md
  - A routable page file (e.g., page.tsx)
- You can load the page in your local dev server without it crashing.

At this point:

1. Update project tracker:
   - Set draft_ready_date to today’s date.
   - Set status = DRAFT_REVIEW.

2. Do a quick manual check using docs/qa_checklist.md:
   - The page clearly reflects the business, offer, and main CTA.
   - No obviously broken layout on desktop or mobile.
   - No wild promises or banned phrases from the intake “red flags”.

You are not sending anything to the client yet.  
This SOP ends at “draft is ready for my eyes.”

---

## 9. Summary Checklist

From “deposit paid” to “draft ready for my review”:

- [ ] Add row to docs/project_tracker.md → status = INTAKE_PENDING.
- [ ] Send intake form link to client.
- [ ] Confirm Google Form submission in the Sheet.
- [ ] Create clients/<client_id>/ folder.
- [ ] Build intake-raw.md from the Sheet response.
- [ ] Update tracker: set form_received_date, status = PIPELINE_RUNNING.
- [ ] Run intake_sanitizer.py (when at desktop).
- [ ] Confirm intake-source.md and intake.md exist.
- [ ] Run Ghost_factory pipeline for this client.
- [ ] Confirm brief.md, content.md, qa_report.md, and the page file exist.
- [ ] Update tracker: set draft_ready_date, status = DRAFT_REVIEW.
- [ ] Manually review the draft page (internal QA only).