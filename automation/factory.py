import time
import os
import logging
import requests
import subprocess
import base64
import re
import json
import tempfile
from typing import Tuple, Optional, Dict, Any
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError, CancelledError
from dotenv import load_dotenv
from openai import OpenAI
from anthropic import Anthropic
from playwright.sync_api import sync_playwright
from automation import time_tracker, cost_tracker
from automation import memory

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
    "strategy/webinar.md",
    "critique/strategy_critic.md",
    "critique/copy_critic.md",
    "critique/a11y_critic.md",
    "design/palette_generator.md",
]

# Max retries for self-correcting loops
MAX_SYNTAX_RETRIES = 3
MAX_VISUAL_REPAIR_RETRIES = 3
MAX_A11Y_RETRIES = 3


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
    Classify a client's intake into a niche and return the corresponding strategy prompt filename.
    
    Parameters:
        client_id (str): Client identifier used for logging and cost tracking.
        intake (str): The intake text to be classified.
    
    Returns:
        str: Filename of the matched strategy prompt (for example "saas.md", "local_service.md", "ecommerce.md", "personal_brand.md", or "webinar.md").  
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
        "saas_b2b": "saas.md",
        "local_service": "local_service.md",
        "ecommerce": "ecommerce.md",
        "ecommerce_dtc": "ecommerce.md",
        "personal_brand": "personal_brand.md",
        "webinar_funnel": "webinar.md"
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


def check_syntax(code_string: str, client_id: str = "unknown") -> Tuple[bool, str]:
    """
    Validate TypeScript/TSX code syntax by running the TypeScript compiler.

    Saves the code to a temporary file and runs `npx tsc --noEmit --skipLibCheck --jsx preserve`.
    This catches syntax errors, type errors, and import issues before the code is saved.

    Parameters:
        code_string: The TypeScript/TSX code to validate
        client_id: Client identifier for logging purposes

    Returns:
        Tuple[bool, str]: (success, error_log)
        - success: True if code compiles without errors
        - error_log: Empty string on success, or the compiler error output on failure
    """
    if not code_string or not code_string.strip():
        return (False, "Empty code string provided")

    temp_file = None
    try:
        # Create a temporary .tsx file
        with tempfile.NamedTemporaryFile(
            mode='w',
            suffix='.tsx',
            delete=False,
            encoding='utf-8'
        ) as temp_file:
            temp_file.write(code_string)
            temp_path = temp_file.name

        # Run TypeScript compiler in check-only mode
        result = subprocess.run(
            [
                "npx", "tsc",
                "--noEmit",           # Don't emit output files
                "--skipLibCheck",     # Skip type checking of declaration files
                "--jsx", "preserve",  # Preserve JSX for Next.js
                "--esModuleInterop",  # Enable ES module interop
                "--moduleResolution", "node",
                "--target", "ES2020",
                "--module", "ESNext",
                temp_path
            ],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=os.getcwd()
        )

        if result.returncode == 0:
            logging.info(f"✅ Syntax check passed for {client_id}")
            return (True, "")
        else:
            # Combine stdout and stderr for full error output
            error_output = result.stderr or result.stdout or "Unknown compilation error"
            # Clean up the temp file path from error messages for cleaner logs
            error_output = error_output.replace(temp_path, "page.tsx")
            logging.warning(f"⚠️ Syntax check failed for {client_id}: {error_output[:200]}...")
            return (False, error_output)

    except subprocess.TimeoutExpired:
        error_msg = "TypeScript compilation timed out (30s limit)"
        logging.error(f"❌ {error_msg} for {client_id}")
        return (False, error_msg)

    except FileNotFoundError:
        error_msg = "npx/tsc not found. Ensure Node.js and TypeScript are installed."
        logging.error(f"❌ {error_msg}")
        return (False, error_msg)

    except Exception as e:
        error_msg = f"Syntax check error: {str(e)}"
        logging.error(f"❌ {error_msg} for {client_id}")
        return (False, error_msg)

    finally:
        # Clean up temp file
        if temp_file and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception:
                pass


