import time
import os
import sys
import logging
import requests
import subprocess
import base64
import re
import json
import tempfile
import shutil
import threading
from pathlib import Path
from typing import Tuple, Optional, Dict, Any
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError, CancelledError
from dotenv import load_dotenv
from openai import OpenAI
from anthropic import Anthropic, RateLimitError
from playwright.sync_api import sync_playwright

# Ensure local package imports work even if editable install isn't active
try:
    from automation import time_tracker, cost_tracker, memory
    from automation.client_utils import validate_client_id_or_raise, is_valid_client_id
    from automation.lock_utils import client_lock, is_locked
    from automation.file_utils import atomic_write
except ModuleNotFoundError:
    repo_root = Path(__file__).resolve().parent.parent
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))
    from automation import time_tracker, cost_tracker, memory
    from automation.client_utils import validate_client_id_or_raise, is_valid_client_id
    from automation.lock_utils import client_lock, is_locked
    from automation.file_utils import atomic_write

# 1. SETUP
# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        # Python < 3.7 fallback
        pass

load_dotenv()
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s  -  [FACTORY]  -  %(message)s', 
    datefmt='%H:%M:%S'
)

# Suppress verbose HTTP request logs from Anthropic SDK's underlying HTTP client
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

def _log_aligned(level: str, emoji: str, label: str, message: str):
    """
    Log a message with aligned header formatting.
    
    Args:
        level: Log level ('info', 'warning', 'error', 'debug')
        emoji: Emoji icon for the log message
        label: Fixed-width label (padded to 20 chars)
        message: The actual log message content
    """
    # Normalize emoji spacing (strip trailing spaces)
    emoji_clean = emoji.strip()
    
    # Calculate emoji string length (some emojis are multi-character Unicode sequences)
    emoji_len = len(emoji_clean)
    
    # Ensure emoji column (emoji + spaces) is always 4 characters wide for consistent alignment
    # Most emojis render as 2 visual characters, so we add spaces to pad to 4 total
    # This ensures labels always start at the same position regardless of emoji width
    if emoji_len <= 2:
        # Emoji is 1-2 chars, add spaces to make total column 4 chars (emoji + 2 spaces)
        emoji_column = f"{emoji_clean}  "
    elif emoji_len == 3:
        # Emoji is 3 chars, add 1 space to make total column 4 chars
        emoji_column = f"{emoji_clean} "
    else:
        # Emoji is 4+ chars, use as-is with 2 spaces (may be slightly wider but rare)
        emoji_column = f"{emoji_clean}  "
    
    # Pad label to 20 characters for consistent alignment
    padded_label = f"{label:<20}"
    
    # Prevent line wrapping: truncate message if too long
    # Account for: emoji column (4 chars) + label (20) + space (1) = 25 chars overhead
    # Target max width: 120 chars, so message max: ~95 chars
    max_message_width = 95
    if len(message) > max_message_width:
        message = message[:max_message_width - 3] + "..."
    
    # Format: emoji_column (4 chars) + label (20 chars) + space + message
    formatted_message = f"{emoji_column}{padded_label} {message}"
    
    log_func = getattr(logging, level.lower(), logging.info)
    log_func(formatted_message)

client_openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
client_anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
webhook_url = os.getenv("DISCORD_WEBHOOK_URL")

# Model Configuration
# Tier order: Opus > Sonnet > Haiku (cost and capability)
# For current pricing, see docs/internal/pricing_model.md
MODEL_STRATEGY = "claude-opus-4-5-20251101"    # Complex reasoning, brand analysis
MODEL_CODER = "claude-sonnet-4-5-20250929"     # Code generation
MODEL_COPY = "claude-sonnet-4-5-20250929"      # Creative writing, instruction following
MODEL_QA = "claude-haiku-4-5-20251001"       # Visual inspection - using Sonnet until Haiku model is available
MODEL_ROUTER = "claude-haiku-4-5-20251001"   # Fast classification - using Sonnet until Haiku model is available
MODEL_CRITIC = "claude-sonnet-4-5-20250929"    # Quality review         

# Config
WATCH_DIR = "./clients"
LIBRARY_PATH = "./design-system/manifest.md"
PROMPTS_DIR = "./prompts"
BATCH_INTERVAL = 60  # Seconds, Check every 1 hour for testing
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
        _log_aligned("warning", "⚠️", "Cost tracking", f"failed for {provider}:{model} - {e}")

def _llm_messages_create(model: str, client_id: str, activity: str, system: str, user_content: str, max_tokens: int):
    """
    Unified LLM caller that routes to Anthropic (with backoff) or OpenAI.
    """
    # #region agent log
    import json as json_module
    log_path = r"e:\Desktop\Projects\Freelance\Ghost_factory\.cursor\debug.log"
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "D", "location": "factory.py:104", "message": "_llm_messages_create entry", "data": {"model": model, "client_id": client_id, "activity": activity, "is_openai": model.startswith("gpt-")}, "timestamp": int(time.time() * 1000)}) + "\n")
    except: pass
    # #endregion
    if model.startswith("gpt-"):
        try:
            resp = client_openai.chat.completions.create(
                model=model,
                # OpenAI models in this family expect max_completion_tokens
                max_completion_tokens=max_tokens,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_content},
                ],
            )
            # #region agent log
            try:
                with open(log_path, "a", encoding="utf-8") as f:
                    resp_attrs = {"has_choices": hasattr(resp, "choices"), "choices_len": len(resp.choices) if hasattr(resp, "choices") else 0}
                    if hasattr(resp, "choices") and resp.choices:
                        choice = resp.choices[0]
                        resp_attrs["has_message"] = hasattr(choice, "message")
                        if hasattr(choice, "message"):
                            msg = choice.message
                            resp_attrs["has_content"] = hasattr(msg, "content")
                            if hasattr(msg, "content"):
                                resp_attrs["content_type"] = type(msg.content).__name__
                                resp_attrs["content_len"] = len(str(msg.content)) if msg.content else 0
                    f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "D", "location": "factory.py:115", "message": "OpenAI response received", "data": resp_attrs, "timestamp": int(time.time() * 1000)}) + "\n")
            except: pass
            # #endregion
            _record_model_cost("openai", model, activity, client_id, resp)
            return resp
        except Exception as e:
            # #region agent log
            try:
                with open(log_path, "a", encoding="utf-8") as f:
                    f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "D", "location": "factory.py:117", "message": "OpenAI API exception", "data": {"model": model, "error_type": type(e).__name__, "error_msg": str(e)[:300]}, "timestamp": int(time.time() * 1000)}) + "\n")
            except: pass
            # #endregion
            raise

    resp = _anthropic_messages_create(
        model=model,
        client_id=client_id,
        activity=activity,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user_content}],
    )
    # #region agent log
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            resp_attrs = {"has_content": hasattr(resp, "content"), "content_len": len(resp.content) if hasattr(resp, "content") else 0}
            if hasattr(resp, "content") and resp.content:
                resp_attrs["first_block_type"] = type(resp.content[0]).__name__ if resp.content else None
                if resp.content and hasattr(resp.content[0], "text"):
                    resp_attrs["first_block_has_text"] = True
                    resp_attrs["first_block_text_len"] = len(resp.content[0].text) if resp.content[0].text else 0
            f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "D", "location": "factory.py:142", "message": "Anthropic response received", "data": resp_attrs, "timestamp": int(time.time() * 1000)}) + "\n")
    except: pass
    # #endregion
    _record_model_cost("anthropic", model, activity, client_id, resp)
    return resp


