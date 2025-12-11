# docs/hosting_policy.md

# Hosting Policy "“ Managed vs Self-Hosted Delivery

This file defines how hosting and deployment are handled for landing page projects.

---

## 1. Overview

Clients can choose between two hosting options:

1. **Managed Hosting** "“ you host and manage the live landing page  
2. **Self-Hosted Handoff** "“ you provide the code and instructions, and the client (or their developer) hosts it

Both options use the same underlying page build; only the hosting and responsibilities differ.

---

## 2. Managed Hosting

### 2.1. What"™s Included

When a client selects Managed Hosting, you:

- Deploy the landing page on your chosen stack (e.g., Vercel/Netlify/other)
- Provide a live URL for review and testing
- Provide simple DNS instructions so the client can point:
  - e.g., `landing.theirdomain.com` to your deployment
- Ensure:
  - SSL/HTTPS is configured at your hosting provider
  - The page remains available, barring provider outages

### 2.2. Minor Post-Launch Updates

For a defined grace period after launch (e.g., 14 days), you may include:

- Minor text edits (typos, small wording tweaks)
- Swapping a testimonial quote
- Minor style adjustments that do not require structural rebuilds

Anything beyond this grace window or beyond "minor" is treated as:

- A new mini-project, or
- Billable maintenance work

### 2.3. Ongoing Hosting / Maintenance Fee (Optional)

You may choose to charge a recurring fee for:

- Ongoing hosting costs
- Occasional minor updates
- Keeping the page aligned with your stack updates

This fee and its scope should be clearly defined per client (e.g., in a proposal or SOW).

---

## 3. Self-Hosted Handoff

### 3.1. What You Deliver

When a client selects Self-Hosted Handoff, you provide:

- The page source file(s) (e.g., `page.tsx` or equivalent)
- A short deployment guide (`README_deploy.md`) that includes:
  - Framework/stack used (e.g., Next.js 15 + React 19)
  - Any required components or dependencies
  - Instructions for integrating the page into an existing app or site
    - e.g., "Place this file under `app/landing/page.tsx`" or similar
  - Basic instructions for environment variables or API keys (if applicable)

### 3.2. Client Responsibilities

With Self-Hosted Handoff:

- The client (or their developer) is responsible for:
  - Adding the page into their codebase
  - Handling CI/CD and deployment
  - Configuring their hosting provider
  - Managing DNS, SSL, and uptime

You are not responsible for:

- Their hosting provider"™s outages or limitations
- Build failures or integration issues in their environment
- Ongoing maintenance after delivery, unless separately agreed

---

## 4. When Ownership / Access Changes

- In **Managed Hosting**, you control the environment.  
  - If a project is not fully paid, you can withhold or disable the production URL.

- In **Self-Hosted Handoff**, you only provide the code + docs **after** the final payment is received.  
  - Before that, the client sees a **preview** hosted on your infrastructure only.

---

## 5. Recommended Defaults

For early projects:

- Default to **Managed Hosting** for simplicity and control
- Offer **Self-Hosted Handoff**:
  - When the client has a real developer/technical contact
  - At a clear price that reflects the additional coordination and documentation

This policy keeps responsibilities clear and avoids confusion over who is responsible for what once the page is built.