# 3. WORKER AGENTS

def run_visual_designer(client_path):
    """
    Generate a theme JSON file for a client with accessibility (a11y) critique loop.

    This function now implements a self-correcting loop:
    1. Generate initial theme from intake
    2. Run a11y critic to check color contrast
    3. If a11y fails, feed feedback back to designer and retry (up to MAX_A11Y_RETRIES)

    Parameters:
        client_path (str): Filesystem path of the client directory; must contain an intake.md file.

    Returns:
        dict: Theme data written to theme.json (colors, fonts, and styling values) if generation or fallback succeeded.
        None: If intake.md is missing or the designer failed to produce usable output.
    """
    client_id = os.path.basename(client_path)
    logging.info(f"🎨 Visual Designer generating theme for {client_id}...")

    with time_tracker.track_span("pipeline_visual_designer", client_id, {"stage": "visual_designer"}):
        # Load intake
        intake_path = os.path.join(client_path, "intake.md")
        if not os.path.exists(intake_path):
            logging.warning(f"⚠️ No intake.md found for visual designer in {client_id}")
            return None

        with open(intake_path, "r", encoding="utf-8") as f:
            intake = f.read()

        # Load prompts
        designer_prompt = _load_prompt("design/palette_generator.md")
        a11y_critic_prompt = _load_prompt("critique/a11y_critic.md")

        default_theme = {
            "primary": "#3B82F6",
            "secondary": "#1E40AF",
            "accent": "#F59E0B",
            "background": "white",
            "font_heading": "Inter",
            "font_body": "Inter",
            "border_radius": "0.5rem",
            "source": "generated"
        }

        # A11y Critique Loop
        theme_data = None
        previous_feedback = None
        attempt = 0

        while attempt < MAX_A11Y_RETRIES:
            attempt += 1
            logging.info(f"🎨 Visual Designer attempt {attempt}/{MAX_A11Y_RETRIES}...")

            # Build user content with feedback if available
            if previous_feedback:
                user_content = f"""## Original Client Intake
{intake}

## Previous Theme Feedback (Accessibility Issues)
The previous theme was rejected by our accessibility checker. Please address these issues:
{previous_feedback}

Generate an improved theme.json with better color contrast."""
            else:
                user_content = intake

            # Generate theme
            msg = client_anthropic.messages.create(
                model=MODEL_COPY,
                max_tokens=500,
                system=designer_prompt,
                messages=[{"role": "user", "content": user_content}]
            )
            _record_model_cost("anthropic", MODEL_COPY, "pipeline_visual_designer", client_id, msg, {"attempt": attempt})

            theme_content = _extract_response_text(msg)
            if not theme_content:
                logging.error(f"❌ Visual Designer returned empty response on attempt {attempt}")
                if attempt >= MAX_A11Y_RETRIES:
                    theme_data = default_theme
                    break
                continue

            # Extract JSON from response
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', theme_content)
            if json_match:
                theme_json_str = json_match.group(1).strip()
            else:
                generic_match = re.search(r'```\s*([\s\S]*?)\s*```', theme_content)
                if generic_match:
                    theme_json_str = generic_match.group(1).strip()
                else:
                    theme_json_str = theme_content.strip()

            # Validate JSON
            try:
                theme_data = json.loads(theme_json_str)
                if not isinstance(theme_data, dict):
                    logging.warning("⚠️ Visual Designer returned non-dict JSON (%s), using default", type(theme_data).__name__)
                    theme_data = default_theme
            except json.JSONDecodeError:
                logging.exception("❌ Visual Designer returned invalid JSON on attempt %d", attempt)
                if attempt >= MAX_A11Y_RETRIES:
                    theme_data = default_theme
                    break
                continue

            # A11y Critic Review
            logging.info(f"🔍 A11y Critic reviewing theme (attempt {attempt})...")

            a11y_input = f"""## Theme to Review
```json
{json.dumps(theme_data, indent=2)}
```

Please evaluate the accessibility of this color palette."""

            a11y_msg = client_anthropic.messages.create(
                model=MODEL_CRITIC,
                max_tokens=500,
                system=a11y_critic_prompt,
                messages=[{"role": "user", "content": a11y_input}]
            )
            _record_model_cost("anthropic", MODEL_CRITIC, "pipeline_visual_designer_a11y", client_id, a11y_msg, {"attempt": attempt})

            a11y_response_text = _extract_response_text(a11y_msg)
            if not a11y_response_text:
                logging.warning(f"⚠️ A11y Critic returned empty response on attempt {attempt}. Treating as PASS.")
                break

            a11y_response = a11y_response_text.strip()

            # Decision - PASS or FAIL
            if a11y_response.startswith("FAIL"):
                logging.warning(f"⚠️ A11y Critic rejected theme on attempt {attempt}")
                previous_feedback = a11y_response

                # Record to memory for learning
                memory.record_failure(
                    category="a11y",
                    issue=f"Theme failed accessibility check: {a11y_response[:200]}",
                    fix="Regenerated theme with improved contrast",
                    metadata={"client_id": client_id, "attempt": attempt}
                )

                if attempt >= MAX_A11Y_RETRIES:
                    logging.error(f"❌ Max a11y retries ({MAX_A11Y_RETRIES}) reached. Using last generated theme.")
                    break
            elif a11y_response.startswith("PASS"):
                logging.info(f"✅ A11y Critic approved theme on attempt {attempt}")
                break
            else:
                logging.warning("⚠️ A11y Critic response unclear (no PASS/FAIL). Proceeding with theme.")
                break

        # Ensure we have a valid theme
        if not theme_data:
            theme_data = default_theme

        # Save theme.json
        theme_path = os.path.join(client_path, "theme.json")
        with open(theme_path, "w", encoding="utf-8") as f:
            json.dump(theme_data, f, indent=2)

        logging.info(f"✅ Visual Designer saved theme.json for {client_id}")
        return theme_data