def _start_heartbeat(label: str, interval: float = 30.0):
    """
    Start a background heartbeat logger to show long-running progress.
    Returns the (event, thread) so callers can stop it.
    """
    stop_event = threading.Event()

    def _beat():
        while not stop_event.wait(interval):
            _log_aligned("info", "⏳", "Heartbeat", f"{label} still running...")

    thread = threading.Thread(target=_beat, daemon=True)
    thread.start()
    return stop_event, thread


def _anthropic_messages_create(model: str, client_id: str, activity: str, **kwargs):
    """
    Call Anthropic with a small exponential backoff on 429 (rate limit) errors.
    """
    max_attempts = 3
    for attempt in range(1, max_attempts + 1):
        try:
            return client_anthropic.messages.create(model=model, **kwargs)
        except RateLimitError as e:
            sleep = min(5 * attempt, 15)
            _log_aligned(
                "warning",
                "⚠️ ",
                "Rate limit",
                f"{activity}/{client_id} (attempt {attempt}/{max_attempts}). Retrying in {sleep}s"
            )
            time.sleep(sleep)
            if attempt == max_attempts:
                raise
        except Exception as e:
            status = getattr(e, "status_code", None) or getattr(getattr(e, "response", None), "status_code", None)
            if status == 429 or "429" in str(e):
                sleep = min(5 * attempt, 15)
                _log_aligned(
                    "warning",
                    "⚠️ ",
                    "Rate limit",
                    f"{activity}/{client_id} (attempt {attempt}/{max_attempts}). Retrying in {sleep}s"
                )
                time.sleep(sleep)
                if attempt == max_attempts:
                    raise
                continue
            raise


def _extract_response_text(response, default=None):
    """
    Safely extract text content from an Anthropic API response.

    Args:
        response: The API response object
        default: Value to return if extraction fails (default: None)

    Returns:
        str: The extracted text, or default if extraction fails
    """
    # #region agent log
    import json as json_module
    log_path = r"e:\Desktop\Projects\Freelance\Ghost_factory\.cursor\debug.log"
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "D", "location": "factory.py:188", "message": "_extract_response_text entry", "data": {"response_is_none": response is None, "has_content": hasattr(response, "content") if response else False, "has_choices": hasattr(response, "choices") if response else False}, "timestamp": int(time.time() * 1000)}) + "\n")
    except: pass
    # #endregion
    try:
        if response and hasattr(response, 'content') and response.content:
            first_block = response.content[0]
            if hasattr(first_block, 'text') and first_block.text:
                extracted = first_block.text
                # #region agent log
                try:
                    with open(log_path, "a", encoding="utf-8") as f:
                        f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "D", "location": "factory.py:195", "message": "extracted from Anthropic content", "data": {"extracted_len": len(extracted)}, "timestamp": int(time.time() * 1000)}) + "\n")
                except: pass
                # #endregion
                return extracted
        if response and hasattr(response, "choices"):
            choice = response.choices[0]
            content = getattr(choice.message, "content", None)
            if isinstance(content, list) and content:
                texts = []
                for part in content:
                    if isinstance(part, dict) and part.get("type") == "text":
                        texts.append(part.get("text", ""))
                    elif isinstance(part, str):
                        texts.append(part)
                extracted = "\n".join(t for t in texts if t) or default
                # #region agent log
                try:
                    with open(log_path, "a", encoding="utf-8") as f:
                        f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "D", "location": "factory.py:210", "message": "extracted from OpenAI list content", "data": {"extracted_len": len(extracted) if extracted else 0}, "timestamp": int(time.time() * 1000)}) + "\n")
                except: pass
                # #endregion
                return extracted
            if isinstance(content, str):
                # #region agent log
                try:
                    with open(log_path, "a", encoding="utf-8") as f:
                        f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "D", "location": "factory.py:216", "message": "extracted from OpenAI string content", "data": {"extracted_len": len(content)}, "timestamp": int(time.time() * 1000)}) + "\n")
                except: pass
                # #endregion
                return content
        # #region agent log
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "D", "location": "factory.py:220", "message": "extraction failed, returning default", "data": {"default": default}, "timestamp": int(time.time() * 1000)}) + "\n")
        except: pass
        # #endregion
        return default
    except (IndexError, AttributeError, TypeError) as e:
        # #region agent log
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "D", "location": "factory.py:222", "message": "extraction exception", "data": {"error_type": type(e).__name__, "error_msg": str(e)[:200]}, "timestamp": int(time.time() * 1000)}) + "\n")
        except: pass
        # #endregion
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
# Reduced to save API credits - early exit logic will catch repeated failures
MAX_SYNTAX_RETRIES = 2  # Reduced from 3
MAX_VISUAL_REPAIR_RETRIES = 2  # Reduced from 3
MAX_A11Y_RETRIES = 3


def validate_prompt_library():
    """
    Validate that all required prompt files exist at startup.
    Returns True if all prompts are present, False otherwise.
    Logs specific errors for any missing files.
    """
    all_valid = True

    if not os.path.exists(PROMPTS_DIR):
        _log_aligned("error", "❌", "Prompts dir", f"not found: {PROMPTS_DIR}")
        return False

    for prompt_file in REQUIRED_PROMPTS:
        full_path = os.path.join(PROMPTS_DIR, prompt_file)
        if not os.path.exists(full_path):
            _log_aligned("error", "❌", "Missing prompt", full_path)
            all_valid = False
        else:
            logging.debug(f"✓ Found prompt: {prompt_file}")

    if all_valid:
        _log_aligned("info", "✅", "Prompts validated", f"All {len(REQUIRED_PROMPTS)} prompt files validated.")

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
    _log_aligned("info", "🔀", "Router", f"classifying {client_id}...")

    # Load router prompt
    router_prompt = _load_prompt("router.md")

    # Ask LLM to classify
    msg = _anthropic_messages_create(
        model=MODEL_ROUTER,
        client_id=client_id,
        activity="router_classify",
        max_tokens=50,
        system=router_prompt,
        messages=[{"role": "user", "content": intake}],
    )
    _record_model_cost("anthropic", MODEL_ROUTER, "router_classify", client_id, msg)

    # Parse response - expect one of: saas, local_service, ecommerce
    response_text = _extract_response_text(msg)
    if not response_text:
        _log_aligned("warning", "⚠️", "Router", "returned empty response, defaulting to local_service")
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
        _log_aligned("warning", "⚠️", "Router", f"returned unknown niche '{niche}', defaulting to local_service")
        niche = "local_service"

    _log_aligned("info", "📋", "Client classified", f"as: {niche}")
    return valid_niches[niche]


# 2. HELPER FUNCTIONS

def git_pull():
    """Checks for new intake forms from GitHub."""
    _log_aligned("info", "⬇️", "Git pull", "Checking GitHub for new intakes...")
    try:
        result = subprocess.run(["git", "pull"], capture_output=True, text=True)
        if "Already up to date" not in result.stdout:
            _log_aligned("info", "📦", "Git pull", "New data downloaded from GitHub.")
            return True
        else:
            _log_aligned("info", "💤", "Git pull", "No new data on GitHub.")
            return False
    except Exception as e:
        _log_aligned("error", "❌", "Git pull", f"Failed: {e}")
        return False

def git_commit_and_push(client_id):
    """Commits and pushes generated code to the repository."""
    _log_aligned("info", "💾", "Git commit", f"Committing changes for {client_id}...")
    try:
        # Stage all changes (new pages, tracking files, processed intakes)
        subprocess.run(["git", "add", "."], check=True, capture_output=True)
        
        # Commit
        commit_msg = f"feat: Auto-generated landing page for {client_id}"
        subprocess.run(["git", "commit", "-m", commit_msg], check=True, capture_output=True)
        
        # Push
        subprocess.run(["git", "push"], check=True, capture_output=True)
        _log_aligned("info", "✅", "Git push", "successful.")
    except subprocess.CalledProcessError as e:
        # Don't crash the loop if git fails, just log it
        error_msg = e.stderr.decode() if e.stderr else str(e)
        _log_aligned("error", "❌", "Git commit/push", f"failed: {error_msg}")

