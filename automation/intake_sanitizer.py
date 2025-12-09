import os
import sys
import re
import time
import logging
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# 1. SETUP
load_dotenv()

# Configure logging
logging.getLogger("SANITIZER").setLevel(logging.INFO)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - [SANITIZER] - %(message)s')

client = OpenAI()

# Model: GPT-5 Nano - $0.05/$0.40 per 1M tokens (20x cheaper than Haiku)
# Perfect for structured extraction tasks like intake sanitization
MODEL_SANITIZER = os.getenv("MODEL_SANITIZER", "gpt-5-nano-latest")

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

RULES:
- Do NOT invent details. If something is missing, write "Not provided" or "TBD".
- Be concise. Prefer short sentences and bullet-style lines.
- Do NOT output any extra explanation, comments, or code fences. Only the final Markdown.
"""

def sanitize_raw_intake(raw_text: str) -> str:
    """Send raw form answers to the model and return a structured intake.md string."""
    max_retries = 3
    
    for attempt in range(max_retries):
        try:
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

            content = response.choices[0].message.content or ""
            
            # Robust Extraction: Remove markdown code fences if present
            # Matches ```markdown ... ``` or just ``` ... ```
            match = re.search(r'```(?:markdown)?(.*?)```', content, re.DOTALL)
            if match:
                return match.group(1).strip()
            
            return content.strip()

        except Exception as e:
            logging.warning(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)  # Wait 2 seconds before retrying
            else:
                logging.error("❌ Max retries reached. API call failed.")
                raise e

def main():
    if len(sys.argv) != 2:
        print("Usage: python automation/intake_sanitizer.py path/to/clients/<id>/intake-raw.md")
        sys.exit(1)

    raw_path = Path(sys.argv[1]).resolve()
    if not raw_path.exists():
        logging.error(f"ERROR: {raw_path} does not exist.")
        sys.exit(1)

    client_dir = raw_path.parent
    intake_md_path = client_dir / "intake.md"
    archive_path = client_dir / "intake-source.md"

    # Silent failure check
    with raw_path.open("r", encoding="utf-8") as f:
        raw_text = f.read()
    
    if not raw_text.strip():
        logging.error(f"❌ Input file {raw_path.name} is empty. Skipping.")
        sys.exit(1)

    logging.info(f"Sanitizing raw intake for client folder: {client_dir.name}...")
    
    try:
        structured = sanitize_raw_intake(raw_text)

        # Write normalized intake.md
        with intake_md_path.open("w", encoding="utf-8") as f:
            f.write(structured + "\n")

        # Atomic move for Windows compatibility
        os.replace(raw_path, archive_path)

        logging.info(f"✅ Wrote {intake_md_path.name} and archived original as {archive_path.name}")

    except Exception as e:
        logging.error(f"❌ Critical failure: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()