def run_architect(client_path):
    """
    Orchestrates the Architect stage: routes the client to a niche, generates a strategy brief with retrying critic validation, and advances the pipeline.
    
    Spawns the Visual Designer in parallel to produce a theme.json, runs a Router to classify the client's niche, invokes the Strategist to generate a project brief using the niche-specific prompt, and runs a Critic loop that may request regenerated briefs up to MAX_CRITIC_RETRIES. Saves the immutable original brief to brief.orig.md and a working copy to brief.md. Does not rename intake.md; after architect work completes it invokes the Copywriter and waits briefly for the Visual Designer to finish (logs and proceeds if the designer fails or times out).
    
    Parameters:
        client_path (str): Filesystem path to the client's directory (must contain intake.md); the client ID is derived from the directory basename.
    """
    client_id = os.path.basename(client_path)
    logging.info(f"🏗️  Architect analyzing {client_id}...")

    # Load intake ONCE (before time tracking to avoid including file I/O in span)
    with open(os.path.join(client_path, "intake.md"), "r", encoding="utf-8") as f:
        intake = f.read()

    # Spawn Visual Designer in parallel using ThreadPoolExecutor
    # max_workers=2 allows true concurrency: Visual Designer runs while Architect works
    # The Visual Designer only needs intake.md which is already loaded, so no file conflicts
    with ThreadPoolExecutor(max_workers=2) as executor:
        visual_designer_future = executor.submit(run_visual_designer, client_path)

        # NOTE: Visual Designer timing is intentionally excluded from pipeline_architect span
        # since it runs concurrently. Its own timing is tracked via pipeline_visual_designer span.
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
                    logging.warning("⚠️ Critic response unclear (no PASS/FAIL). Proceeding with brief.")
                    break

            # Step 6: Validate and save the brief
            if not brief_content:
                raise RuntimeError(f"Failed to generate brief for {client_id} after {MAX_CRITIC_RETRIES} attempts")

            # Save immutable original for future optimization analysis
            with open(os.path.join(client_path, "brief.orig.md"), "w", encoding="utf-8") as f:
                f.write(brief_content)
            logging.info("Saved original AI output to brief.orig.md")

            # Save the working copy
            with open(os.path.join(client_path, "brief.md"), "w", encoding="utf-8") as f:
                f.write(brief_content)

        # Wait for visual designer to complete
        # NOTE: The ThreadPoolExecutor context manager calls shutdown(wait=True) on exit,
        # so we always wait for completion regardless of timeout. The timeout here only
        # controls when we log a warning - it doesn't actually limit blocking time.
        try:
            visual_designer_future.result(timeout=60)
        except (TimeoutError, FuturesTimeoutError, CancelledError) as e:
            logging.warning("⚠️ Visual Designer timed out or was cancelled: %s", type(e).__name__)

    # NOTE: We do NOT rename intake.md yet. We wait until the entire pipeline finishes.
    # This prevents the "Limbo" state if the script crashes later.
    run_copywriter(client_path)

