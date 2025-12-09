import time
import os
import logging
import requests
import subprocess
import base64
import re
from dotenv import load_dotenv
from openai import OpenAI
from anthropic import Anthropic
from playwright.sync_api import sync_playwright
from automation import time_tracker, cost_tracker

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
MODEL_STRATEGY = "claude-opus-4-5-20251101"
MODEL_CODER = "claude-sonnet-4-5-20250929"
MODEL_COPY = "claude-sonnet-4-5-20250929"
MODEL_QA = "claude-haiku-4-5-20251015"
MODEL_ROUTER = "claude-haiku-4-5-20251015"     # Fast classification
MODEL_CRITIC = "claude-sonnet-4-5-20250929"    # Quality review         

# Config
WATCH_DIR = "./clients"
LIBRARY_PATH = "./design-system/manifest.md"
PROMPTS_DIR = "./prompts"
BATCH_INTERVAL = 3600  # Check every 1 hour
MAX_CRITIC_RETRIES = 3  # Hard stop for critic loop to prevent infinite API costs

def _extract_usage_tokens(response):
    """Best-effort extraction of token usage from API responses."""
    usage = getattr(response, "usage", None)
    if usage:
        input_tokens = getattr(usage, "input_tokens", None) or usage.get("input_tokens") if isinstance(usage, dict) else None
        output_tokens = getattr(usage, "output_tokens", None) or usage.get("output_tokens") if isinstance(usage, dict) else None
        return input_tokens, output_tokens
    return None, None


def _record_model_cost(provider, model, activity, client_id, response, metadata=None):
    """Send usage data to cost tracker; ignore errors to keep pipeline resilient."""
    try:
        in_tokens, out_tokens = _extract_usage_tokens(response)
        cost_tracker.record_api_cost(
            provider=provider,
            model=model,
            client_id=client_id,
            activity=activity,
            input_tokens=in_tokens,
            output_tokens=out_tokens,
            metadata=metadata or {},
        )
    except Exception as e:
        logging.warning(f"Cost tracking failed for {provider}:{model} - {e}")


def _extract_response_text(response, default=None):
    """
    Safely extract text content from an Anthropic API response.

    Args:
        response: The API response object
        default: Value to return if extraction fails (default: None)

    Returns:
        str: The extracted text, or default if extraction fails
    """
    try:
        if response and hasattr(response, 'content') and response.content:
            first_block = response.content[0]
            if hasattr(first_block, 'text') and first_block.text:
                return first_block.text
        return default
    except (IndexError, AttributeError, TypeError):
        return default


def _load_prompt(prompt_path):
    """Load a prompt from the prompts directory."""
    full_path = os.path.join(PROMPTS_DIR, prompt_path)
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Prompt file not found: {full_path}")
    with open(full_path, "r", encoding="utf-8") as f:
        return f.read()


# Required prompt files for the Router-Critic-Library architecture
REQUIRED_PROMPTS = [
    "router.md",
    "strategy/saas.md",
    "strategy/local_service.md",
    "strategy/ecommerce.md",
    "strategy/personal_brand.md",
    "critique/strategy_critic.md",
]


def validate_prompt_library():
    """
    Validate that all required prompt files exist at startup.
    Returns True if all prompts are present, False otherwise.
    Logs specific errors for any missing files.
    """
    all_valid = True

    if not os.path.exists(PROMPTS_DIR):
        logging.error(f"❌ Prompts directory not found: {PROMPTS_DIR}")
        return False

    for prompt_file in REQUIRED_PROMPTS:
        full_path = os.path.join(PROMPTS_DIR, prompt_file)
        if not os.path.exists(full_path):
            logging.error(f"❌ Missing required prompt: {full_path}")
            all_valid = False
        else:
            logging.debug(f"✓ Found prompt: {prompt_file}")

    if all_valid:
        logging.info(f"✅ All {len(REQUIRED_PROMPTS)} prompt files validated.")

    return all_valid