def run_intake_sanitizer():
    """Converts any raw intakes (intake-raw.md) to structured intakes (intake.md)."""
    if not os.path.exists(WATCH_DIR):
        return

    for client_id in os.listdir(WATCH_DIR):
        # Validate client ID to prevent path traversal attacks
        if not is_valid_client_id(client_id):
            _log_aligned("warning", "⚠️", "Sanitizer", f"Skipping invalid client ID: {client_id}")
            continue
        
        client_path = os.path.join(WATCH_DIR, client_id)
        raw_intake_path = os.path.join(client_path, "intake-raw.md")

        if os.path.isdir(client_path) and os.path.exists(raw_intake_path):
            _log_aligned("info", "📝", "Sanitizer", f"Sanitizing raw intake for {client_id}...")
            try:
                result = subprocess.run(
                    ["python", "automation/intake_sanitizer.py", raw_intake_path],
                    capture_output=True, text=True
                )
                if result.returncode == 0:
                    _log_aligned("info", "✅", "Sanitizer", f"Sanitized intake for {client_id}")
                else:
                    _log_aligned("error", "❌", "Sanitizer", f"failed for {client_id}: {result.stderr}")
            except Exception as e:
                _log_aligned("error", "❌", "Sanitizer", f"error for {client_id}: {e}")

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
        
    _log_aligned("warning", "⚠️", "Server", "localhost:3000 is down. Attempting to start dev server...")
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
                _log_aligned("info", "✅", "Server", "started successfully.")
                return True
                
        _log_aligned("error", "❌", "Server", "Failed to start server within timeout.")
        return False
    except Exception as e:
        _log_aligned("error", "❌", "Server", f"Error starting server: {e}")
        return False

def send_discord_alert(client_name, status, report=None):
    """Send Discord notification for build status. Fails silently to keep pipeline resilient."""
    if not webhook_url:
        _log_aligned("warning", "⚠️", "Discord", "DISCORD_WEBHOOK_URL not set. Skipping Discord notification.")
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
            _log_aligned("info", "✅", "Discord", f"notification sent for {client_name}")
        elif response.status_code == 404:
            _log_aligned("error", "❌", "Discord", "webhook not found (404). Check webhook URL.")
        elif response.status_code == 401:
            _log_aligned("error", "❌", "Discord", "webhook unauthorized (401). Check webhook URL.")
        else:
            _log_aligned("warning", "⚠️", "Discord", f"webhook returned status {response.status_code}: {response.text}")
            
    except requests.exceptions.Timeout:
        _log_aligned("warning", "⚠️", "Discord", f"webhook request timed out for {client_name}")
    except requests.exceptions.RequestException as e:
        _log_aligned("warning", "⚠️", "Discord", f"notification failed for {client_name}: {e}")
    except Exception as e:
        _log_aligned("warning", "⚠️", "Discord", f"Unexpected error sending Discord notification: {e}")


