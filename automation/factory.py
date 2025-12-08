import time
import os
import logging
import requests
import subprocess
import base64
from dotenv import load_dotenv
from openai import OpenAI
from anthropic import Anthropic
from playwright.sync_api import sync_playwright

# 1. SETUP
load_dotenv()
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - [FACTORY] - %(message)s', 
    datefmt='%H:%M:%S'
)

client_openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
client_anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
webhook_url = os.getenv("DISCORD_WEBHOOK_URL")

# Models (Dec 2025)
MODEL_STRATEGY = "claude-opus-4-5-20251101"    # Opus for strategic briefs (best reasoning)
MODEL_CODER = "claude-sonnet-4-5-20250929"     # Sonnet for code generation
MODEL_COPY = "gpt-5.1"

# Config
WATCH_DIR = "./clients"
LIBRARY_PATH = "./design-system/manifest.md"
BATCH_INTERVAL = 3600  # Check every 1 hour

# 2. HELPER FUNCTIONS

def git_pull():
    """Checks for new intake forms from GitHub."""
    logging.info("⬇️  Checking GitHub for new intakes...")
    try:
        # Run git pull and capture output
        result = subprocess.run(["git", "pull"], capture_output=True, text=True)
        
        if "Already up to date" not in result.stdout:
            logging.info("📦 New data downloaded from GitHub.")
            return True
        else:
            logging.info("💤 No new data on GitHub.")
            return False
    except Exception as e:
        logging.error(f"Git Pull Failed: {e}")
        return False

def check_server_status():
    """Verifies that the Next.js dev server is running before QA."""
    try:
        requests.get("http://localhost:3000")
        return True
    except requests.exceptions.ConnectionError:
        return False

def send_discord_alert(client_name, status, report=None):
    if not webhook_url: return
    
    color = 5763719 if status == "SUCCESS" else 15548997 # Green or Red
    description = "Build complete. Ready for final approval." if status == "SUCCESS" else "Issues found during QA."
    
    embed = {
        "title": f"🚀 Build Ready: {client_name}" if status == "SUCCESS" else f"⚠️ QA Failed: {client_name}",
        "description": description,
        "color": color,
        "fields": [
            {"name": "Location", "value": f"`clients/{client_name}/`", "inline": False}
        ]
    }
    
    if report:
        # Truncate report for Discord embed limit
        embed["fields"].append({"name": "QA Report", "value": report[:900] + "..."})

    # 'content' ensures it shows up on Lock Screen
    requests.post(webhook_url, json={
        "username": "Factory Manager", 
        "content": f"🚀 Ready for Build: {client_name}", 
        "embeds": [embed]
    })

# 3. WORKER AGENTS

def run_architect(client_path):
    logging.info(f"🏗️  Architect analyzing {os.path.basename(client_path)}...")
    with open(f"{client_path}/intake.md", "r") as f: intake = f.read()
    
    prompt = "You are a Senior Strategist. Create a Project Brief from these notes. Sections: Overview, Brand Colors, Sitemap, Layout Strategy."
    
    msg = client_anthropic.messages.create(
        model=MODEL_STRATEGY, max_tokens=2000, system=prompt,
        messages=[{"role": "user", "content": intake}]
    )
    
    with open(f"{client_path}/brief.md", "w") as f: f.write(msg.content[0].text)
    
    # Mark intake as processed so we don't loop it again
    os.rename(f"{client_path}/intake.md", f"{client_path}/intake-processed.md")
    
    run_copywriter(client_path)

def run_copywriter(client_path):
    logging.info(f"✍️  Copywriter writing for {os.path.basename(client_path)}...")
    with open(f"{client_path}/brief.md", "r") as f: brief = f.read()
    
    prompt = "You are a Conversion Copywriter. Write website content (Hero, Features, Testimonials) based on this brief. Output Markdown."
    
    res = client_openai.chat.completions.create(
        model=MODEL_COPY,
        messages=[{"role": "system", "content": prompt}, {"role": "user", "content": brief}]
    )
    
    with open(f"{client_path}/content.md", "w") as f: f.write(res.choices[0].message.content)
    
    run_builder(client_path)