def run_copywriter(client_path):
    """
    Generate website copy from the client's brief, iteratively validate it with a Copy Critic, and save results.
    
    Runs a critic loop (up to MAX_CRITIC_RETRIES) that:
    - Generates website content (hero, features, testimonials) from the brief.
    - Sends the generated content to a copy critic for review; if the critic returns `FAIL` the feedback is fed back and the model retries.
    - Stops early on a `PASS` or an unclear critic response.
    
    Saves the immutable original AI output to `content.orig.md` and the working copy to `content.md`, then invokes the builder stage.
    
    Raises:
        RuntimeError: If the copywriter model returns no content for every attempt and generation ultimately fails.
    """
    client_id = os.path.basename(client_path)
    logging.info(f"✍️  Copywriter writing for {client_id}...")

    with time_tracker.track_span("pipeline_copywriter", client_id, {"stage": "copywriter"}):
        # Load brief and intake
        with open(os.path.join(client_path, "brief.md"), "r", encoding="utf-8") as f:
            brief = f.read()

        # Load intake for critic comparison
        intake = None
        intake_path = os.path.join(client_path, "intake.md")
        if os.path.exists(intake_path):
            with open(intake_path, "r", encoding="utf-8") as f:
                intake = f.read()
        else:
            # Fallback to processed intake if already renamed
            intake_processed_path = os.path.join(client_path, "intake-processed.md")
            if os.path.exists(intake_processed_path):
                with open(intake_processed_path, "r", encoding="utf-8") as f:
                    intake = f.read()

        # Determine if critic review is possible
        skip_critic = intake is None
        if skip_critic:
            logging.warning("⚠️ No intake file found - skipping Copy Critic review")
            critic_prompt = None
        else:
            critic_prompt = _load_prompt("critique/copy_critic.md")

        copywriter_prompt = "You are a Conversion Copywriter. Write website content (Hero, Features, Testimonials) based on this brief. Output Markdown."

        # Critic Loop with max retries
        content = None
        previous_feedback = None
        attempt = 0

        while attempt < MAX_CRITIC_RETRIES:
            attempt += 1
            logging.info(f"📝 Copywriter generating content (attempt {attempt}/{MAX_CRITIC_RETRIES})...")

            # Build messages for the copywriter
            if previous_feedback:
                user_content = f"""## Project Brief
{brief}

## Previous Attempt Feedback
The previous content was rejected by our Copy Critic. Please address these issues:
{previous_feedback}

Generate improved website content that addresses the feedback above."""
            else:
                user_content = brief

            # Generate content
            msg = client_anthropic.messages.create(
                model=MODEL_COPY,
                max_tokens=4000,
                system=copywriter_prompt,
                messages=[{"role": "user", "content": user_content}]
            )
            _record_model_cost(
                "anthropic", MODEL_COPY, "pipeline_copywriter",
                client_id, msg, {"attempt": attempt}
            )

            content = _extract_response_text(msg)
            if not content:
                logging.error(f"❌ Copywriter returned empty response on attempt {attempt}")
                if attempt >= MAX_CRITIC_RETRIES:
                    raise RuntimeError(f"Copywriter failed to generate content after {MAX_CRITIC_RETRIES} attempts")
                continue

            # Skip critic review if intake is not available
            if skip_critic:
                logging.info("Skipping Copy Critic review - no intake available")
                break

            # Copy Critic reviews the content
            logging.info(f"🔍 Copy Critic reviewing content (attempt {attempt})...")

            critic_input = f"""## Original Client Intake
{intake}

## Project Brief
{brief}

## Generated Website Content
{content}

Please evaluate this content against the intake and brief."""

            critic_msg = client_anthropic.messages.create(
                model=MODEL_CRITIC,
                max_tokens=500,
                system=critic_prompt,
                messages=[{"role": "user", "content": critic_input}]
            )
            _record_model_cost(
                "anthropic", MODEL_CRITIC, "pipeline_copywriter_critic",
                client_id, critic_msg, {"attempt": attempt}
            )

            critic_response_text = _extract_response_text(critic_msg)
            if not critic_response_text:
                logging.warning(f"⚠️ Copy Critic returned empty response on attempt {attempt}. Treating as PASS.")
                break

            critic_response = critic_response_text.strip()

            # Decision - PASS or FAIL
            # IMPORTANT: Check FAIL first to avoid false positives when "PASS" appears in failure text
            if critic_response.startswith("FAIL"):
                logging.warning(f"⚠️ Copy Critic rejected content on attempt {attempt}")
                previous_feedback = critic_response
                if attempt >= MAX_CRITIC_RETRIES:
                    logging.error(f"❌ Max critic retries ({MAX_CRITIC_RETRIES}) reached. Using last generated content.")
                    break
            elif critic_response.startswith("PASS"):
                logging.info(f"✅ Copy Critic approved content on attempt {attempt}")
                break
            else:
                logging.warning("⚠️ Critic response unclear (no PASS/FAIL). Proceeding with content.")
                break

        # Validate content before saving
        if not content:
            raise RuntimeError(f"Failed to generate content for {client_id} after {MAX_CRITIC_RETRIES} attempts")

        # Save immutable original for future analysis
        with open(os.path.join(client_path, "content.orig.md"), "w", encoding="utf-8") as f:
            f.write(content)
        logging.info("Saved original AI output to content.orig.md")

        # Save the working copy
        with open(os.path.join(client_path, "content.md"), "w", encoding="utf-8") as f:
            f.write(content)

    run_builder(client_path)

