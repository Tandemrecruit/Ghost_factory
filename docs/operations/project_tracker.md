# Project Tracker "“ Landing Page Builds

This tracker is the single source of truth for all landing page projects.

Each row = one project / client.  

Keep this file in sync with your actual work so you always know what"™s active, blocked, or done.

---

## Status Codes

Use these high-level statuses:

- `LEAD` "“ Interested but not booked (no payment)
- `INTAKE_PENDING` "“ Deposit paid, form link sent, waiting on client to submit the form
- `PIPELINE_RUNNING` – Form submitted and accepted; automation is doing its work (intake → sanitize → architect → copy → build → QA)
- `DRAFT_REVIEW` "“ Automation is done; draft is ready for **your** review before the client sees it
- `SENT_TO_CLIENT` "“ Draft link sent to client, waiting on feedback
- `REVISION_IN_PROGRESS` "“ You"™re implementing the included revision round
- `AWAITING_FINAL_PAYMENT` "“ Revision delivered; ready to collect the final 50%
- `COMPLETE` "“ Final payment received and hosting/hand-off done
- `ON_HOLD` "“ Client paused, missing info, or long delay
- `CANCELLED` "“ Project ended without completion

These are the only statuses you need to update by hand.  

All the fine-grained internal pipeline states (intake_ready, sanitized, build_in_progress, draft_ready) live inside Ghost_factory and its logs.

---

## Fields

Use these columns for every project:

- **client_id** "“ Internal ID / slug (matches `clients/<client_id>` folder and route)
- **business_name** "“ Client"™s business name
- **contact_name** "“ Main contact person
- **contact_email** "“ Main email
- **status** "“ One of the status codes above
- **package** "“ Which offer/package they bought (e.g., `LP-Standard`, `LP-Plus`)
- **hosting** "“ `managed` or `self_hosted`
- **deposit_date** "“ Date 50% deposit was paid
- **form_sent_date** "“ Date you sent the intake form link
- **form_received_date** "“ Date they completed the form
- **draft_ready_date** "“ Date you considered the draft ready (internally)
- **sent_to_client_date** "“ Date you sent the draft preview
- **revision_request_date** "“ Date they requested changes (if any)
- **revision_complete_date** "“ Date you finished revisions
- **final_payment_date** "“ Date second 50% was paid
- **final_delivery_date** "“ Date you deployed/handed off the page
- **notes** "“ Freeform notes (red flags, special requests, blockers)

---

## Table (Manual Tracker)

You can track projects directly in this table, or mirror it into a spreadsheet.

> Tip: Delete the example rows once you start using this for real.

| client_id      | business_name          | contact_name | contact_email         | status           | package      | hosting     | deposit_date | form_sent_date | form_received_date | draft_ready_date | sent_to_client_date | revision_request_date | revision_complete_date | final_payment_date | final_delivery_date | notes                                      |

|----------------|------------------------|--------------|-----------------------|------------------|--------------|-------------|--------------|----------------|--------------------|------------------|----------------------|-----------------------|-----------------------|--------------------|---------------------|--------------------------------------------|

| example-1      | Example Business One   | Jane Smith   | jane@example.com      | LEAD             | LP-Standard  | managed     |              |                |                    |                  |                      |                       |                       |                    |                     | Example placeholder row.                   |

| example-2      | Example Business Two   | Alex Jones   | alex@example.com      | INTAKE_PENDING   | LP-Standard  | self_hosted | 2025-12-06   | 2025-12-06     |                    |                  |                      |                       |                       |                    |                     | Deposit paid; waiting on intake form.      |

_Add new rows as projects come in. Keep `client_id` consistent with your `clients/<client_id>` folder and routes._

---

## Workflow Rules (How to Update Status)

Only update the tracker when **you or the client** do something.  

Let the internal pipeline do its own thing behind the scenes.

1. **When a client pays the deposit**
   - Create a new row.
   - Set:
     - `status = INTAKE_PENDING`
     - Fill `client_id`, `business_name`, `contact_name`, `contact_email`, `package`, `hosting`
     - Set `deposit_date`
     - Set `form_sent_date` (same day you send the intake link)

2. **When the form is submitted and accepted**
   - Once you see a valid response and/or `clients/<client_id>/intake-raw.md` exists:
     - Set `form_received_date`
     - Set `status = PIPELINE_RUNNING`
   - From this point until a draft is ready, the automation runs:
    - intake → sanitize → architect → copy → build → QA  

     You do **not** need to update the tracker during that.

3. **When automation has produced a draft and you're ready to review it**
   - When you know a draft exists (e.g., Ghost_factory ping in Discord, or `qa_report.md` is present):
     - Set `draft_ready_date`
     - Set `status = DRAFT_REVIEW`

4. **When you send the draft to the client**
   - After you"™ve reviewed the page and are okay showing it:
     - Set `sent_to_client_date`
     - Set `status = SENT_TO_CLIENT`

5. **When they send revision requests**
   - On first revision request:
     - Set `revision_request_date`
     - Set `status = REVISION_IN_PROGRESS`
   - When you finish that revision round:
     - Set `revision_complete_date`
     - Set `status = AWAITING_FINAL_PAYMENT`

6. **When final payment arrives**
   - Set `final_payment_date`
   - After you deploy/hand off the page (Managed or Self-Hosted):
     - Set `final_delivery_date`
     - Set `status = COMPLETE`

7. **If a project pauses or dies**
   - If the client goes quiet for a while:
     - Set `status = ON_HOLD` and explain in `notes`
   - If they cancel:
     - Set `status = CANCELLED` and note the reason

---

## Optional: Spreadsheet Header

If you want to mirror this in Google Sheets or Excel, use this as the header row:

client_id,business_name,contact_name,contact_email,status,package,hosting,deposit_date,form_sent_date,form_received_date,draft_ready_date,sent_to_client_date,revision_request_date,revision_complete_date,final_payment_date,final_delivery_date,notes

---

## Auto-updated fields (by script)

Some fields can be updated automatically based on files in ./clients.

When you run:

    python automation/project_tracker_autoupdate.py

the script will:

- Set form_received_date and change status from INTAKE_PENDING to PIPELINE_RUNNING

  when a raw intake file exists for that client (intake-raw.md or intake-source.md).

- Set draft_ready_date and change status to DRAFT_REVIEW

  when intake.md, brief.md, content.md, and qa_report.(md|txt) exist.

All other status changes (SENT_TO_CLIENT, REVISION_IN_PROGRESS, AWAITING_FINAL_PAYMENT, COMPLETE,

ON_HOLD, CANCELLED) are manual and should only be updated by me.