def sanitize_windows_paths(error_text: str) -> str:
    """
    Remove Windows drive paths from error messages to prevent exposing local file paths in logs.
    
    Replaces paths like:
    - C:/Users/.../AppData/Local/Temp/tmpw4sd64tkk.tsx
    - C:\\Users\\...\\AppData\\Local\\Temp\\tmpw4sd64tkk.tsx
    
    With generic placeholder: page.tsx
    
    Parameters:
        error_text: The error message text that may contain Windows paths
        
    Returns:
        str: Sanitized error text with Windows paths replaced
    """
    if not error_text:
        return error_text
    
    # Pattern to match Windows drive paths (e.g., C:/Users/... or C:\Users\...)
    # Matches: [DriveLetter]:[/\] followed by any path characters
    # Handles both forward and backslash separators
    windows_path_pattern = r'[A-Za-z]:[/\\][^\s:<>"|?*]+\.tsx?'
    
    # Replace all Windows drive paths with generic placeholder
    sanitized = re.sub(windows_path_pattern, 'page.tsx', error_text)
    
    return sanitized


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
    temp_path = None
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

        # Try to find npx - check common locations
        npx_cmd = shutil.which("npx")
        if not npx_cmd:
            # Try to find npx in the same directory as node
            node_path = shutil.which("node")
            if node_path:
                node_dir = os.path.dirname(node_path)
                # On Windows, try both npx and npx.cmd
                for npx_name in ["npx.cmd", "npx"]:
                    npx_path = os.path.join(node_dir, npx_name)
                    if os.path.exists(npx_path):
                        npx_cmd = npx_path
                        break
                # Also try shutil.which for npx.cmd specifically
                if not npx_cmd:
                    npx_cmd = shutil.which("npx.cmd")
        
        if not npx_cmd:
            # Last resort: try direct path if we know node location
            node_path = shutil.which("node")
            if node_path:
                node_dir = os.path.dirname(node_path)
                potential_npx = os.path.join(node_dir, "npx")
                if os.path.exists(potential_npx):
                    npx_cmd = potential_npx
        
        if not npx_cmd:
            raise FileNotFoundError("npx/tsc not found. Ensure Node.js and TypeScript are installed. Run: npm install -g typescript")
        
        # Run TypeScript compiler in check-only mode
        # Use tsconfig.json to ensure path mappings (@/*) are resolved correctly
        repo_root = Path(__file__).resolve().parent.parent
        tsconfig_path = repo_root / "tsconfig.json"
        
        # Create a temporary tsconfig that extends the main one but only includes our temp file
        temp_tsconfig = None
        temp_tsconfig_path = None
        if tsconfig_path.exists():
            try:
                import json as json_module
                with open(tsconfig_path, "r", encoding="utf-8") as f:
                    main_tsconfig = json_module.load(f)
                
                # Create a temp tsconfig that extends main and includes only our file
                temp_tsconfig_data = {
                    "extends": str(tsconfig_path),
                    "compilerOptions": {
                        "noEmit": True,
                        "skipLibCheck": True,
                    },
                    "include": [temp_path],
                    "exclude": []
                }
                
                temp_tsconfig_path = temp_path.replace(".tsx", ".tsconfig.json")
                with open(temp_tsconfig_path, "w", encoding="utf-8") as f:
                    json_module.dump(temp_tsconfig_data, f)
                
                project_arg = str(temp_tsconfig_path)
            except Exception as e:
                # Fallback to manual flags if tsconfig processing fails
                logging.warning(f"Failed to create temp tsconfig: {e}, using manual flags")
                temp_tsconfig_path = None
                project_arg = None
        else:
            project_arg = None
        
        # Build command
        cmd = [
            npx_cmd,
            "tsc",
            "--noEmit",
            "--skipLibCheck",
        ]
        
        if project_arg:
            cmd.extend(["--project", project_arg])
        else:
            # Fallback: use manual flags matching tsconfig.json
            cmd.extend([
                "--jsx", "preserve",
                "--esModuleInterop",
                "--moduleResolution", "bundler",
                "--target", "ES2017",
                "--module", "esnext",
                "--baseUrl", ".",
                "--paths", '{"@/*": ["./*"]}',
                temp_path
            ])
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
            cwd=os.getcwd()
        )
        
        # Clean up temp tsconfig if created
        if temp_tsconfig_path and os.path.exists(temp_tsconfig_path):
            try:
                os.unlink(temp_tsconfig_path)
            except:
                pass

        if result.returncode == 0:
            _log_aligned("info", "✅", "Syntax check", f"passed for {client_id}")
            return (True, "")
        else:
            # Combine stdout and stderr for full error output
            error_output = result.stderr or result.stdout or "Unknown compilation error"
            
            # Filter to only show errors from the generated page.tsx file, ignore errors from dependencies
            # This prevents false failures due to errors in lib/ or other project files
            error_lines = error_output.split('\n')
            filtered_errors = []
            temp_file_name = os.path.basename(temp_path)
            in_relevant_error = False
            
            for line in error_lines:
                # Check if this line is an error from our generated file
                # Errors are typically: "file.tsx(line,col): error TS####: message"
                # After sanitization, temp file paths become "page.tsx"
                is_our_error = (
                    "page.tsx" in line or  # Sanitized path
                    temp_file_name in line or  # Original temp file name
                    (line.strip().startswith("(") and "error TS" in line)  # Error continuation
                )
                
                # Check if it's an error from a dependency file (lib/, node_modules/, etc.)
                is_dependency_error = any(
                    dep_path in line for dep_path in [
                        "lib/", "node_modules/", ".next/", 
                        "components/", "app/", "tsconfig.json"
                    ]
                ) and "page.tsx" not in line and temp_file_name not in line
                
                if is_our_error:
                    filtered_errors.append(line)
                    in_relevant_error = True
                elif is_dependency_error:
                    # Skip dependency errors
                    in_relevant_error = False
                    continue
                elif in_relevant_error and (line.startswith(' ') or line.startswith('\t') or not line.strip()):
                    # Include continuation lines if we're in a relevant error block
                    filtered_errors.append(line)
                elif not is_dependency_error and 'error TS' in line:
                    # Include other errors that aren't from dependencies (safety net)
                    filtered_errors.append(line)
                    in_relevant_error = True
            
            # If we filtered out all errors, use original (shouldn't happen, but safety check)
            if not filtered_errors:
                filtered_output = error_output
            else:
                filtered_output = '\n'.join(filtered_errors)
            
            # Sanitize Windows paths from error messages to prevent exposing local file paths
            filtered_output = sanitize_windows_paths(filtered_output)
            
            # If no errors remain after filtering, treat as success (dependencies have errors, not our code)
            if not filtered_output.strip() or not any('error' in line.lower() for line in filtered_output.split('\n')):
                _log_aligned("info", "✅", "Syntax check", f"passed for {client_id} (dependency errors ignored)")
                return (True, "")
            
            _log_aligned("warning", "⚠️", "Syntax check", f"failed for {client_id}: {filtered_output[:200]}...")
            return (False, filtered_output)

    except subprocess.TimeoutExpired:
        error_msg = "TypeScript compilation timed out (30s limit)"
        _log_aligned("error", "❌", "Syntax check", f"{error_msg} for {client_id}")
        return (False, error_msg)

    except FileNotFoundError:
        error_msg = "npx/tsc not found. Ensure Node.js and TypeScript are installed."
        _log_aligned("error", "❌", "Syntax check", error_msg)
        return (False, error_msg)

    except Exception as e:
        error_msg = f"Syntax check error: {e!s}"
        _log_aligned("error", "❌", "Syntax check", f"error for {client_id}")
        return (False, error_msg)

    finally:
        # Clean up temp file - ensure it's always removed
        if temp_path is not None:
            try:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
            except (OSError, PermissionError) as e:
                _log_aligned("warning", "⚠️", "Cleanup", f"Failed to clean up temp file {temp_path}: {e}")
                # Try to register for cleanup on exit as fallback
                import atexit
                atexit.register(lambda: os.unlink(temp_path) if os.path.exists(temp_path) else None)


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
    # Validate client ID to prevent path traversal
    validate_client_id_or_raise(client_id, "run_visual_designer")
    _log_aligned("info", "🎨", "Visual Designer", f"generating theme for {client_id}...")

    with time_tracker.track_span("pipeline_visual_designer", client_id, {"stage": "visual_designer"}):
        # Load intake
        intake_path = os.path.join(client_path, "intake.md")
        if not os.path.exists(intake_path):
            _log_aligned("warning", "⚠️", "Visual Designer", f"No intake.md found for visual designer in {client_id}")
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
            _log_aligned("info", "🎨", "Visual Designer", f"attempt {attempt}/{MAX_A11Y_RETRIES}...")

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
            msg = _anthropic_messages_create(
                model=MODEL_COPY,
                client_id=client_id,
                activity="pipeline_visual_designer",
                max_tokens=500,
                system=designer_prompt,
                messages=[{"role": "user", "content": user_content}],
            )
            _record_model_cost("anthropic", MODEL_COPY, "pipeline_visual_designer", client_id, msg, {"attempt": attempt})

            theme_content = _extract_response_text(msg)
            if not theme_content:
                _log_aligned("error", "❌", "Visual Designer", f"returned empty response on attempt {attempt}")
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
                    _log_aligned("warning", "⚠️", "Visual Designer", f"returned non-dict JSON ({type(theme_data).__name__}), using default")
                    theme_data = default_theme
            except json.JSONDecodeError:
                _log_aligned("error", "❌", "Visual Designer", f"returned invalid JSON on attempt {attempt}")
                if attempt >= MAX_A11Y_RETRIES:
                    theme_data = default_theme
                    break
                continue

            # A11y Critic Review
            _log_aligned("info", "🔍", "A11y Critic", f"reviewing theme (attempt {attempt})...")

            a11y_input = f"""## Theme to Review
```json
{json.dumps(theme_data, indent=2)}
```

Please evaluate the accessibility of this color palette."""

            a11y_msg = _anthropic_messages_create(
                model=MODEL_CRITIC,
                client_id=client_id,
                activity="pipeline_visual_designer_a11y",
                max_tokens=500,
                system=a11y_critic_prompt,
                messages=[{"role": "user", "content": a11y_input}],
            )
            _record_model_cost("anthropic", MODEL_CRITIC, "pipeline_visual_designer_a11y", client_id, a11y_msg, {"attempt": attempt})

            a11y_response_text = _extract_response_text(a11y_msg)
            if not a11y_response_text:
                _log_aligned("warning", "⚠️", "A11y Critic", f"returned empty response on attempt {attempt}. Treating as PASS.")
                break

            a11y_response = a11y_response_text.strip()

            # Decision - PASS or FAIL
            if a11y_response.startswith("FAIL"):
                _log_aligned("warning", "⚠️", "A11y Critic", f"rejected theme on attempt {attempt}")
                previous_feedback = a11y_response

                # Record to memory for learning
                memory.record_failure(
                    category="a11y",
                    issue=f"Theme failed accessibility check: {a11y_response[:200]}",
                    fix="Regenerated theme with improved contrast",
                    metadata={"client_id": client_id, "attempt": attempt}
                )

                if attempt >= MAX_A11Y_RETRIES:
                    _log_aligned("error", "❌", "A11y Critic", f"Max a11y retries ({MAX_A11Y_RETRIES}) reached. Using last generated theme.")
                    break
            elif a11y_response.startswith("PASS"):
                _log_aligned("info", "✅", "A11y Critic", f"approved theme on attempt {attempt}")
                break
            else:
                _log_aligned("warning", "⚠️", "A11y Critic", "response unclear (no PASS/FAIL). Proceeding with theme.")
                break

        # Ensure we have a valid theme
        if not theme_data:
            theme_data = default_theme

        # Save theme.json
        theme_path = os.path.join(client_path, "theme.json")
        with open(theme_path, "w", encoding="utf-8") as f:
            json.dump(theme_data, f, indent=2)

        _log_aligned("info", "✅", "Visual Designer", f"saved theme.json for {client_id}")
        return theme_data