def select_niche_persona(client_id, intake):
    """
    Router function: Classify the client into a niche and return the matching strategy prompt filename.

    Args:
        client_id: The client identifier (used for logging and cost tracking)
        intake: The intake content (already loaded to avoid duplicate file reads)

    Returns:
        str: Filename of the matching strategy prompt (e.g., "saas.md", "local_service.md", "ecommerce.md")
    """
    logging.info(f"🔀 Router classifying {client_id}...")

    # Load router prompt
    router_prompt = _load_prompt("router.md")

    # Ask LLM to classify
    msg = client_anthropic.messages.create(
        model=MODEL_ROUTER,
        max_tokens=50,
        system=router_prompt,
        messages=[{"role": "user", "content": intake}]
    )
    _record_model_cost("anthropic", MODEL_ROUTER, "router_classify", client_id, msg)

    # Parse response - expect one of: saas, local_service, ecommerce
    response_text = _extract_response_text(msg)
    if not response_text:
        logging.warning("⚠️ Router returned empty response, defaulting to local_service")
        return "local_service.md"

    niche = response_text.strip().lower()

    # Validate and map to filename
    valid_niches = {
        "saas": "saas.md",
        "local_service": "local_service.md",
        "ecommerce": "ecommerce.md",
        "personal_brand": "personal_brand.md"
    }

    if niche not in valid_niches:
        logging.warning(f"⚠️ Router returned unknown niche '{niche}', defaulting to local_service")
        niche = "local_service"

    logging.info(f"📋 Client classified as: {niche}")
    return valid_niches[niche]


# 2. HELPER FUNCTIONS

def git_pull():
    """Checks for new intake forms from GitHub."""
    logging.info("⬇️  Checking GitHub for new intakes...")
    try:
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

def git_commit_and_push(client_id):
    """Commits and pushes generated code to the repository."""
    logging.info(f"💾 Committing changes for {client_id}...")
    try:
        # Stage all changes (new pages, tracking files, processed intakes)
        subprocess.run(["git", "add", "."], check=True, capture_output=True)
        
        # Commit
        commit_msg = f"feat: Auto-generated landing page for {client_id}"
        subprocess.run(["git", "commit", "-m", commit_msg], check=True, capture_output=True)
        
        # Push
        subprocess.run(["git", "push"], check=True, capture_output=True)
        logging.info("✅ Git push successful.")
    except subprocess.CalledProcessError as e:
        # Don't crash the loop if git fails, just log it
        error_msg = e.stderr.decode() if e.stderr else str(e)
        logging.error(f"❌ Git commit/push failed: {error_msg}")

def run_intake_sanitizer():
    """Converts any raw intakes (intake-raw.md) to structured intakes (intake.md)."""
    if not os.path.exists(WATCH_DIR):
        return

    for client_id in os.listdir(WATCH_DIR):
        client_path = os.path.join(WATCH_DIR, client_id)
        raw_intake_path = os.path.join(client_path, "intake-raw.md")

        if os.path.isdir(client_path) and os.path.exists(raw_intake_path):
            logging.info(f"📝 Sanitizing raw intake for {client_id}...")
            try:
                result = subprocess.run(
                    ["python", "automation/intake_sanitizer.py", raw_intake_path],
                    capture_output=True, text=True
                )
                if result.returncode == 0:
                    logging.info(f"✅ Sanitized intake for {client_id}")
                else:
                    logging.error(f"❌ Sanitizer failed for {client_id}: {result.stderr}")
            except Exception as e:
                logging.error(f"❌ Sanitizer error for {client_id}: {e}")

def check_server_status():
    """Simple check if localhost:3000 is reachable."""
    try:
        requests.get("http://localhost:3000", timeout=2)
        return True
    except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
        return False

def ensure_server_running():
    """Ensures dev server is up. Attempts to start it if down."""
    if check_server_status():
        return True
        
    logging.warning("⚠️ localhost:3000 is down. Attempting to start dev server...")
    try:
        # Start npm run dev in the background
        # Note: This process will die if the script exits, which is usually fine for a worker
        subprocess.Popen(
            ["npm", "run", "dev"], 
            stdout=subprocess.DEVNULL, 
            stderr=subprocess.DEVNULL,
            shell=True if os.name == 'nt' else False
        )
        
        # Wait up to 15 seconds for it to boot
        for _ in range(15):
            time.sleep(1)
            if check_server_status():
                logging.info("✅ Server started successfully.")
                return True
                
        logging.error("❌ Failed to start server within timeout.")
        return False
    except Exception as e:
        logging.error(f"❌ Error starting server: {e}")
        return False