def run_builder(client_path):
    """
    Generate a Next.js page with self-correcting Generate->Validate->Repair loop.

    This function implements a multi-phase engineering cycle:
    1. Load memory (learned rules) and golden references into prompt
    2. Phase 1 (Syntax): Generate code -> check_syntax -> retry with error log if fail
    3. Phase 2 (Visual): If syntax passes -> save file -> run_qa
    4. Phase 3 (Repair): If QA fails -> record to memory -> feed screenshot + report -> retry
    5. Phase 4 (Commit): When QA passes (or max retries hit), finalize

    Parameters:
        client_path (str): Path to the client directory (contains brief.md, content.md,
                          and optionally theme.json). Client ID is derived from basename.
    """
    client_id = os.path.basename(client_path)
    logging.info(f"🧱 Builder assembling {client_id} (Self-Correcting Mode)...")

    with time_tracker.track_span("pipeline_builder", client_id, {"stage": "builder"}):
        # Load inputs
        with open(os.path.join(client_path, "brief.md"), "r", encoding="utf-8") as f:
            brief = f.read()
        with open(os.path.join(client_path, "content.md"), "r", encoding="utf-8") as f:
            content = f.read()

        manifest = ""
        if os.path.exists(LIBRARY_PATH):
            with open(LIBRARY_PATH, "r", encoding="utf-8") as f:
                manifest = f.read()
        else:
            logging.warning("⚠️ Library Manifest not found. AI will generate raw code.")

        # Load theme.json if it exists
        theme_section = ""
        theme_path = os.path.join(client_path, "theme.json")
        if os.path.exists(theme_path):
            try:
                with open(theme_path, "r", encoding="utf-8") as f:
                    theme_data = json.load(f)
                theme_section = f"""
DESIGN THEME:
Apply these colors, fonts, and styles using Tailwind CSS classes:
{json.dumps(theme_data, indent=2)}

- Use the "primary" color for main CTAs and headings
- Use the "secondary" color for secondary elements
- Use the "accent" color for highlights and hover states
- Apply the "background" setting to the page background
- Use "font_heading" for h1, h2, h3 elements
- Use "font_body" for paragraph text
- Apply "border_radius" to buttons and cards
"""
                logging.info(f"✅ Loaded theme.json for {client_id}")
            except (json.JSONDecodeError, IOError) as e:
                logging.warning(f"⚠️ Failed to load theme.json: {e}")

        # Load memory (evolutionary learning) and golden references
        memory_prompt = memory.get_memory_prompt()
        golden_reference = memory.get_golden_reference_prompt()

        # Build base system prompt
        base_prompt = f"""You are a React Engineer building production-quality Next.js landing pages.

{memory_prompt}
{golden_reference}

Your goal: Create the `page.tsx` file for a Next.js landing page.

RULES:
1. Read the Content and Brief carefully.
2. Select components ONLY from the Library Manifest below.
3. Map the content into the component props accurately.
4. Apply the design theme colors and fonts using Tailwind CSS utility classes.
5. Use Tailwind utility classes (e.g., `bg-primary`, `text-accent`) instead of hardcoding hex color values. Treat the theme JSON as semantic colors, not raw literals.
6. Ensure ALL imports are correct and components exist.
7. Output ONLY the code for `page.tsx` inside a ```tsx code block.
8. Do NOT use placeholder text like [Your text here] - use actual content from the brief.

MANIFEST:
{manifest}

{theme_section}
"""

        target_file = f"./app/clients/{client_id}/page.tsx"
        os.makedirs(os.path.dirname(target_file), exist_ok=True)

        # Main Engineering Cycle
        code = None
        final_qa_status = "SKIPPED"
        final_qa_report = "Build did not complete"
        syntax_feedback = None
        visual_feedback = None
        screenshot_path = None
        total_attempts = 0
        max_total_attempts = MAX_SYNTAX_RETRIES + MAX_VISUAL_REPAIR_RETRIES

        while total_attempts < max_total_attempts:
            total_attempts += 1
            logging.info(f"🔄 Builder cycle {total_attempts}/{max_total_attempts}...")

            # Build user message with any feedback
            user_content = f"Brief: {brief}\n\nContent: {content}"

            if syntax_feedback:
                user_content += f"""

## SYNTAX ERROR FROM PREVIOUS ATTEMPT
The previous code had TypeScript compilation errors. Please fix these issues:
```
{syntax_feedback}
```
Generate corrected code that compiles without errors."""

            if visual_feedback and screenshot_path:
                user_content += f"""

## VISUAL QA FEEDBACK FROM PREVIOUS ATTEMPT
The previous code rendered but had visual issues detected by our QA system:
{visual_feedback}

Please fix the visual issues while maintaining correct syntax."""

            # Generate code
            msg = client_anthropic.messages.create(
                model=MODEL_CODER,
                max_tokens=4000,
                system=base_prompt,
                messages=[{"role": "user", "content": user_content}]
            )
            _record_model_cost(
                "anthropic", MODEL_CODER, "pipeline_builder",
                client_id, msg, {"attempt": total_attempts, "has_syntax_feedback": bool(syntax_feedback), "has_visual_feedback": bool(visual_feedback)}
            )

            raw_response = _extract_response_text(msg, default="")
            if not raw_response:
                logging.error(f"❌ Builder returned empty response on attempt {total_attempts} for {client_id}")
                memory.record_failure(
                    category="builder",
                    issue="Builder returned empty or malformed response",
                    fix="Will retry with same inputs",
                    metadata={"client_id": client_id, "attempt": total_attempts},
                )
                continue

            # Extract code from response
            match = re.search(r'```(?:tsx|typescript)?(.*?)```', raw_response, re.DOTALL)
            if match:
                code = match.group(1).strip()
            else:
                logging.warning("⚠️ No code blocks found in Builder response. Using raw output.")
                code = raw_response

            # Phase 1: Syntax Check
            logging.info(f"🔍 Phase 1: Syntax validation (attempt {total_attempts})...")
            syntax_ok, syntax_error = check_syntax(code, client_id)

            if not syntax_ok:
                logging.warning(f"⚠️ Syntax check failed on attempt {total_attempts}")
                syntax_feedback = syntax_error

                # Record to memory
                memory.record_failure(
                    category="syntax",
                    issue=f"TypeScript compilation failed: {syntax_error[:300]}",
                    fix="Will retry with error feedback",
                    metadata={"client_id": client_id, "attempt": total_attempts}
                )

                # Clear visual feedback since we haven't gotten there yet
                visual_feedback = None
                continue  # Retry with syntax feedback

            # Syntax passed - clear syntax feedback
            syntax_feedback = None
            logging.info(f"✅ Syntax check passed on attempt {total_attempts}")

            # Phase 2: Save and run Visual QA
            logging.info(f"🔍 Phase 2: Visual QA (attempt {total_attempts})...")

            # Save the code
            with open(target_file, "w", encoding="utf-8") as f:
                f.write(code)

            # Run QA
            qa_status, qa_report, screenshot_path = run_qa(client_path)

            # Phase 3: Check QA results
            if qa_status == "PASS":
                logging.info(f"✅ Visual QA passed on attempt {total_attempts}")
                final_qa_status = qa_status
                final_qa_report = qa_report
                break  # Success! Exit the loop

            elif qa_status == "FAIL":
                logging.warning(f"⚠️ Visual QA failed on attempt {total_attempts}")
                visual_feedback = qa_report

                # Record to memory
                memory.record_failure(
                    category="visual",
                    issue=f"Visual QA failed: {qa_report[:300]}",
                    fix="Will retry with visual feedback",
                    metadata={"client_id": client_id, "attempt": total_attempts}
                )

                # If we have screenshot, we could inject it (for future vision-based repair)
                # For now, we just use the text report
                final_qa_status = qa_status
                final_qa_report = qa_report
                continue  # Retry with visual feedback

            else:
                # ERROR or SKIPPED - can't repair, use what we have
                logging.warning(f"⚠️ QA returned {qa_status} - cannot repair, using current code")
                final_qa_status = qa_status
                final_qa_report = qa_report
                break

        # Phase 4: Finalization
        logging.info(f"🏁 Builder completed after {total_attempts} attempts. Final status: {final_qa_status}")

        # Compile rules periodically (after learning from this session)
        if total_attempts > 1:
            memory.compile_and_save_rules()

    # Finalize the client (notifications, git, mark processed)
    finalize_client(client_path, final_qa_status, final_qa_report)