def run_builder(client_path):
    logging.info(f"🧱 Builder assembling {os.path.basename(client_path)}...")
    
    with open(f"{client_path}/brief.md", "r") as f: brief = f.read()
    with open(f"{client_path}/content.md", "r") as f: content = f.read()
    
    # Check if Library Manifest exists, otherwise warn
    manifest = ""
    if os.path.exists(LIBRARY_PATH):
        with open(LIBRARY_PATH, "r") as f: manifest = f.read()
    else:
        logging.warning("⚠️ Library Manifest not found. AI will generate raw code.")
    
    prompt = f"""
    You are a React Engineer. 
    Your goal: Create the `page.tsx` file for a Next.js landing page.
    
    1. Read the Content and Brief.
    2. Select components ONLY from the Library Manifest below.
    3. Map the content into the component props.
    4. Output ONLY the code for `page.tsx`.
    
    MANIFEST:
    {manifest}
    """
    
    msg = client_anthropic.messages.create(
        model=MODEL_CODER, max_tokens=4000, system=prompt,
        messages=[{"role": "user", "content": f"Brief: {brief}\n\nContent: {content}"}]
    )
    
    code = msg.content[0].text
    
    # Simple cleaner for markdown code blocks
    code = code.replace("```tsx", "").replace("```typescript", "").replace("```", "")
    
    # Output file location
    target_file = f"./app/clients/{os.path.basename(client_path)}/page.tsx"
    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    
    with open(target_file, "w") as f: f.write(code)
    
    logging.info("✅ Build Complete.")
    run_qa(client_path)

def run_qa(client_path):
    client_id = os.path.basename(client_path)
    
    # Safety Check: Is Server Running?
    if not check_server_status():
        logging.warning("⚠️  localhost:3000 is down. Skipping Visual QA.")
        send_discord_alert(client_id, "SUCCESS", "QA Skipped (Server Down). Code is ready for review.")
        return

    logging.info("🕵️‍♂️ QA Inspector starting...")
    url = f"http://localhost:3000/clients/{client_id}"
    screenshot_path = f"{client_path}/qa_mobile.jpg"
    
    # 1. Capture
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.goto(url)
        page.wait_for_timeout(2000) # Wait for hydration
        page.screenshot(path=screenshot_path, full_page=True)
        browser.close()

    # 2. Analyze
    with open(screenshot_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")
        
    msg = client_anthropic.messages.create(
        model=MODEL_CODER, max_tokens=1000,
        messages=[{
            "role": "user", 
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": img_b64}},
                {"type": "text", "text": "Review this UI. Return 'PASS' if good. If bad, list high severity issues."}
            ]
        }]
    )
    
    report = msg.content[0].text
    with open(f"{client_path}/qa_report.md", "w") as f: f.write(report)
    
    status = "SUCCESS" if "PASS" in report else "REVIEW"
    send_discord_alert(client_id, status, report)

# 4. MAIN BATCH LOOP
if __name__ == "__main__":
    print("\n🏭  FACTORY V2 ONLINE: Batch Mode (1 Hour Interval)  🏭")
    
    while True:
        # 1. Pull latest data
        has_new_data = git_pull()
        
        # 2. Process ALL pending intakes
        # (We check regardless of git pull result, just in case manual files were added)
        if os.path.exists(WATCH_DIR):
            for client_id in os.listdir(WATCH_DIR):
                path = os.path.join(WATCH_DIR, client_id)
                # Look for unprocessed intake files
                if os.path.isdir(path) and os.path.exists(f"{path}/intake.md"):
                    logging.info(f"🚀 Found pending job: {client_id}")
                    run_architect(path)

        logging.info(f"💤 Batch complete. Sleeping for {BATCH_INTERVAL/60} minutes...")
        time.sleep(BATCH_INTERVAL)
