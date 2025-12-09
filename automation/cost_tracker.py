import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


CONFIG_PATH = Path("automation/tracker_config.json")
API_COST_DIR = Path("data/costs/api")
HOSTING_COST_DIR = Path("data/costs/hosting")


def load_config() -> Dict[str, Any]:
    if CONFIG_PATH.exists():
        try:
            with CONFIG_PATH.open("r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as exc:  # pragma: no cover - defensive
            logging.warning(f"Failed to load tracker_config.json: {exc}")
    return {}


def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _month_path(base: Path, month_str: str) -> Path:
    _ensure_dir(base)
    return base / f"{month_str}.json"


def _append_entry(base: Path, month_str: str, entry: Dict[str, Any]) -> None:
    path = _month_path(base, month_str)
    if path.exists():
        try:
            with path.open("r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, IOError) as exc:
            logging.warning(f"Failed to read/parse JSON file {path}: {exc}, starting with empty list")
            data = []
    else:
        data = []
    
    # Validate entry before appending
    from automation.schema_validator import validate_api_cost_entry, validate_hosting_cost_entry
    is_hosting = entry.get("type") == "hosting"
    validator = validate_hosting_cost_entry if is_hosting else validate_api_cost_entry
    is_valid, error = validator(entry)
    if not is_valid:
        logging.error(f"Invalid cost entry rejected: {error}")
        return
    
    data.append(entry)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def _pricing_for(model_key: str, cfg: Dict[str, Any]) -> Dict[str, float]:
    pricing = cfg.get("api_pricing", {})
    return pricing.get(model_key, {"input_per_million": 0.0, "output_per_million": 0.0})


def _estimate_tokens(activity: str, cfg: Dict[str, Any]) -> Dict[str, int]:
    estimates = cfg.get("token_estimates", {})
    return estimates.get(activity, {"input": 0, "output": 0})


def record_api_cost(
    provider: str,
    model: str,
    client_id: Optional[str],
    activity: str,
    input_tokens: Optional[int],
    output_tokens: Optional[int],
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Record an API call cost for Anthropic/OpenAI."""
    cfg = load_config()
    model_key = f"{provider}/{model}"
    pricing = _pricing_for(model_key, cfg)
    estimates = _estimate_tokens(activity, cfg)

    in_tokens = input_tokens if input_tokens is not None else estimates.get("input", 0)
    out_tokens = output_tokens if output_tokens is not None else estimates.get("output", 0)

    cost_input = (in_tokens / 1_000_000) * pricing.get("input_per_million", 0.0)
    cost_output = (out_tokens / 1_000_000) * pricing.get("output_per_million", 0.0)
    total_cost = round(cost_input + cost_output, 4)

    now = datetime.utcnow()
    entry = {
        "timestamp": now.isoformat(),
        "provider": provider,
        "model": model,
        "activity": activity,
        "client_id": client_id,
        "input_tokens": in_tokens,
        "output_tokens": out_tokens,
        "cost_usd": total_cost,
        "metadata": metadata or {},
    }

    month_str = now.strftime("%Y-%m")
    _append_entry(API_COST_DIR, month_str, entry)
    logging.info(
        f"[cost] provider={provider} model={model} activity={activity} "
        f"tokens_in={in_tokens} tokens_out={out_tokens} cost=${total_cost}"
    )
    return entry


def record_hosting_costs(managed_clients: List[str], month_str: Optional[str] = None) -> List[Dict[str, Any]]:
    """Record hosting costs for managed clients for a month."""
    cfg = load_config()
    month_str = month_str or datetime.utcnow().strftime("%Y-%m")
    cost_per_client = cfg.get("hosting", {}).get("cost_per_managed_client", 5.0)

    entries: List[Dict[str, Any]] = []
    for client_id in managed_clients:
        entry = {
            "timestamp": f"{month_str}-01T00:00:00Z",
            "client_id": client_id,
            "cost_usd": cost_per_client,
            "type": "hosting",
        }
        entries.append(entry)
        _append_entry(HOSTING_COST_DIR, month_str, entry)
    if managed_clients:
        logging.info(f"[cost] Recorded hosting costs for {len(managed_clients)} managed clients (${cost_per_client} each)")
    return entries

