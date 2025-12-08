"""
project_tracker_autoupdate.py

Automatically updates docs/project_tracker.md for steps that can be inferred
from files on disk (no extra info from you).

Rules:

1) INTAKE_PENDING -> PIPELINE_RUNNING
   - If clients/<client_id>/intake-raw.md or intake-source.md exists
   - And form_received_date is empty
   => Set form_received_date = today, status = PIPELINE_RUNNING

2) PIPELINE_RUNNING (or INTAKE_PENDING) -> DRAFT_REVIEW
   - If intake.md, brief.md, content.md, and qa_report.(md|txt) all exist
   => Set draft_ready_date = today (if empty), status = DRAFT_REVIEW

Usage (from repo root, PowerShell on Windows):

    python scripts\project_tracker_autoupdate.py

Note:
- This script REWRITES docs/project_tracker.md.
- Commit your changes before running if you want easy rollback.
"""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path
from typing import List, Dict, Tuple


def find_table_bounds(lines: List[str]) -> Tuple[int, int] | Tuple[None, None]:
    """
    Find the start and end indices of the main project table in project_tracker.md.

    Returns (start_index, end_index_exclusive) or (None, None) if not found.
    """
    start = None

    for i, line in enumerate(lines):
        if line.lstrip().startswith("| client_id"):
            start = i
            break

    if start is None:
        return None, None

    # Skip header + separator line
    i = start + 2
    while i < len(lines) and lines[i].lstrip().startswith("|"):
        i += 1

    end = i
    return start, end


def parse_table(lines: List[str], start: int, end: int) -> Tuple[List[str], List[str], List[Dict[str, str]]]:
    """
    Parse the markdown table between start and end indices (header + rows).

    Returns:
        header_line: the original header line
        separator_line: the original separator line
        rows: list of dicts keyed by column name
    """
    header_line = lines[start].rstrip("\n")
    separator_line = lines[start + 1].rstrip("\n")

    # Get column names from header
    header_cells = [c.strip() for c in header_line.strip().split("|")[1:-1]]

    rows: List[Dict[str, str]] = []

    for line in lines[start + 2 : end]:
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        if stripped.startswith("|---"):
            # separator row (shouldn't normally appear here, but be safe)
            continue

        cells = [c.strip() for c in stripped.split("|")[1:-1]]
        # Pad or trim to header length
        if len(cells) < len(header_cells):
            cells += [""] * (len(header_cells) - len(cells))
        elif len(cells) > len(header_cells):
            cells = cells[: len(header_cells)]

        row = dict(zip(header_cells, cells))
        rows.append(row)

    return header_line, separator_line, rows


def write_table(
    lines: List[str],
    start: int,
    end: int,
    header_line: str,
    separator_line: str,
    rows: List[Dict[str, str]],
) -> List[str]:
    """
    Rebuild the markdown table with updated rows, preserving everything else.
    """
    # Recreate table lines
    new_table_lines: List[str] = []
    new_table_lines.append(header_line.rstrip("\n") + "\n")
    new_table_lines.append(separator_line.rstrip("\n") + "\n")

    # Column order from header
    header_cells = [c.strip() for c in header_line.strip().split("|")[1:-1]]

    for row in rows:
        row_values = [row.get(col, "") for col in header_cells]
        line = "| " + " | ".join(row_values) + " |\n"
        new_table_lines.append(line)

    # Replace original table region
    return lines[:start] + new_table_lines + lines[end:]


def inspect_client_folder(client_dir: Path) -> dict:
    """
    Check which key files exist for a given client.
    """
    files = {p.name for p in client_dir.glob("*")}

    has_raw = "intake-raw.md" in files or "intake-source.md" in files
    has_intake = "intake.md" in files
    has_brief = "brief.md" in files
    has_content = "content.md" in files
    has_qa = "qa_report.md" in files or "qa_report.txt" in files

    return {
        "has_raw": has_raw,
        "has_intake": has_intake,
        "has_brief": has_brief,
        "has_content": has_content,
        "has_qa": has_qa,
    }


def auto_update_row(row: Dict[str, str], clients_dir: Path, today_str: str) -> bool:
    """
    Apply auto-update rules to a single row.

    Returns True if the row was modified, False otherwise.
    """
    client_id = row.get("client_id", "").strip()
    status = row.get("status", "").strip()

    # Skip empty rows / header / placeholder examples if you want
    if not client_id:
        return False
    if client_id.lower().startswith("example-"):
        return False

    client_dir = clients_dir / client_id
    if not client_dir.is_dir():
        # Nothing to infer if there is no client folder
        return False

    info = inspect_client_folder(client_dir)
    changed = False

    # Helper to read and set date fields
    def get_field(name: str) -> str:
        return row.get(name, "").strip()

    def set_field(name: str, value: str) -> None:
        nonlocal changed
        if row.get(name, "") != value:
            row[name] = value
            changed = True

    # Rule 1: INTAKE_PENDING -> PIPELINE_RUNNING when raw intake exists
    if status == "INTAKE_PENDING" and info["has_raw"]:
        if not get_field("form_received_date"):
            set_field("form_received_date", today_str)
        if status != "PIPELINE_RUNNING":
            row["status"] = "PIPELINE_RUNNING"
            changed = True
        status = row["status"]

    # Rule 2: PIPELINE_RUNNING (or still INTAKE_PENDING) -> DRAFT_REVIEW
    if status in {"PIPELINE_RUNNING", "INTAKE_PENDING"}:
        if info["has_intake"] and info["has_brief"] and info["has_content"] and info["has_qa"]:
            if not get_field("draft_ready_date"):
                set_field("draft_ready_date", today_str)
            if row["status"] != "DRAFT_REVIEW":
                row["status"] = "DRAFT_REVIEW"
                changed = True

    return changed


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    tracker_path = repo_root / "docs" / "project_tracker.md"
    clients_dir = repo_root / "clients"

    print(f"[INFO] Repo root: {repo_root}")
    print(f"[INFO] Tracker:   {tracker_path}")
    print(f"[INFO] Clients:   {clients_dir}")

    if not tracker_path.exists():
        print(f"[ERROR] Tracker file not found at {tracker_path}")
        sys.exit(1)

    if not clients_dir.exists():
        print(f"[WARN] No ./clients directory found yet. Nothing to update.")
        sys.exit(0)

    lines = tracker_path.read_text(encoding="utf-8").splitlines(keepends=True)
    start, end = find_table_bounds(lines)

    if start is None or end is None:
        print("[ERROR] Could not find project table in project_tracker.md (no '| client_id' header).")
        sys.exit(1)

    header_line, separator_line, rows = parse_table(lines, start, end)

    today_str = date.today().isoformat()
    any_changed = False

    for row in rows:
        if auto_update_row(row, clients_dir, today_str):
            any_changed = True

    if not any_changed:
        print("[INFO] No changes needed. Tracker is up to date for auto-updated fields.")
        return

    new_lines = write_table(lines, start, end, header_line, separator_line, rows)
    tracker_path.write_text("".join(new_lines), encoding="utf-8")
    print("[INFO] Updated project_tracker.md with inferred status/date changes.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(1)