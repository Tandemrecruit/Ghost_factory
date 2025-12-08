"""
project_tracker_check.py

Helper script to keep your project tracker in sync with the actual clients on disk.

What it does:
- Scans the ./clients/ directory for client folders
- Parses docs/project_tracker.md for client_ids in the table
- Warns if:
  - There are client folders with no matching tracker row
  - There are tracker rows with no matching client folder
- Shows a quick summary per client:
  - Has intake.md?
  - Has qa_report.md?

Usage (from repo root, PowerShell on Windows):

    python scripts\project_tracker_check.py
"""

import sys
from pathlib import Path


def load_tracked_client_ids(tracker_path: Path) -> set[str]:
    """Parse docs/project_tracker.md and extract client_ids from the table."""
    if not tracker_path.exists():
        print(f"[WARN] Tracker file not found at {tracker_path}")
        return set()

    tracked_ids: set[str] = set()
    in_table = False

    with tracker_path.open("r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.rstrip("\n")

            # Detect start of table
            if line.startswith("| client_id"):
                in_table = True
                continue

            if not in_table:
                continue

            # End of table: first non-table line
            if not line.strip().startswith("|"):
                break

            # Skip separator row (---)
            if line.strip().startswith("|---"):
                continue

            # Parse cells: split by '|' and ignore first/last empty parts
            cells = [c.strip() for c in line.strip().split("|")[1:-1]]

            if not cells:
                continue

            client_id = cells[0]
            # Skip empty or placeholder header rows
            if client_id and client_id.lower() != "client_id":
                tracked_ids.add(client_id)

    return tracked_ids


def inspect_client_folder(client_dir: Path) -> dict:
    """Check which key files exist for a given client."""
    files = {p.name for p in client_dir.glob("*")}

    has_intake = "intake.md" in files
    has_raw = "intake-raw.md" in files or "intake-source.md" in files
    has_qa = "qa_report.md" in files or "qa_report.txt" in files

    return {
        "has_intake": has_intake,
        "has_raw": has_raw,
        "has_qa": has_qa,
    }


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    tracker_path = repo_root / "docs" / "project_tracker.md"
    clients_dir = repo_root / "clients"

    print(f"[INFO] Repo root: {repo_root}")
    print(f"[INFO] Tracker:   {tracker_path}")
    print(f"[INFO] Clients:   {clients_dir}\n")

    tracked_ids = load_tracked_client_ids(tracker_path)
    print(f"[INFO] Tracked client_ids in project_tracker.md: {sorted(tracked_ids) or 'None'}\n")

    if not clients_dir.exists():
        print("[WARN] No ./clients directory found yet. Create it as you add projects.")
        return

    client_folders = [p for p in clients_dir.iterdir() if p.is_dir()]
    disk_ids = {p.name for p in client_folders}

    if not client_folders:
        print("[INFO] No client folders found under ./clients yet.")
    else:
        print("[INFO] Client folders found on disk:")
        for p in sorted(client_folders, key=lambda x: x.name):
            print(f"  - {p.name}")
        print()

    # Check for mismatches
    missing_in_tracker = disk_ids - tracked_ids
    missing_on_disk = tracked_ids - disk_ids

    if missing_in_tracker:
        print("[WARN] Client folders with NO matching tracker row:")
        for cid in sorted(missing_in_tracker):
            print(f"  - {cid}")
        print("      → Add these client_ids to docs/project_tracker.md\n")

    if missing_on_disk:
        print("[WARN] Tracker rows with NO matching client folder on disk:")
        for cid in sorted(missing_on_disk):
            print(f"  - {cid}")
        print("      → Either create ./clients/{cid} or remove/archive that row\n")

    # Detailed per-client summary
    if client_folders:
        print("Per-client file summary:")
        for client_dir in sorted(client_folders, key=lambda x: x.name):
            cid = client_dir.name
            info = inspect_client_folder(client_dir)
            print(
                f"  {cid:20s} | intake.md: {'YES' if info['has_intake'] else 'no '} | "
                f"raw: {'YES' if info['has_raw'] else 'no '} | "
                f"qa_report: {'YES' if info['has_qa'] else 'no '}"
            )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(1)