def send_discord_alert(client_name, status, report=None):
    """Send Discord notification for build status. Fails silently to keep pipeline resilient."""
    if not webhook_url:
        logging.warning("⚠️ DISCORD_WEBHOOK_URL not set. Skipping Discord notification.")
        return
    
    try:
        # Color codes: Green (Success), Red (Failure), Orange (Warning)
        if status == "SUCCESS":
            color = 5763719 
            title = f"🚀 Build Ready: {client_name}"
            desc = "Build complete. Ready for final approval."
        elif status == "QA_FAILED":
            color = 15548997 
            title = f"⚠️ QA Failed: {client_name}"
            desc = "Issues found during visual inspection."
        else: # WARNING
            color = 16776960
            title = f"⚠️ Build Warning: {client_name}"
            desc = "Build finished but QA could not be run."
        
        embed = {
            "title": title,
            "description": desc,
            "color": color,
            "fields": [
                {"name": "Location", "value": f"`clients/{client_name}/`", "inline": False}
            ],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
        }
        
        if report:
            # Truncate report for Discord embed limit (Discord field value limit is 1024 chars)
            report_text = report[:900] + "..." if len(report) > 900 else report
            embed["fields"].append({"name": "Report Details", "value": report_text, "inline": False})

        response = requests.post(
            webhook_url, 
            json={
                "username": "Factory Manager", 
                "content": f"Update for: {client_name}", 
                "embeds": [embed]
            },
            timeout=10
        )
        
        # Check if request was successful
        if response.status_code == 204:
            logging.info(f"✅ Discord notification sent for {client_name}")
        elif response.status_code == 404:
            logging.error(f"❌ Discord webhook not found (404). Check webhook URL.")
        elif response.status_code == 401:
            logging.error(f"❌ Discord webhook unauthorized (401). Check webhook URL.")
        else:
            logging.warning(f"⚠️ Discord webhook returned status {response.status_code}: {response.text}")
            
    except requests.exceptions.Timeout:
        logging.warning(f"⚠️ Discord webhook request timed out for {client_name}")
    except requests.exceptions.RequestException as e:
        logging.warning(f"⚠️ Discord notification failed for {client_name}: {e}")
    except Exception as e:
        logging.warning(f"⚠️ Unexpected error sending Discord notification: {e}")

# 3. WORKER AGENTS

def run_architect(client_path):
    """
    Architect agent with Router-Critic-Library architecture.

    1. Router: Classifies client into a niche (SaaS, Local, Ecom)
    2. Strategist: Generates brief using niche-specific prompt
    3. Critic: Reviews brief against intake, requests regeneration if needed
    4. Data Logging: Saves original AI output as brief.orig.md
    """
    client_id = os.path.basename(client_path)
    logging.info(f"🏗️  Architect analyzing {client_id}...")

    # Load intake ONCE (before time tracking to avoid including file I/O in span)
    with open(f"{client_path}/intake.md", "r", encoding="utf-8") as f:
        intake = f.read()

    with time_tracker.track_span("pipeline_architect", client_id, {"stage": "architect"}):
        # Step 1: Router - Classify the client niche
        niche_prompt_file = select_niche_persona(client_id, intake)
        strategy_prompt = _load_prompt(f"strategy/{niche_prompt_file}")

        # Step 2: Load the Critic prompt
        critic_prompt = _load_prompt("critique/strategy_critic.md")

        # Step 3: Critic Loop with max retries
        brief_content = None
        previous_feedback = None
        attempt = 0

        while attempt < MAX_CRITIC_RETRIES:
            attempt += 1
            logging.info(f"📝 Strategist generating brief (attempt {attempt}/{MAX_CRITIC_RETRIES})...")

            # Build messages for the strategist
            if previous_feedback:
                # Include feedback from previous failed attempt
                user_content = f"""## Client Intake
{intake}

## Previous Attempt Feedback
The previous brief was rejected by our QA system. Please address these issues:
{previous_feedback}

Generate an improved Project Brief that addresses the feedback above."""
            else:
                user_content = intake

            # Generate brief
            msg = client_anthropic.messages.create(
                model=MODEL_STRATEGY,
                max_tokens=2000,
                system=strategy_prompt,
                messages=[{"role": "user", "content": user_content}]
            )
            _record_model_cost(
                "anthropic", MODEL_STRATEGY, "pipeline_architect",
                client_id, msg, {"attempt": attempt, "niche": niche_prompt_file}
            )

            brief_content = _extract_response_text(msg)
            if not brief_content:
                logging.error(f"❌ Strategist returned empty response on attempt {attempt}")
                if attempt >= MAX_CRITIC_RETRIES:
                    raise RuntimeError(f"Strategist failed to generate brief after {MAX_CRITIC_RETRIES} attempts")
                continue  # Retry without critic feedback

            # Step 4: Critic reviews the brief
            logging.info(f"🔍 Critic reviewing brief (attempt {attempt})...")

            critic_input = f"""## Original Client Intake
{intake}

## Generated Project Brief
{brief_content}

Please evaluate this brief against the original intake."""

            critic_msg = client_anthropic.messages.create(
                model=MODEL_CRITIC,
                max_tokens=500,
                system=critic_prompt,
                messages=[{"role": "user", "content": critic_input}]
            )
            _record_model_cost(
                "anthropic", MODEL_CRITIC, "pipeline_architect_critic",
                client_id, critic_msg, {"attempt": attempt}
            )

            critic_response_text = _extract_response_text(critic_msg)
            if not critic_response_text:
                logging.warning(f"⚠️ Critic returned empty response on attempt {attempt}. Treating as PASS.")
                break

            critic_response = critic_response_text.strip()

            # Step 5: Decision - PASS or FAIL
            # IMPORTANT: Check FAIL first to avoid false positives when "PASS" appears in failure text
            if critic_response.startswith("FAIL"):
                logging.warning(f"⚠️ Critic rejected brief on attempt {attempt}")
                previous_feedback = critic_response
                if attempt >= MAX_CRITIC_RETRIES:
                    logging.error(f"❌ Max critic retries ({MAX_CRITIC_RETRIES}) reached. Using last generated brief.")
                    break  # Explicit break to exit loop after max retries
            elif critic_response.startswith("PASS"):
                logging.info(f"✅ Critic approved brief on attempt {attempt}")
                break
            else:
                # Ambiguous response - treat as pass but log warning
                logging.warning(f"⚠️ Critic response unclear (no PASS/FAIL). Proceeding with brief.")
                break

        # Step 6: Save the brief
        # Save immutable original for future optimization analysis
        with open(f"{client_path}/brief.orig.md", "w", encoding="utf-8") as f:
            f.write(brief_content)
        logging.info(f"💾 Saved original AI output to brief.orig.md")

        # Save the working copy
        with open(f"{client_path}/brief.md", "w", encoding="utf-8") as f:
            f.write(brief_content)

    # NOTE: We do NOT rename intake.md yet. We wait until the entire pipeline finishes.
    # This prevents the "Limbo" state if the script crashes later.
    run_copywriter(client_path)

