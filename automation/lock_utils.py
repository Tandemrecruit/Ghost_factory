"""
File locking utilities for preventing concurrent processing.

Uses lock files with timestamps to detect stale locks and prevent
multiple factory instances from processing the same client.
"""
import os
import time
import logging
from pathlib import Path
from typing import Optional
from contextlib import contextmanager


LOCK_TIMEOUT_SECONDS = 3600  # 1 hour - locks older than this are considered stale
LOCK_DIR = Path("data/locks")


def _ensure_lock_dir():
    """Ensure the lock directory exists."""
    LOCK_DIR.mkdir(parents=True, exist_ok=True)


def get_lock_path(client_id: str) -> Path:
    """Get the path to a lock file for a client."""
    _ensure_lock_dir()
    return LOCK_DIR / f"{client_id}.lock"


def is_locked(client_id: str) -> bool:
    """
    Check if a client is currently locked.
    
    Returns True if lock exists and is not stale, False otherwise.
    Stale locks (older than LOCK_TIMEOUT_SECONDS) are considered unlocked.
    
    Args:
        client_id: The client ID to check
        
    Returns:
        True if locked, False otherwise
    """
    lock_path = get_lock_path(client_id)
    if not lock_path.exists():
        return False
    
    try:
        # Read timestamp from lock file
        with lock_path.open("r") as f:
            timestamp_str = f.read().strip()
            if not timestamp_str:
                # Empty lock file - consider it stale
                return False
            timestamp = float(timestamp_str)
        
        # Check if lock is stale
        age = time.time() - timestamp
        if age > LOCK_TIMEOUT_SECONDS:
            logging.warning(f"⚠️ Stale lock detected for {client_id} (age: {age:.0f}s), removing")
            try:
                lock_path.unlink()
            except OSError:
                pass
            return False
        
        return True
    except (ValueError, OSError) as e:
        logging.warning(f"⚠️ Error reading lock file for {client_id}: {e}, considering unlocked")
        return False


def acquire_lock(client_id: str) -> bool:
    """
    Attempt to acquire a lock for a client.
    
    Args:
        client_id: The client ID to lock
        
    Returns:
        True if lock was acquired, False if already locked
    """
    if is_locked(client_id):
        return False
    
    lock_path = get_lock_path(client_id)
    try:
        # Write current timestamp to lock file
        with lock_path.open("w") as f:
            f.write(str(time.time()))
        return True
    except OSError as e:
        logging.error(f"❌ Failed to create lock file for {client_id}: {e}")
        return False


def release_lock(client_id: str) -> None:
    """
    Release a lock for a client.
    
    Args:
        client_id: The client ID to unlock
    """
    lock_path = get_lock_path(client_id)
    try:
        if lock_path.exists():
            lock_path.unlink()
    except OSError as e:
        logging.warning(f"⚠️ Failed to remove lock file for {client_id}: {e}")


@contextmanager
def client_lock(client_id: str):
    """
    Context manager for acquiring and releasing a client lock.
    
    Usage:
        with client_lock("my-client"):
            # Process client
            pass
    
    Args:
        client_id: The client ID to lock
        
    Raises:
        RuntimeError: If lock cannot be acquired
    """
    if not acquire_lock(client_id):
        raise RuntimeError(f"Could not acquire lock for client: {client_id}")
    
    try:
        yield
    finally:
        release_lock(client_id)

