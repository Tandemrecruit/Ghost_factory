import argparse
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import cost_tracker


PROJECT_TRACKER_PATH = Path("docs/operations/project_tracker.md")
REVENUE_DIR = Path("data/revenue")
CONFIG_PATH = Path("automation/tracker_config.json")


DEFAULT_PACKAGE_PRICING = {
    "LP-Base": 300,
    "LP-Standard": 450,
    "LP-Plus": 650,
}


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


def _parse_table_rows() -> List[Dict[str, str]]:
    if not PROJECT_TRACKER_PATH.exists():
        logging.warning("project_tracker.md not found; no revenue entries generated.")
        return []

    with PROJECT_TRACKER_PATH.open("r", encoding="utf-8") as f:
        lines = f.readlines()

    rows: List[Dict[str, str]] = []
    header: List[str] = []
    for line in lines:
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.split("|")[1:-1]]
        if not header:
            header = cells
            continue
        if all(set(c) <= {"-", ":"} for c in cells):
            # separator row
            continue
        if len(cells) != len(header):
            continue
        row = {header[i]: cells[i] for i in range(len(header))}
        rows.append(row)
    return rows


def _parse_date(date_str: str) -> Optional[datetime]:
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str)
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            logging.warning(f"Could not parse date: {date_str}")
            return None


def _package_pricing(cfg: Dict[str, Any]) -> Dict[str, float]:
    return cfg.get("package_pricing", DEFAULT_PACKAGE_PRICING)


def _hosting_fee(cfg: Dict[str, Any]) -> float:
    return cfg.get("hosting", {}).get("fee_per_managed_client", 25.0)


def _append_entries(month_str: str, entries: List[Dict[str, Any]]) -> None:
    _ensure_dir(REVENUE_DIR)
    path = REVENUE_DIR / f"{month_str}.json"
    data: List[Dict[str, Any]] = []
    if path.exists():
        try:
            with path.open("r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = []
    data.extend(entries)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def generate_revenue_for_month(month_str: str) -> List[Dict[str, Any]]:
    cfg = load_config()
    pricing = _package_pricing(cfg)
    hosting_fee = _hosting_fee(cfg)
    rows = _parse_table_rows()

    entries: List[Dict[str, Any]] = []
    managed_clients: List[str] = []
    month_start = datetime.fromisoformat(f"{month_str}-01")
    month_end = datetime.fromisoformat(f"{month_str}-28")  # safe bound for filtering

    for row in rows:
        client_id = row.get("client_id") or None
        package = row.get("package", "").strip()
        hosting = row.get("hosting", "").strip().lower()
        price = pricing.get(package, 0)
        deposit_date = _parse_date(row.get("deposit_date", "").strip())
        final_date = _parse_date(row.get("final_payment_date", "").strip())

        if deposit_date and deposit_date.strftime("%Y-%m") == month_str:
            entries.append(
                {
                    "timestamp": deposit_date.isoformat(),
                    "client_id": client_id,
                    "type": "deposit",
                    "amount_usd": round(price * 0.5, 2),
                    "package": package,
                }
            )

        if final_date and final_date.strftime("%Y-%m") == month_str:
            entries.append(
                {
                    "timestamp": final_date.isoformat(),
                    "client_id": client_id,
                    "type": "final_payment",
                    "amount_usd": round(price * 0.5, 2),
                    "package": package,
                }
            )

        # Hosting recurring revenue (post-final payment)
        if hosting == "managed" and final_date and final_date <= month_end and final_date.strftime("%Y-%m") <= month_str:
            entries.append(
                {
                    "timestamp": f"{month_str}-01T00:00:00Z",
                    "client_id": client_id,
                    "type": "hosting_recurring",
                    "amount_usd": round(hosting_fee, 2),
                    "package": package,
                }
            )
            if client_id:
                managed_clients.append(client_id)

    _append_entries(month_str, entries)
    if managed_clients:
        try:
            cost_tracker.record_hosting_costs(managed_clients, month_str=month_str)
        except Exception as exc:
            logging.warning(f"Failed to record hosting costs: {exc}")
    logging.info(f"[revenue] Generated {len(entries)} entries for {month_str}")
    return entries


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [revenue] %(message)s")
    parser = argparse.ArgumentParser(description="Generate revenue entries from project tracker")
    parser.add_argument("--month", type=str, help="Target month YYYY-MM", default=datetime.utcnow().strftime("%Y-%m"))
    args = parser.parse_args()
    generate_revenue_for_month(args.month)


if __name__ == "__main__":
    main()