def run_copywriter(client_path):
    client_id = os.path.basename(client_path)
    logging.info(f"✍️  Copywriter writing for {client_id}...")
    with time_tracker.track_span("pipeline_copywriter", client_id, {"stage": "copywriter"}):
        with open(f"{client_path}/brief.md", "r", encoding="utf-8") as f:
            brief = f.read()

        prompt = "You are a Conversion Copywriter. Write website content (Hero, Features, Testimonials) based on this brief. Output Markdown."

        msg = client_anthropic.messages.create(
            model=MODEL_COPY, max_tokens=4000, system=prompt,
            messages=[{"role": "user", "content": brief}]
        )
        _record_model_cost("anthropic", MODEL_COPY, "pipeline_copywriter", client_id, msg)

        with open(f"{client_path}/content.md", "w", encoding="utf-8") as f:
            f.write(msg.content[0].text)

    run_builder(client_path)

def run_builder(client_path):
    client_id = os.path.basename(client_path)
    logging.info(f"🧱 Builder assembling {client_id}...")
    
    with time_tracker.track_span("pipeline_builder", client_id, {"stage": "builder"}):
        with open(f"{client_path}/brief.md", "r", encoding="utf-8") as f:
            brief = f.read()
        with open(f"{client_path}/content.md", "r", encoding="utf-8") as f:
            content = f.read()
        
        manifest = ""
        if os.path.exists(LIBRARY_PATH):
            with open(LIBRARY_PATH, "r", encoding="utf-8") as f:
                manifest = f.read()
        else:
            logging.warning("⚠️ Library Manifest not found. AI will generate raw code.")
        
        prompt = f"""
        You are a React Engineer. 
        Your goal: Create the `page.tsx` file for a Next.js landing page.
        
        1. Read the Content and Brief.
        2. Select components ONLY from the Library Manifest below.
        3. Map the content into the component props.
        4. Output ONLY the code for `page.tsx` inside a code block.
        
        MANIFEST:
        {manifest}
        """
        
        msg = client_anthropic.messages.create(
            model=MODEL_CODER, max_tokens=4000, system=prompt,
            messages=[{"role": "user", "content": f"Brief: {brief}\n\nContent: {content}"}]
        )
        _record_model_cost("anthropic", MODEL_CODER, "pipeline_builder", client_id, msg)
        
        raw_response = msg.content[0].text
        
        # Robust Code Extraction (Fix #2)
        # Looks for ```tsx or ```typescript or just ``` and captures content inside
        match = re.search(r'```(?:tsx|typescript)?(.*?)```', raw_response, re.DOTALL)
        if match:
            code = match.group(1).strip()
        else:
            logging.warning("⚠️ No code blocks found in Builder response. Using raw output (might fail).")
            code = raw_response
        
        target_file = f"./app/clients/{client_id}/page.tsx"
        os.makedirs(os.path.dirname(target_file), exist_ok=True)
        
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(code)
    
    logging.info("✅ Build Complete.")
    run_qa(client_path)

