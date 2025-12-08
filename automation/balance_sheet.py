import argparse
import csv
import json
import logging
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple


TIME_LOG_DIR = Path("data/time_logs")
API_COST_DIR = Path("data/costs/api")
HOSTING_COST_DIR = Path("data/costs/hosting")
REVENUE_DIR = Path("data/revenue")
BALANCE_DIR = Path("data/balance_sheets")
CONFIG_PATH = Path("automation/tracker_config.json")


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


def _read_json(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        return []
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:  # pragma: no cover - defensive
        logging.warning(f"Failed to read {path}: {exc}")
        return []


def _time_entries(month: str) -> List[Dict[str, Any]]:
    month_dir = TIME_LOG_DIR / month
    if not month_dir.exists():
        return []
    entries: List[Dict[str, Any]] = []
    for path in month_dir.glob("*.json"):
        entries.extend(_read_json(path))
    return entries


def _cost_entries(month: str) -> List[Dict[str, Any]]:
    api_path = API_COST_DIR / f"{month}.json"
    hosting_path = HOSTING_COST_DIR / f"{month}.json"
    return _read_json(api_path) + _read_json(hosting_path)


def _revenue_entries(month: str) -> List[Dict[str, Any]]:
    return _read_json(REVENUE_DIR / f"{month}.json")


def _daily_totals(entries: List[Dict[str, Any]], amount_key: str) -> Dict[str, float]:
    daily: Dict[str, float] = defaultdict(float)
    for entry in entries:
        ts = entry.get("timestamp")
        if not ts:
            continue
        day = ts[:10]
        daily[day] += float(entry.get(amount_key, 0.0))
    return daily


def compute_balance_sheet(month: str) -> Dict[str, Any]:
    cfg = load_config()
    processing_rate = cfg.get("payment_processing_rate", 0.03)

    time_entries = _time_entries(month)
    revenue_entries = _revenue_entries(month)
    cost_entries = _cost_entries(month)

    total_seconds = sum(e.get("duration_seconds", 0.0) for e in time_entries)
    total_hours = total_seconds / 3600 if total_seconds else 0.0
    time_saved_seconds = sum(e.get("time_saved_seconds", 0.0) for e in time_entries)

    revenue_total = sum(float(e.get("amount_usd", 0.0)) for e in revenue_entries)
    api_cost_total = sum(float(e.get("cost_usd", 0.0)) for e in cost_entries if e.get("provider"))
    hosting_cost_total = sum(float(e.get("cost_usd", 0.0)) for e in cost_entries if e.get("type") == "hosting")
    fee_cost_total = round(revenue_total * processing_rate, 2)
    total_costs = api_cost_total + hosting_cost_total + fee_cost_total
    net_income = revenue_total - total_costs
    effective_hourly = net_income / total_hours if total_hours else 0.0

    daily_revenue = _daily_totals(revenue_entries, "amount_usd")
    daily_costs = _daily_totals(
        [{"timestamp": e.get("timestamp"), "cost": e.get("cost_usd", 0.0)} for e in cost_entries],
        "cost",
    )

    # Payment processing fees applied on revenue days
    for day, amount in daily_revenue.items():
        daily_costs[day] += amount * processing_rate

    running_balance: List[Dict[str, Any]] = []
    cumulative = 0.0
    for day in sorted(set(list(daily_revenue.keys()) + list(daily_costs.keys()))):
        delta = daily_revenue.get(day, 0.0) - daily_costs.get(day, 0.0)
        cumulative += delta
        running_balance.append({"day": day, "balance_usd": round(cumulative, 2)})

    result = {
        "month": month,
        "totals": {
            "revenue_usd": round(revenue_total, 2),
            "costs_usd": round(total_costs, 2),
            "api_cost_usd": round(api_cost_total, 2),
            "hosting_cost_usd": round(hosting_cost_total, 2),
            "payment_fee_usd": round(fee_cost_total, 2),
            "net_income_usd": round(net_income, 2),
            "hours": round(total_hours, 2),
            "time_saved_hours": round(time_saved_seconds / 3600, 2),
            "effective_hourly_usd": round(effective_hourly, 2),
        },
        "running_balance": running_balance,
        "entries": {
            "time": time_entries,
            "revenue": revenue_entries,
            "costs": cost_entries,
        },
    }
    return result


def _write_outputs(month: str, data: Dict[str, Any]) -> None:
    _ensure_dir(BALANCE_DIR)
    json_path = BALANCE_DIR / f"{month}.json"
    with json_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    csv_path = BALANCE_DIR / f"{month}.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["metric", "value"])
        for key, value in data["totals"].items():
            writer.writerow([key, value])


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [balance] %(message)s")
    parser = argparse.ArgumentParser(description="Generate monthly balance sheet")
    parser.add_argument("--month", type=str, default=datetime.utcnow().strftime("%Y-%m"), help="Target month YYYY-MM")
    args = parser.parse_args()
    data = compute_balance_sheet(args.month)
    _write_outputs(args.month, data)
    logging.info(
        f"[balance] {args.month} revenue=${data['totals']['revenue_usd']}, "
        f"net=${data['totals']['net_income_usd']}, effective_hourly=${data['totals']['effective_hourly_usd']}"
    )


if __name__ == "__main__":
    main()

