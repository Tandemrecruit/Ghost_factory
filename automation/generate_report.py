import argparse
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

from automation.balance_sheet import compute_balance_sheet, _write_outputs  # type: ignore


REPORTS_DIR = Path("reports")


def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _format_currency(value: float) -> str:
    return f"${value:,.2f}"


def build_report(month: str, data: Dict[str, Any]) -> str:
    totals = data.get("totals", {})
    running = data.get("running_balance", [])

    lines = [
        f"# Monthly Report – {month}",
        "",
        "## Executive Summary",
        f"- Revenue: {_format_currency(totals.get('revenue_usd', 0))}",
        f"- Costs: {_format_currency(totals.get('costs_usd', 0))}",
        f"- Net Income: {_format_currency(totals.get('net_income_usd', 0))}",
        f"- Effective Hourly Rate: {_format_currency(totals.get('effective_hourly_usd', 0))}/hr",
        "",
        "## Time",
        f"- Hours logged: {totals.get('hours', 0)}",
        f"- Time saved (hrs): {totals.get('time_saved_hours', 0)}",
        "",
        "## Costs",
        f"- API: {_format_currency(totals.get('api_cost_usd', 0))}",
        f"- Hosting: {_format_currency(totals.get('hosting_cost_usd', 0))}",
        f"- Payment Fees: {_format_currency(totals.get('payment_fee_usd', 0))}",
        "",
        "## Running Balance",
    ]

    for point in running:
        lines.append(f"- {point['day']}: {_format_currency(point['balance_usd'])}")

    return "\n".join(lines) + "\n"


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [report] %(message)s")
    parser = argparse.ArgumentParser(description="Generate markdown report for a month")
    parser.add_argument("--month", type=str, default=datetime.utcnow().strftime("%Y-%m"), help="Target month YYYY-MM")
    args = parser.parse_args()

    data = compute_balance_sheet(args.month)
    _write_outputs(args.month, data)

    _ensure_dir(REPORTS_DIR)
    report_path = REPORTS_DIR / f"{args.month}-report.md"
    report_content = build_report(args.month, data)
    report_path.write_text(report_content, encoding="utf-8")

    logging.info(f"[report] Generated {report_path}")


if __name__ == "__main__":
    main()