def run_architect(client_path):
    """
    Orchestrates the Architect stage: routes the client to a niche, generates a strategy brief with retrying critic validation, and advances the pipeline.
    
    Spawns the Visual Designer in parallel to produce a theme.json, runs a Router to classify the client's niche, invokes the Strategist to generate a project brief using the niche-specific prompt, and runs a Critic loop that may request regenerated briefs up to MAX_CRITIC_RETRIES. Saves the immutable original brief to brief.orig.md and a working copy to brief.md. Does not rename intake.md; after architect work completes it invokes the Copywriter and waits briefly for the Visual Designer to finish (logs and proceeds if the designer fails or times out).
    
    Parameters:
        client_path (str): Filesystem path to the client's directory (must contain intake.md); the client ID is derived from the directory basename.
    """
    client_id = os.path.basename(client_path)
    # Validate client ID to prevent path traversal
    validate_client_id_or_raise(client_id, "run_architect")
    
    # Check for existing brief.md - skip generation if already exists, but continue pipeline
    brief_path = os.path.join(client_path, "brief.md")
    brief_exists = os.path.exists(brief_path)
    if brief_exists:
        _log_aligned("info", "⏭️", "Architect", f"Brief already exists for {client_id}, skipping architect generation")
        # Still need to continue pipeline to copywriter and builder stages
        run_copywriter(client_path)
        return
    
    _log_aligned("info", "🏗️", "Architect", f"analyzing {client_id}...")

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
                _log_aligned("info", "📝", "Strategist", f"generating brief (attempt {attempt}/{MAX_CRITIC_RETRIES})...")

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
                msg = _anthropic_messages_create(
                    model=MODEL_STRATEGY,
                    client_id=client_id,
                    activity="pipeline_architect",
                    max_tokens=2000,
                    system=strategy_prompt,
                    messages=[{"role": "user", "content": user_content}],
                )
                _record_model_cost(
                    "anthropic", MODEL_STRATEGY, "pipeline_architect",
                    client_id, msg, {"attempt": attempt, "niche": niche_prompt_file}
                )

                brief_content = _extract_response_text(msg)
                if not brief_content:
                    _log_aligned("error", "❌", "Strategist", f"returned empty response on attempt {attempt}")
                    if attempt >= MAX_CRITIC_RETRIES:
                        raise RuntimeError(f"Strategist failed to generate brief after {MAX_CRITIC_RETRIES} attempts")
                    continue  # Retry without critic feedback

                # Step 4: Critic reviews the brief
                _log_aligned("info", "🔍", "Critic", f"reviewing brief (attempt {attempt})...")

                critic_input = f"""## Original Client Intake
{intake}

## Generated Project Brief
{brief_content}

Please evaluate this brief against the original intake."""

                critic_msg = _anthropic_messages_create(
                    model=MODEL_CRITIC,
                    client_id=client_id,
                    activity="pipeline_architect_critic",
                    max_tokens=500,
                    system=critic_prompt,
                    messages=[{"role": "user", "content": critic_input}],
                )
                _record_model_cost(
                    "anthropic", MODEL_CRITIC, "pipeline_architect_critic",
                    client_id, critic_msg, {"attempt": attempt}
                )

                critic_response_text = _extract_response_text(critic_msg)
                if not critic_response_text:
                    _log_aligned("warning", "⚠️", "Critic", f"returned empty response on attempt {attempt}. Treating as PASS.")
                    break

                critic_response = critic_response_text.strip()

                # Step 5: Decision - PASS or FAIL
                # IMPORTANT: Check FAIL first to avoid false positives when "PASS" appears in failure text
                if critic_response.startswith("FAIL"):
                    _log_aligned("warning", "⚠️", "Critic", f"rejected brief on attempt {attempt}")
                    previous_feedback = critic_response
                    if attempt >= MAX_CRITIC_RETRIES:
                        _log_aligned("error", "❌", "Critic", f"Max critic retries ({MAX_CRITIC_RETRIES}) reached. Using last generated brief.")
                        break  # Explicit break to exit loop after max retries
                elif critic_response.startswith("PASS"):
                    _log_aligned("info", "✅", "Critic", f"approved brief on attempt {attempt}")
                    break
                else:
                    # Ambiguous response - treat as pass but log warning
                    _log_aligned("warning", "⚠️", "Critic", "response unclear (no PASS/FAIL). Proceeding with brief.")
                    break

            # Step 6: Validate and save the brief
            if not brief_content:
                raise RuntimeError(f"Failed to generate brief for {client_id} after {MAX_CRITIC_RETRIES} attempts")

            # Save immutable original for future optimization analysis
            brief_orig_path = os.path.join(client_path, "brief.orig.md")
            if atomic_write(brief_orig_path, brief_content):
                _log_aligned("info", "💾", "Architect", "Saved original AI output to brief.orig.md")
            else:
                _log_aligned("error", "❌", "Architect", f"Failed to write {brief_orig_path}")

            # Save the working copy
            brief_path = os.path.join(client_path, "brief.md")
            if atomic_write(brief_path, brief_content):
                _log_aligned("info", "💾", "Architect", "Saved brief.md")
            else:
                _log_aligned("error", "❌", "Architect", f"Failed to write {brief_path}")
                raise RuntimeError(f"Failed to write brief.md for {client_id}")

        # Wait for visual designer to complete
        # NOTE: The ThreadPoolExecutor context manager calls shutdown(wait=True) on exit,
        # so we always wait for completion regardless of timeout. The timeout here only
        # controls when we log a warning - it doesn't actually limit blocking time.
        try:
            visual_designer_future.result(timeout=60)
        except (TimeoutError, FuturesTimeoutError, CancelledError) as e:
            _log_aligned("warning", "⚠️", "Visual Designer", f"timed out or was cancelled: {type(e).__name__}")

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
    
    # Check for existing content.md - skip generation if already exists, but continue pipeline
    content_path = os.path.join(client_path, "content.md")
    content_exists = os.path.exists(content_path)
    if content_exists:
        _log_aligned("info", "⏭️", "Copywriter", f"Content already exists for {client_id}, skipping copywriter generation")
        # Still need to continue pipeline to builder stage
        run_builder(client_path)
        return
    
    _log_aligned("info", "✍️", "Copywriter", f"writing for {client_id}...")

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
            _log_aligned("warning", "⚠️", "Copywriter", "No intake file found - skipping Copy Critic review")
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
            _log_aligned("info", "📝", "Copywriter", f"generating content (attempt {attempt}/{MAX_CRITIC_RETRIES})...")

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
            msg = _anthropic_messages_create(
                model=MODEL_COPY,
                client_id=client_id,
                activity="pipeline_copywriter",
                max_tokens=4000,
                system=copywriter_prompt,
                messages=[{"role": "user", "content": user_content}],
            )
            _record_model_cost(
                "anthropic", MODEL_COPY, "pipeline_copywriter",
                client_id, msg, {"attempt": attempt}
            )

            content = _extract_response_text(msg)
            if not content:
                _log_aligned("error", "❌", "Copywriter", f"returned empty response on attempt {attempt}")
                if attempt >= MAX_CRITIC_RETRIES:
                    raise RuntimeError(f"Copywriter failed to generate content after {MAX_CRITIC_RETRIES} attempts")
                continue

            # Skip critic review if intake is not available
            if skip_critic:
                _log_aligned("info", "⏭️", "Copy Critic", "Skipping Copy Critic review - no intake available")
                break

            # Copy Critic reviews the content
            _log_aligned("info", "🔍", "Copy Critic", f"reviewing content (attempt {attempt})...")

            critic_input = f"""## Original Client Intake
{intake}

## Project Brief
{brief}

## Generated Website Content
{content}

Please evaluate this content against the intake and brief."""

            critic_msg = _anthropic_messages_create(
                model=MODEL_CRITIC,
                client_id=client_id,
                activity="pipeline_copywriter_critic",
                max_tokens=500,
                system=critic_prompt,
                messages=[{"role": "user", "content": critic_input}],
            )
            _record_model_cost(
                "anthropic", MODEL_CRITIC, "pipeline_copywriter_critic",
                client_id, critic_msg, {"attempt": attempt}
            )

            critic_response_text = _extract_response_text(critic_msg)
            if not critic_response_text:
                _log_aligned("warning", "⚠️", "Copy Critic", f"returned empty response on attempt {attempt}. Treating as PASS.")
                break

            critic_response = critic_response_text.strip()

            # Decision - PASS or FAIL
            # IMPORTANT: Check FAIL first to avoid false positives when "PASS" appears in failure text
            if critic_response.startswith("FAIL"):
                _log_aligned("warning", "⚠️", "Copy Critic", f"rejected content on attempt {attempt}")
                previous_feedback = critic_response
                if attempt >= MAX_CRITIC_RETRIES:
                    _log_aligned("error", "❌", "Copy Critic", f"Max critic retries ({MAX_CRITIC_RETRIES}) reached. Using last generated content.")
                    break
            elif critic_response.startswith("PASS"):
                _log_aligned("info", "✅", "Copy Critic", f"approved content on attempt {attempt}")
                break
            else:
                _log_aligned("warning", "⚠️", "Copy Critic", "response unclear (no PASS/FAIL). Proceeding with content.")
                break

        # Validate content before saving
        if not content:
            raise RuntimeError(f"Failed to generate content for {client_id} after {MAX_CRITIC_RETRIES} attempts")

        # Save immutable original for future analysis
        content_orig_path = os.path.join(client_path, "content.orig.md")
        if atomic_write(content_orig_path, content):
            _log_aligned("info", "💾", "Copywriter", "Saved original AI output to content.orig.md")
        else:
            _log_aligned("error", "❌", "Copywriter", f"Failed to write {content_orig_path}")

        # Save the working copy
        content_path = os.path.join(client_path, "content.md")
        if atomic_write(content_path, content):
            _log_aligned("info", "💾", "Copywriter", "Saved content.md")
        else:
            _log_aligned("error", "❌", "Copywriter", f"Failed to write {content_path}")
            raise RuntimeError(f"Failed to write content.md for {client_id}")

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
    # #region agent log
    import json as json_module
    log_path = r"e:\Desktop\Projects\Freelance\Ghost_factory\.cursor\debug.log"
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "A", "location": "factory.py:1136", "message": "run_builder entry", "data": {"client_path": client_path}, "timestamp": int(time.time() * 1000)}) + "\n")
    except: pass
    # #endregion
    client_id = os.path.basename(client_path)
    # Validate client ID to prevent path traversal
    validate_client_id_or_raise(client_id, "run_builder")
    
    # Check for existing page.tsx - skip if already generated
    target_file = f"./app/clients/{client_id}/page.tsx"
    if os.path.exists(target_file):
        _log_aligned("info", "⏭️", "Builder", f"Page already exists for {client_id}, skipping builder stage")
        return
    
    _log_aligned("info", "🧱", "Builder", f"assembling {client_id} (Self-Correcting Mode)...")

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
            _log_aligned("warning", "⚠️", "Builder", "Library Manifest not found. AI will generate raw code.")

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
                _log_aligned("info", "✅", "Builder", f"Loaded theme.json for {client_id}")
            except (json.JSONDecodeError, IOError) as e:
                _log_aligned("warning", "⚠️", "Builder", f"Failed to load theme.json: {e}")

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
9. CRITICAL: Generate COMPLETE, syntactically valid TypeScript/TSX code. All template literals, strings, JSX tags, and code blocks must be properly closed. The code must compile without errors.
10. Ensure all opening braces {{, brackets [, parentheses (, backticks (backtick character), and JSX tags have matching closing characters.

MANIFEST:
{manifest}

{theme_section}
"""

        # target_file already set above in partial state check
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
        
        # Progress tracking to detect when we're not making progress (save API costs)
        error_history = []  # Track last 3 errors to detect repetition
        consecutive_same_errors = 0
        last_error_type = None

        # Start heartbeat so we can see progress during long builder cycles
        heartbeat_stop, heartbeat_thread = _start_heartbeat(f"Builder for {client_id}", interval=10.0)

        try:
            while total_attempts < max_total_attempts:
                total_attempts += 1
                # #region agent log
                try:
                    with open(log_path, "a", encoding="utf-8") as f:
                        f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "A", "location": "factory.py:1232", "message": "loop iteration start", "data": {"total_attempts": total_attempts, "max_total_attempts": max_total_attempts, "syntax_feedback": syntax_feedback[:100] if syntax_feedback else None, "visual_feedback": visual_feedback[:100] if visual_feedback else None}, "timestamp": int(time.time() * 1000)}) + "\n")
                except: pass
                # #endregion
                _log_aligned("info", "🔄", "Builder cycle", f"{total_attempts}/{max_total_attempts}...")

                # Build user message with any feedback
                user_content = f"Brief: {brief}\n\nContent: {content}"

                if syntax_feedback:
                    user_content += f"""

## SYNTAX ERROR FROM PREVIOUS ATTEMPT
The previous code had TypeScript compilation errors. Please fix these issues:
```
{syntax_feedback}
```

CRITICAL REQUIREMENTS:
- Generate COMPLETE, syntactically valid TypeScript/TSX code
- Ensure all template literals (backticks) are properly closed
- Ensure all opening braces `{{`, brackets `[`, parentheses `(`, and JSX tags have matching closing characters
- The code must compile without ANY syntax errors
- Pay special attention to the specific error mentioned above and ensure it is completely resolved
Generate corrected code that compiles without errors."""

                if visual_feedback and screenshot_path:
                    user_content += f"""

## VISUAL QA FEEDBACK FROM PREVIOUS ATTEMPT
The previous code rendered but had visual issues detected by our QA system:
{visual_feedback}

Please fix the visual issues while maintaining correct syntax."""

                # Generate code
                msg = _llm_messages_create(
                    model=MODEL_CODER,
                    client_id=client_id,
                    activity="pipeline_builder",
                    system=base_prompt,
                    user_content=user_content,
                    max_tokens=8000,  # Increased to prevent truncation of large page files
                )

                raw_response = _extract_response_text(msg, default="")
                # #region agent log
                try:
                    with open(log_path, "a", encoding="utf-8") as f:
                        f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "D", "location": "factory.py:1267", "message": "LLM response received", "data": {"total_attempts": total_attempts, "has_response": bool(raw_response), "response_length": len(raw_response) if raw_response else 0}, "timestamp": int(time.time() * 1000)}) + "\n")
                except: pass
                # #endregion
                if not raw_response:
                    _log_aligned("error", "❌", "Builder", f"returned empty response on attempt {total_attempts} for {client_id}")
                    memory.record_failure(
                        category="builder",
                        issue="Builder returned empty or malformed response",
                        fix="Will retry with same inputs",
                        metadata={"client_id": client_id, "attempt": total_attempts},
                    )
                    continue

                # Extract code from response
                # #region agent log
                try:
                    with open(log_path, "a", encoding="utf-8") as f:
                        f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "A", "location": "factory.py:1418", "message": "code extraction start", "data": {"total_attempts": total_attempts, "raw_response_len": len(raw_response), "has_code_block": "```" in raw_response}, "timestamp": int(time.time() * 1000)}) + "\n")
                except: pass
                # #endregion
                # Try multiple regex patterns in order of specificity
                patterns = [
                    r'```tsx\s*(.*?)```',  # Explicit tsx block
                    r'```typescript\s*(.*?)```',  # Explicit typescript block
                    r'```ts\s*(.*?)```',  # Explicit ts block
                    r'```(?:tsx|typescript|ts)?\s*(.*?)```',  # Any code block with optional language
                    r'```\s*(.*?)```',  # Generic code block (fallback)
                ]
                
                code = None
                for pattern in patterns:
                    match = re.search(pattern, raw_response, re.DOTALL)
                    if match:
                        code = match.group(1).strip()
                        # #region agent log
                        try:
                            with open(log_path, "a", encoding="utf-8") as f:
                                code_preview = code[:200] if code else ""
                                backtick_count = code.count("`") if code else 0
                                template_expr_count = code.count("${") if code else 0
                                f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "A", "location": "factory.py:1512", "message": "code extracted from block", "data": {"total_attempts": total_attempts, "code_len": len(code), "code_preview": code_preview, "backtick_count": backtick_count, "template_expr_count": template_expr_count, "pattern_used": pattern[:40]}, "timestamp": int(time.time() * 1000)}) + "\n")
                        except: pass
                        # #endregion
                        break
                
                if not code:
                    _log_aligned("warning", "⚠️", "Builder", "No code blocks found in Builder response. Using raw output.")
                    code = raw_response.strip()
                    # #region agent log
                    try:
                        with open(log_path, "a", encoding="utf-8") as f:
                            f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "A", "location": "factory.py:1523", "message": "no code block found, using raw", "data": {"total_attempts": total_attempts, "code_len": len(code)}, "timestamp": int(time.time() * 1000)}) + "\n")
                    except: pass
                    # #endregion

                # Phase 1: Syntax Check
                _log_aligned("info", "🔍", "Phase 1", f"Syntax validation (attempt {total_attempts})...")
                syntax_ok, syntax_error = check_syntax(code, client_id)
                # #region agent log
                try:
                    with open(log_path, "a", encoding="utf-8") as f:
                        f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "A", "location": "factory.py:1288", "message": "syntax check result", "data": {"total_attempts": total_attempts, "syntax_ok": syntax_ok, "error_preview": syntax_error[:200] if syntax_error else None}, "timestamp": int(time.time() * 1000)}) + "\n")
                except: pass
                # #endregion

                if not syntax_ok:
                    _log_aligned("warning", "⚠️", "Syntax check", f"failed on attempt {total_attempts}")
                    syntax_feedback = syntax_error

                    # Track error patterns to detect when we're not making progress (save API costs)
                    # Extract error type (first line of error, normalized)
                    error_first_line = syntax_error.split('\n')[0] if syntax_error else ""
                    
                    # Detect module resolution errors (normalize all module errors to same category)
                    is_module_error = "Cannot find module" in error_first_line or "TS2307" in syntax_error
                    
                    # Normalize error type for comparison:
                    # - All module errors become "MODULE_ERROR"
                    # - Other errors use first 80 chars (to catch similar but not identical errors)
                    if is_module_error:
                        error_type = "MODULE_ERROR"
                    else:
                        error_type = error_first_line[:80]  # Normalize to first 80 chars
                    
                    # Check if this is the same error category as before
                    if error_type == last_error_type:
                        consecutive_same_errors += 1
                    else:
                        consecutive_same_errors = 1
                        last_error_type = error_type
                    
                    # Keep error history (last 3)
                    error_history.append(error_type)
                    if len(error_history) > 3:
                        error_history.pop(0)
                    
                    # #region agent log
                    try:
                        with open(log_path, "a", encoding="utf-8") as f:
                            f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "A", "location": "factory.py:1597", "message": "error pattern tracking", "data": {"total_attempts": total_attempts, "error_type": error_type, "is_module_error": is_module_error, "consecutive_same_errors": consecutive_same_errors, "last_error_type": last_error_type}, "timestamp": int(time.time() * 1000)}) + "\n")
                    except: pass
                    # #endregion
                    
                    # Early exit conditions to save API credits:
                    # 1. Module resolution errors = config issue, exit after 2 attempts (saves 4 API calls)
                    # 2. Same error category 3 times in a row = no progress, exit early
                    if is_module_error and total_attempts >= 2:
                        _log_aligned("error", "❌", "Builder", f"Module resolution error detected (attempt {total_attempts}). Likely tsconfig issue. Exiting early to save API credits.")
                        final_qa_status = "SKIPPED"
                        final_qa_report = f"Build failed: Module resolution error (likely tsconfig issue). Error: {error_first_line[:200]}"
                        break
                    
                    if consecutive_same_errors >= 3:
                        _log_aligned("error", "❌", "Builder", f"Same error category repeated {consecutive_same_errors} times. Exiting early to save API credits.")
                        final_qa_status = "SKIPPED"
                        final_qa_report = f"Build failed: Same error repeated {consecutive_same_errors} times. Last error: {error_first_line[:200]}"
                        break

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
                _log_aligned("info", "✅", "Syntax check", f"passed on attempt {total_attempts}")

                # Phase 2: Save and run Visual QA
                _log_aligned("info", "🔍", "Phase 2", f"Visual QA (attempt {total_attempts})...")

                # Save the code atomically
                write_success = atomic_write(target_file, code)
                # #region agent log
                try:
                    with open(log_path, "a", encoding="utf-8") as f:
                        f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "E", "location": "factory.py:1314", "message": "file write result", "data": {"total_attempts": total_attempts, "write_success": write_success, "target_file": target_file}, "timestamp": int(time.time() * 1000)}) + "\n")
                except: pass
                # #endregion
                if not write_success:
                    _log_aligned("error", "❌", "Builder", f"Failed to write {target_file}")
                    memory.record_failure(
                        category="builder",
                        issue=f"Failed to write page.tsx file: {target_file}",
                        fix="Check file permissions and disk space",
                        metadata={"client_id": client_id, "attempt": total_attempts}
                    )
                    continue  # Retry

                # Run QA
                qa_status, qa_report, screenshot_path = run_qa(client_path)
                # #region agent log
                try:
                    with open(log_path, "a", encoding="utf-8") as f:
                        f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "B", "location": "factory.py:1325", "message": "QA result", "data": {"total_attempts": total_attempts, "qa_status": qa_status, "report_preview": qa_report[:200] if qa_report else None, "has_screenshot": bool(screenshot_path)}, "timestamp": int(time.time() * 1000)}) + "\n")
                except: pass
                # #endregion

                # Phase 3: Check QA results
                if qa_status == "PASS":
                    _log_aligned("info", "✅", "Visual QA", f"passed on attempt {total_attempts}")
                    final_qa_status = qa_status
                    final_qa_report = qa_report
                    break  # Success! Exit the loop

                elif qa_status == "FAIL":
                    _log_aligned("warning", "⚠️", "Visual QA", f"failed on attempt {total_attempts}")
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
                    _log_aligned("warning", "⚠️", "QA", f"returned {qa_status} - cannot repair, using current code")
                    final_qa_status = qa_status
                    final_qa_report = qa_report
                    break

        finally:
            heartbeat_stop.set()
            heartbeat_thread.join(timeout=2)

        # Phase 4: Finalization
        # #region agent log
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "A", "location": "factory.py:1364", "message": "loop exit", "data": {"total_attempts": total_attempts, "max_total_attempts": max_total_attempts, "final_qa_status": final_qa_status, "exhausted_attempts": total_attempts >= max_total_attempts}, "timestamp": int(time.time() * 1000)}) + "\n")
        except: pass
        # #endregion
        _log_aligned("info", "🏁", "Builder", f"completed after {total_attempts} attempts. Final status: {final_qa_status}")

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
    # Validate client ID to prevent path traversal
    validate_client_id_or_raise(client_id, "run_qa")
    screenshot_path = os.path.join(client_path, "qa_mobile.jpg")

    # Server Check with Auto-Start
    server_ready = ensure_server_running()
    # #region agent log
    import json as json_module
    log_path = r"e:\Desktop\Projects\Freelance\Ghost_factory\.cursor\debug.log"
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "C", "location": "factory.py:1440", "message": "run_qa server check", "data": {"client_id": client_id, "server_ready": server_ready}, "timestamp": int(time.time() * 1000)}) + "\n")
    except: pass
    # #endregion

    if not server_ready:
        _log_aligned("error", "❌", "QA", "Server unavailable. QA Skipped.")
        return ("SKIPPED", "Server unavailable - QA could not run", screenshot_path)

    with time_tracker.track_span("pipeline_qa", client_id, {"stage": "qa"}):
        _log_aligned("info", "🕵️‍♂️", "QA Inspector", "starting...")
        url = f"http://localhost:3000/clients/{client_id}"

        browser = None
        try:
            # Capture screenshot
            with sync_playwright() as p:
                browser = p.chromium.launch()
                try:
                    page = browser.new_page(viewport={"width": 390, "height": 844})
                    page.goto(url)
                    page.wait_for_timeout(3000)  # Wait for hydration
                    page.screenshot(path=screenshot_path, full_page=True)
                finally:
                    # Ensure browser is always closed, even on exception
                    if browser:
                        try:
                            browser.close()
                        except Exception as e:
                            _log_aligned("warning", "⚠️", "QA", f"Error closing browser: {e}")

            # Analyze with Vision Model
            with open(screenshot_path, "rb") as f:
                img_b64 = base64.b64encode(f.read()).decode("utf-8")

            msg = _anthropic_messages_create(
                model=MODEL_QA,
                client_id=client_id,
                activity="pipeline_qa",
                max_tokens=1000,
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
                }],
            )
            _record_model_cost("anthropic", MODEL_QA, "pipeline_qa", client_id, msg)

            report = msg.content[0].text
            with open(os.path.join(client_path, "qa_report.md"), "w", encoding="utf-8") as f:
                f.write(report)

            # Determine status from report
            if "PASS" in report and not report.strip().startswith("FAIL"):
                status = "PASS"
                _log_aligned("info", "✅", "QA", f"passed for {client_id}")
            else:
                status = "FAIL"
                _log_aligned("warning", "⚠️", "QA", f"failed for {client_id}")

            return (status, report, screenshot_path)

        except Exception as e:
            error_msg = f"Visual QA Error: {e!s}"
            # #region agent log
            try:
                with open(log_path, "a", encoding="utf-8") as f:
                    f.write(json_module.dumps({"sessionId": "debug-session", "runId": "run1", "hypothesisId": "C", "location": "factory.py:1463", "message": "run_qa exception", "data": {"client_id": client_id, "error_type": type(e).__name__, "error_msg": str(e)[:200]}, "timestamp": int(time.time() * 1000)}) + "\n")
            except: pass
            # #endregion
            _log_aligned("error", "❌", "QA", "Visual QA Error")
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
    # Validate client ID to prevent path traversal
    validate_client_id_or_raise(client_id, "finalize_client")

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
    _log_aligned("info", "🏁", "Finalizing", f"job for {client_id}...")
    try:
        intake_path = os.path.join(client_path, "intake.md")
        processed_path = os.path.join(client_path, "intake-processed.md")
        if os.path.exists(intake_path):
            os.rename(intake_path, processed_path)
    except OSError:
        _log_aligned("warning", "⚠️", "Finalizing", "Failed to rename intake.md")

# 4. MAIN BATCH LOOP
if __name__ == "__main__":
    print("\n🏭  FACTORY V4.0 ONLINE: Self-Correcting & Evolutionary Mode  🏭")
    print("    Features: Memory System | Syntax Guard | Visual Repair | A11y Critic")

    # Validate prompt library before starting
    _log_aligned("info", "📚", "Startup", "Validating prompt library...")
    if not validate_prompt_library():
        _log_aligned("error", "❌", "Startup", "FATAL: Required prompt files are missing. Cannot start factory.")
        _log_aligned("error", "❌", "Startup", "Please ensure all files exist in the prompts/ directory.")
        exit(1)

    # Ensure environment is ready (Fix #5)
    _log_aligned("info", "🎭", "Startup", "Checking Playwright browsers...")
    try:
        subprocess.run(["playwright", "install", "chromium"], check=True, capture_output=True)
        _log_aligned("info", "✅", "Startup", "Browsers ready.")
    except Exception as e:
        _log_aligned("error", "❌", "Startup", f"Playwright install failed: {e}")
        _log_aligned("warning", "⚠️", "Startup", "Visual QA may fail.")

    # Check for command-line argument (client ID)
    if len(sys.argv) > 1:
        client_id_arg = sys.argv[1]
        if is_valid_client_id(client_id_arg):
            # Use absolute path to avoid Windows path issues
            base_dir = os.path.abspath(WATCH_DIR)
            client_path = os.path.join(base_dir, client_id_arg)
            intake_path = os.path.join(client_path, "intake.md")
            if os.path.isdir(client_path) and os.path.exists(intake_path):
                _log_aligned("info", "🚀", "CLI", f"Processing client from command line: {client_id_arg}")
                try:
                    with client_lock(client_id_arg):
                        run_architect(client_path)
                    _log_aligned("info", "✅", "CLI", f"Completed processing for {client_id_arg}")
                    exit(0)
                except RuntimeError as e:
                    _log_aligned("error", "❌", "CLI", f"Could not acquire lock for {client_id_arg}: {e}")
                    exit(1)
                except Exception as e:
                    _log_aligned("error", "❌", "CLI", f"Pipeline crashed for {client_id_arg}: {e}")
                    exit(1)
            else:
                _log_aligned("error", "❌", "CLI", f"Client directory not found or missing intake.md: {client_path}")
                exit(1)
        else:
            _log_aligned("error", "❌", "CLI", f"Invalid client ID: {client_id_arg}")
            exit(1)

    while True:
        has_new_data = git_pull()
        run_intake_sanitizer()

        if os.path.exists(WATCH_DIR):
            for client_id in os.listdir(WATCH_DIR):
                # Skip dotfiles
                if client_id.startswith("."):
                    continue

                # Validate client ID to prevent path traversal attacks
                if not is_valid_client_id(client_id):
                    _log_aligned("warning", "⚠️", "Batch loop", f"Skipping invalid client ID: {client_id}")
                    continue
                
                # Check if client is already being processed
                if is_locked(client_id):
                    _log_aligned("info", "⏸️", "Batch loop", f"Client {client_id} is already being processed, skipping")
                    continue
                
                path = os.path.join(WATCH_DIR, client_id)
                # Look for unprocessed intake files
                if os.path.isdir(path) and os.path.exists(f"{path}/intake.md"):
                    _log_aligned("info", "🚀", "Batch loop", f"Found pending job: {client_id}")
                    try:
                        # Acquire lock before processing
                        with client_lock(client_id):
                            run_architect(path)
                    except RuntimeError as e:
                        # Lock acquisition failed - another instance is processing
                        _log_aligned("info", "⏸️", "Batch loop", f"Could not acquire lock for {client_id}, skipping")
                    except Exception as e:
                        _log_aligned("error", "❌", "Batch loop", f"Pipeline crashed for {client_id}: {e}")
                        # Since we didn't rename intake.md, it will be retried next loop

        _log_aligned("info", "💤", "Batch loop", f"Batch complete. Sleeping for {BATCH_INTERVAL/60} minutes...")
        time.sleep(BATCH_INTERVAL)