def run_qa(client_path) -> Tuple[str, str, str]:
    """
    Run visual QA on a generated page and return the results.

    This function now returns values instead of handling finalization,
    enabling the Builder to use QA results in a repair loop.

    Parameters:
        client_path (str): Path to the client directory

    Returns:
        Tuple[str, str, str]: (status, report_text, screenshot_path)
        - status: "PASS", "FAIL", "ERROR", or "SKIPPED"
        - report_text: The QA report content or error message
        - screenshot_path: Path to the screenshot file (may not exist on error)
    """
    client_id = os.path.basename(client_path)
    screenshot_path = os.path.join(client_path, "qa_mobile.jpg")

    # Server Check with Auto-Start
    server_ready = ensure_server_running()

    if not server_ready:
        logging.error("❌ Server unavailable. QA Skipped.")
        return ("SKIPPED", "Server unavailable - QA could not run", screenshot_path)

    with time_tracker.track_span("pipeline_qa", client_id, {"stage": "qa"}):
        logging.info("🕵️‍♂️ QA Inspector starting...")
        url = f"http://localhost:3000/clients/{client_id}"

        try:
            # Capture screenshot
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page(viewport={"width": 390, "height": 844})
                page.goto(url)
                page.wait_for_timeout(3000)  # Wait for hydration
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
                        {"type": "text", "text": """Review this mobile UI screenshot. Evaluate:
1. Visual completeness (no broken layouts, missing sections)
2. Text readability (no overlapping, truncated text)
3. Button/CTA visibility
4. Overall professional appearance

Return 'PASS' if the page looks good and functional.
If there are issues, return 'FAIL: [list specific visual problems]'."""}
                    ]
                }]
            )
            _record_model_cost("anthropic", MODEL_QA, "pipeline_qa", client_id, msg)

            report = msg.content[0].text
            with open(os.path.join(client_path, "qa_report.md"), "w", encoding="utf-8") as f:
                f.write(report)

            # Determine status from report
            if "PASS" in report and not report.strip().startswith("FAIL"):
                status = "PASS"
                logging.info(f"✅ QA passed for {client_id}")
            else:
                status = "FAIL"
                logging.warning(f"⚠️ QA failed for {client_id}")

            return (status, report, screenshot_path)

        except Exception as e:
            error_msg = f"Visual QA Error: {str(e)}"
            logging.exception(f"❌ {error_msg}")
            return ("ERROR", error_msg, screenshot_path)