def run_qa(client_path):
    client_id = os.path.basename(client_path)
    
    # Server Check with Auto-Start (Fix #4)
    server_ready = ensure_server_running()
    
    if not server_ready:
        logging.error("❌ Server unavailable. QA Failed.")
        send_discord_alert(client_id, "WARNING", "QA Skipped - Server Down")
        # We proceed to commit anyway so the code is saved, but we warn the user
    else:
        with time_tracker.track_span("pipeline_qa", client_id, {"stage": "qa"}):
            logging.info("🕵️‍♂️ QA Inspector starting...")
            url = f"http://localhost:3000/clients/{client_id}"
            screenshot_path = f"{client_path}/qa_mobile.jpg"
            
            try:
                with sync_playwright() as p:
                    browser = p.chromium.launch()
                    page = browser.new_page(viewport={"width": 390, "height": 844})
                    page.goto(url)
                    page.wait_for_timeout(3000) # Wait for hydration
                    page.screenshot(path=screenshot_path, full_page=True)
                    browser.close()

                # Analyze with Vision Model
                with open(screenshot_path, "rb") as f:
                    img_b64 = base64.b64encode(f.read()).decode("utf-8")
                    
                msg = client_anthropic.messages.create(
                    model=MODEL_QA, max_tokens=1000,
                    messages=[{
                        "role": "user",
                        "content": [
                            {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": img_b64}},
                            {"type": "text", "text": "Review this UI. Return 'PASS' if good. If bad, list high severity issues."}
                        ]
                    }]
                )
                _record_model_cost("anthropic", MODEL_QA, "pipeline_qa", client_id, msg)
                
                report = msg.content[0].text
                with open(f"{client_path}/qa_report.md", "w", encoding="utf-8") as f: f.write(report)
                
                status = "SUCCESS" if "PASS" in report else "QA_FAILED"
                send_discord_alert(client_id, status, report)

            except Exception as e:
                logging.error(f"❌ Visual QA Error: {e}")
                send_discord_alert(client_id, "WARNING", f"QA Crashed: {str(e)}")

    # Finalization Steps (Fix #1 & #3)
    # 1. Commit and Push everything to Git
    git_commit_and_push(client_id)
    
    # 2. Mark as processed ONLY after everything is done/saved
    logging.info(f"🏁 Finalizing job for {client_id}...")
    try:
        os.rename(f"{client_path}/intake.md", f"{client_path}/intake-processed.md")
    except OSError as e:
        logging.error(f"⚠️ Failed to rename intake.md: {e}")

# 4. MAIN BATCH LOOP
if __name__ == "__main__":
    print("\n🏭  FACTORY V3.0 ONLINE: Router-Critic-Library Mode  🏭")

    # Validate prompt library before starting
    logging.info("📚 Validating prompt library...")
    if not validate_prompt_library():
        logging.error("❌ FATAL: Required prompt files are missing. Cannot start factory.")
        logging.error("Please ensure all files exist in the prompts/ directory.")
        exit(1)

    # Ensure environment is ready (Fix #5)
    logging.info("🎭 Checking Playwright browsers...")
    try:
        subprocess.run(["playwright", "install", "chromium"], check=True, capture_output=True)
        logging.info("✅ Browsers ready.")
    except Exception as e:
        logging.error(f"❌ Playwright install failed: {e}")
        logging.warning("Visual QA may fail.")

    while True:
        has_new_data = git_pull()
        run_intake_sanitizer()

        if os.path.exists(WATCH_DIR):
            for client_id in os.listdir(WATCH_DIR):
                path = os.path.join(WATCH_DIR, client_id)
                # Look for unprocessed intake files
                if os.path.isdir(path) and os.path.exists(f"{path}/intake.md"):
                    logging.info(f"🚀 Found pending job: {client_id}")
                    try:
                        run_architect(path)
                    except Exception as e:
                        logging.error(f"❌ Pipeline crashed for {client_id}: {e}")
                        # Since we didn't rename intake.md, it will be retried next loop

        logging.info(f"💤 Batch complete. Sleeping for {BATCH_INTERVAL/60} minutes...")
        time.sleep(BATCH_INTERVAL)
