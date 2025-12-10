import argparse
import json
import logging
import threading
import time
import unicodedata
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer


CONFIG_PATH = Path("automation/tracker_config.json")
TIME_LOG_DIR = Path("data/time_logs")


def load_config() -> Dict[str, Any]:
    if CONFIG_PATH.exists():
        try:
            with CONFIG_PATH.open("r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as exc:  # pragma: no cover - defensive
            logging.warning(f"Failed to load tracker_config.json: {exc}")
    return {
        "baseline_minutes": {},
        "activity_tracking": {"inactivity_seconds": 300, "minimum_session_seconds": 60},
    }


def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _log_file_for_day(day: datetime) -> Path:
    monthly_dir = TIME_LOG_DIR / day.strftime("%Y-%m")
    _ensure_dir(monthly_dir)
    return monthly_dir / f"{day.strftime('%Y-%m-%d')}.json"


def _load_day_entries(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        return []
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
            # Validate schema
            from automation.schema_validator import validate_time_logs
            is_valid, error, invalid_count = validate_time_logs(data)
            if not is_valid:
                logging.warning(f"Schema validation failed for {path}: {error}")
                # Return data anyway but log warning
            return data
    except Exception as exc:  # pragma: no cover - defensive
        logging.warning(f"Could not read {path}: {exc}")
        return []


def _persist_day_entries(path: Path, entries: List[Dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2)


def _format_time_readable(seconds: float) -> str:
    """
    Format seconds into human-readable format.
    - Above 90 seconds: show as minutes (e.g., "2.5m")
    - Above 90 minutes (5400s): show as hours (e.g., "2.0h")
    - Otherwise: show as seconds (e.g., "45.3s")
    """
    if seconds >= 5400:  # 90 minutes
        hours = seconds / 3600
        return f"{hours:.1f}h"
    elif seconds >= 90:  # 90 seconds
        minutes = seconds / 60
        return f"{minutes:.1f}m"
    else:
        return f"{seconds:.1f}s"


def _compute_time_saved(activity: str, duration_seconds: float, cfg: Dict[str, Any]) -> float:
    baseline_minutes = cfg.get("baseline_minutes", {})
    baseline = baseline_minutes.get(activity)
    if baseline is None:
        return 0.0
    saved = (baseline * 60.0) - duration_seconds
    return max(saved, 0.0)


def log_time_entry(
    activity: str,
    client_id: Optional[str],
    duration_seconds: float,
    time_saved_seconds: float = 0.0,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Append a time entry to the daily log."""
    metadata = metadata or {}
    now = datetime.utcnow()
    entry = {
        "timestamp": now.isoformat(),
        "activity": activity,
        "client_id": client_id,
        "duration_seconds": round(duration_seconds, 2),
        "time_saved_seconds": round(time_saved_seconds, 2),
        "metadata": metadata,
    }
    path = _log_file_for_day(now)
    entries = _load_day_entries(path)
    entries.append(entry)
    _persist_day_entries(path, entries)
    # Format to match _log_aligned style: emoji + padded label + message
    label = "Time tracking"
    padded_label = f"{label:<20}"
    # Format duration and saved time in human-readable format
    duration_str = _format_time_readable(duration_seconds)
    saved_str = _format_time_readable(time_saved_seconds) if time_saved_seconds > 0 else "0s"
    client_str = client_id or "n/a"
    message = f"{activity} for {client_str} | {duration_str} (saved {saved_str})"
    
    # Dynamic emoji padding using unicodedata
    emoji = "⏱️"
    try:
        width = 2 if unicodedata.east_asian_width(emoji[0]) in ('W', 'F') else 1
    except IndexError:
        width = 1
    padding = 4 - width
    emoji_column = f"{emoji}{' ' * padding}"
    
    logging.info(f"{emoji_column}{padded_label} {message}")
    return entry


@contextmanager
def track_span(activity: str, client_id: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None):
    """Context manager to time a span and auto-log with baseline time-saved."""
    cfg = load_config()
    start = time.time()
    try:
        yield
    finally:
        elapsed = time.time() - start
        saved = _compute_time_saved(activity, elapsed, cfg)
        log_time_entry(activity, client_id, elapsed, saved, metadata)


class _ActivityHandler(FileSystemEventHandler):
    def __init__(self, monitor: "FileActivityMonitor") -> None:
        super().__init__()
        self.monitor = monitor

    def on_any_event(self, event: FileSystemEvent) -> None:
        if event.is_directory:
            return
        self.monitor.record_event(Path(event.src_path))


class FileActivityMonitor:
    """Lightweight file activity tracker that groups edits into sessions."""

    def __init__(
        self,
        paths: List[Path],
        inactivity_seconds: int = 300,
        minimum_session_seconds: int = 60,
    ) -> None:
        self.paths = [p for p in paths if p.exists()]
        self.inactivity_seconds = inactivity_seconds
        self.minimum_session_seconds = minimum_session_seconds
        self._lock = threading.Lock()
        self._observer: Optional[Observer] = None
        self._stop_event = threading.Event()
        self._session: Optional[Dict[str, Any]] = None
        self._seen_paths: set[str] = set()

    def start(self) -> None:
        if not self.paths:
            logging.warning("No valid paths to watch; file activity monitor not started.")
            return

        handler = _ActivityHandler(self)
        observer = Observer()
        for path in self.paths:
            observer.schedule(handler, str(path), recursive=True)
        observer.start()
        self._observer = observer
        threading.Thread(target=self._watch_inactivity, daemon=True).start()
        logging.info(f"FileActivityMonitor watching: {', '.join(str(p) for p in self.paths)}")

    def stop(self) -> None:
        self._stop_event.set()
        if self._observer:
            self._observer.stop()
            self._observer.join(timeout=5)
        self._flush(force=True)

    def record_event(self, path: Path) -> None:
        now = time.time()
        with self._lock:
            activity = self._infer_activity(path)
            client_id = self._infer_client_id(path)
            if self._session and (now - self._session["last_event"] <= self.inactivity_seconds):
                self._session["last_event"] = now
                self._session["activity"] = self._session["activity"] or activity
                self._session["client_id"] = self._session["client_id"] or client_id
            else:
                # flush old session before starting a new one
                self._flush(force=False)
                self._session = {
                    "start": now,
                    "last_event": now,
                    "activity": activity,
                    "client_id": client_id,
                }
                self._seen_paths.clear()
            self._seen_paths.add(str(path))

    def _watch_inactivity(self) -> None:
        while not self._stop_event.is_set():
            time.sleep(10)
            self._flush(force=False)

    def _flush(self, force: bool) -> None:
        with self._lock:
            if not self._session:
                return
            now = time.time()
            idle = now - self._session["last_event"]
            if not force and idle < self.inactivity_seconds:
                return

            duration = self._session["last_event"] - self._session["start"]
            if duration >= self.minimum_session_seconds:
                log_time_entry(
                    activity=self._session["activity"] or "manual_work",
                    client_id=self._session["client_id"],
                    duration_seconds=duration,
                    time_saved_seconds=0.0,
                    metadata={
                        "source": "file_watch",
                        "paths": list(self._seen_paths),
                    },
                )
            self._session = None
            self._seen_paths.clear()

    @staticmethod
    def _infer_activity(path: Path) -> str:
        lower = str(path).lower()
        if "app/clients" in lower or "clients" in lower:
            return "revision_work"
        if "docs" in lower or "templates" in lower:
            return "admin"
        if "components" in lower or "design-system" in lower:
            return "infrastructure"
        return "manual_work"

    @staticmethod
    def _infer_client_id(path: Path) -> Optional[str]:
        parts = path.parts
        for idx, part in enumerate(parts):
            if part == "clients" and idx + 1 < len(parts):
                slug = parts[idx + 1]
                if slug.startswith("[") and slug.endswith("]"):
                    return None
                return slug
        return None


def _default_watch_paths() -> List[Path]:
    return [Path("clients"), Path("app/clients"), Path("docs")]


def _build_monitor_from_config() -> FileActivityMonitor:
    cfg = load_config()
    tracking = cfg.get("activity_tracking", {})
    return FileActivityMonitor(
        paths=_default_watch_paths(),
        inactivity_seconds=tracking.get("inactivity_seconds", 300),
        minimum_session_seconds=tracking.get("minimum_session_seconds", 60),
    )


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [time-tracker] %(message)s")
    parser = argparse.ArgumentParser(description="Automatic time tracker")
    parser.add_argument("--watch", action="store_true", help="Watch filesystem and log activity sessions")
    parser.add_argument("--status", action="store_true", help="Print current day log path")
    args = parser.parse_args()

    if args.status:
        today_path = _log_file_for_day(datetime.utcnow())
        logging.info(f"Today's log: {today_path}")

    if args.watch:
        monitor = _build_monitor_from_config()
        monitor.start()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logging.info("Stopping file activity monitor...")
            monitor.stop()


if __name__ == "__main__":
    main()