def finalize_client(client_path: str, qa_status: str, qa_report: str) -> None:
    """
    Finalize a client job: send notifications, commit to git, and mark as processed.

    Parameters:
        client_path: Path to the client directory
        qa_status: Final QA status ("PASS", "FAIL", "ERROR", "SKIPPED")
        qa_report: The QA report text
    """
    client_id = os.path.basename(client_path)

    # Map status to Discord alert type
    discord_status_map = {
        "PASS": "SUCCESS",
        "FAIL": "QA_FAILED",
        "ERROR": "WARNING",
        "SKIPPED": "WARNING"
    }
    discord_status = discord_status_map.get(qa_status, "WARNING")
    send_discord_alert(client_id, discord_status, qa_report)

    # Commit and Push to Git
    git_commit_and_push(client_id)

    # Mark as processed
    logging.info(f"🏁 Finalizing job for {client_id}...")
    try:
        intake_path = os.path.join(client_path, "intake.md")
        processed_path = os.path.join(client_path, "intake-processed.md")
        if os.path.exists(intake_path):
            os.rename(intake_path, processed_path)
    except OSError as e:
        logging.error(f"⚠️ Failed to rename intake.md: {e}")

# 4. MAIN BATCH LOOP
if __name__ == "__main__":
    print("\n🏭  FACTORY V4.0 ONLINE: Self-Correcting & Evolutionary Mode  🏭")
    print("    Features: Memory System | Syntax Guard | Visual Repair | A11y Critic")

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