import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# Load .env so OPENAI_API_KEY is available
load_dotenv()

# Use existing OpenAI key
client = OpenAI()

# Allow override via env, but give a sensible default
MODEL_SANITIZER = os.getenv("MODEL_SANITIZER", "gpt-4o-mini")


SYSTEM_PROMPT = """
You are an Intake Sanitizer for a landing-page studio.

Your job: take loose, messy client answers (from a form) and convert them into a clean,
structured Markdown file that follows this exact outline:

# Client Overview
- Business Name:
- Tagline:
- Location:
- Industry / Niche:
- Current Website (if any):
- Primary Offer:
- Secondary Offer(s):
- Ideal Customer:
- Brand Voice (3–5 words):
- Main Goal of This Page: (e.g. book calls, get quote requests, sell a product)

# Core Messaging
- Core Promise (1–2 sentences):
- Top 3 Benefits:
- Key Objections & Reassurances:
  - Objection 1:
    - Reassurance:
  - Objection 2:
    - Reassurance:
  - Objection 3:
    - Reassurance:
- Urgency / Time Sensitivity:

# Page Requirements
- Primary CTA (text + behavior):
- Primary CTA Target (phone / URL / email):
- Secondary CTA (if any):
- Required Sections:
- Optional / Nice-to-Have Sections:
- Must-Avoid Topics / Phrases:

# Assets & Constraints
- Logo / Brand Assets:
- Existing Brand Colors:
- Existing Copy/Pages to Reuse:
- Social Proof / Testimonials:
- Competitors / Inspiration URLs:
- Service Area / Locations:
- Pricing Strategy (starting price / range / “contact us”):
- Legal / Compliance Notes:

# Project Logistics
- Project Urgency / Timeline:
- Notes about scheduling, hours, availability:

# Notes from Client
- Special instructions:
- Anything unclear / missing:

MAPPING RULES (from raw form answers to this schema):

- Use the business name, location, website URL, and “what does your business do?” answers
  to fill Business Name, Location, Industry, Primary Offer, and a simple Tagline.

- Use the “ONE thing you want visitors to do on this page” to fill:
  - Main Goal of This Page
  - Primary CTA (text + behavior)

- Use the CTA details (what the button should do and where it should point) to fill:
  - Primary CTA Target (phone / URL / email)

- Use the “dream client” description for Ideal Customer.

- Use the “brand as a person” options to fill Brand Voice (3–5 words).

- Use “Why should customers choose YOU?” to fill:
  - Core Promise (1–2 sentences)
  - Top 3 Benefits (bullet-ish blurbs)

- Use “Why might a customer hesitate?” to extract Key Objections.
  For each objection, write a short, SAFE reassurance. Do NOT promise outcomes
  you are not explicitly given (avoid ROI guarantees, medical claims, etc.).

- Use testimonials / reviews for Social Proof / Testimonials.

- Use logo / colors answers and “websites you love” for:
  - Logo / Brand Assets
  - Existing Brand Colors
  - Competitors / Inspiration URLs
  - Visual hints (if mentioned) can be folded into Assets & Constraints or Notes.

- Use “red flags / things to avoid” and any legal/disclaimer answers for:
  - Must-Avoid Topics / Phrases
  - Legal / Compliance Notes

- Use service area / locations answers for Service Area / Locations.

- Use pricing questions (“show starting price vs range vs contact us”) for Pricing Strategy.
  If they provide numbers, mention them briefly; if not, keep it general.

- Use timeline / urgency answers for:
  - Urgency / Time Sensitivity
  - Project Urgency / Timeline

- Anything else they type in “anything else” or similar open fields goes under:
  - Notes from Client
  - Notes about scheduling, hours, availability (if timing-related)

RULES:

- Do NOT invent details. If something is missing, write "Not provided" or "TBD".
- Be concise. Prefer short sentences and bullet-style lines.
- Do NOT output any extra explanation, comments, or code fences. Only the final Markdown.
- Keep the structure and headings exactly as shown above.
"""


def sanitize_raw_intake(raw_text: str) -> str:
    """Send raw form answers to the model and return a structured intake.md string."""
    response = client.chat.completions.create(
        model=MODEL_SANITIZER,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    "Here are the raw answers from a client form. "
                    "Normalize them into the structured Markdown described above:\n\n"
                    + raw_text
                ),
            },
        ],
    )

    content = response.choices[0].message.content
    return content.strip()


def main():
    if len(sys.argv) != 2:
        print("Usage: python automation/intake_sanitizer.py path/to/clients/<id>/intake-raw.md")
        sys.exit(1)

    raw_path = Path(sys.argv[1]).resolve()
    if not raw_path.exists():
        print(f"ERROR: {raw_path} does not exist.")
        sys.exit(1)

    client_dir = raw_path.parent
    intake_md_path = client_dir / "intake.md"
    archive_path = client_dir / "intake-source.md"

    with raw_path.open("r", encoding="utf-8") as f:
        raw_text = f.read()

    print(f"Sanitizing raw intake for client folder: {client_dir.name}...")
    structured = sanitize_raw_intake(raw_text)

    # Write normalized intake.md
    with intake_md_path.open("w", encoding="utf-8") as f:
        f.write(structured + "\n")

    # Archive original raw file
    raw_path.rename(archive_path)

    print(f"✅ Wrote {intake_md_path.name} and archived original as {archive_path.name}")


if __name__ == "__main__":
    main()