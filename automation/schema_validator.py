"""
JSON schema validation for data files (time logs, costs, revenue).

Provides validation functions to ensure data files match expected schemas.
"""
import logging
from typing import List, Dict, Any, Optional


def validate_time_entry(entry: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate a time log entry against schema.
    
    Expected schema:
    {
        "timestamp": str (ISO format),
        "activity": str,
        "client_id": str | null,
        "duration_seconds": number,
        "time_saved_seconds": number,
        "metadata": dict (optional)
    }
    
    Returns:
        (is_valid, error_message)
    """
    if not isinstance(entry, dict):
        return False, "Entry must be a dictionary"
    
    # Required fields
    required = ["timestamp", "activity", "duration_seconds", "time_saved_seconds"]
    for field in required:
        if field not in entry:
            return False, f"Missing required field: {field}"
    
    # Validate types
    if not isinstance(entry["timestamp"], str):
        return False, "timestamp must be a string"
    
    if not isinstance(entry["activity"], str):
        return False, "activity must be a string"
    
    if entry["client_id"] is not None and not isinstance(entry["client_id"], str):
        return False, "client_id must be a string or null"
    
    if not isinstance(entry["duration_seconds"], (int, float)):
        return False, "duration_seconds must be a number"
    
    if not isinstance(entry["time_saved_seconds"], (int, float)):
        return False, "time_saved_seconds must be a number"
    
    # Optional metadata
    if "metadata" in entry and not isinstance(entry["metadata"], dict):
        return False, "metadata must be a dictionary"
    
    return True, None


def validate_api_cost_entry(entry: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate an API cost entry against schema.
    
    Expected schema:
    {
        "timestamp": str (ISO format),
        "provider": str,
        "model": str,
        "activity": str,
        "client_id": str | null,
        "input_tokens": number,
        "output_tokens": number,
        "cost_usd": number,
        "metadata": dict (optional)
    }
    
    Returns:
        (is_valid, error_message)
    """
    if not isinstance(entry, dict):
        return False, "Entry must be a dictionary"
    
    # Required fields
    required = ["timestamp", "provider", "model", "activity", "input_tokens", "output_tokens", "cost_usd"]
    for field in required:
        if field not in entry:
            return False, f"Missing required field: {field}"
    
    # Validate types
    if not isinstance(entry["timestamp"], str):
        return False, "timestamp must be a string"
    
    if not isinstance(entry["provider"], str):
        return False, "provider must be a string"
    
    if not isinstance(entry["model"], str):
        return False, "model must be a string"
    
    if not isinstance(entry["activity"], str):
        return False, "activity must be a string"
    
    if entry["client_id"] is not None and not isinstance(entry["client_id"], str):
        return False, "client_id must be a string or null"
    
    if not isinstance(entry["input_tokens"], int):
        return False, "input_tokens must be an integer"
    
    if not isinstance(entry["output_tokens"], int):
        return False, "output_tokens must be an integer"
    
    if not isinstance(entry["cost_usd"], (int, float)):
        return False, "cost_usd must be a number"
    
    # Optional metadata
    if "metadata" in entry and not isinstance(entry["metadata"], dict):
        return False, "metadata must be a dictionary"
    
    return True, None


def validate_hosting_cost_entry(entry: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate a hosting cost entry against schema.
    
    Expected schema:
    {
        "timestamp": str (ISO format),
        "client_id": str,
        "cost_usd": number,
        "type": "hosting"
    }
    
    Returns:
        (is_valid, error_message)
    """
    if not isinstance(entry, dict):
        return False, "Entry must be a dictionary"
    
    # Required fields
    required = ["timestamp", "client_id", "cost_usd", "type"]
    for field in required:
        if field not in entry:
            return False, f"Missing required field: {field}"
    
    # Validate types
    if not isinstance(entry["timestamp"], str):
        return False, "timestamp must be a string"
    
    if not isinstance(entry["client_id"], str):
        return False, "client_id must be a string"
    
    if not isinstance(entry["cost_usd"], (int, float)):
        return False, "cost_usd must be a number"
    
    if entry["type"] != "hosting":
        return False, "type must be 'hosting'"
    
    return True, None


def validate_revenue_entry(entry: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate a revenue entry against schema.
    
    Expected schema:
    {
        "timestamp": str (ISO format),
        "client_id": str | null,
        "type": str (e.g., "deposit", "final_payment", "hosting"),
        "amount_usd": number,
        "package": str (optional)
    }
    
    Returns:
        (is_valid, error_message)
    """
    if not isinstance(entry, dict):
        return False, "Entry must be a dictionary"
    
    # Required fields
    required = ["timestamp", "type", "amount_usd"]
    for field in required:
        if field not in entry:
            return False, f"Missing required field: {field}"
    
    # Validate types
    if not isinstance(entry["timestamp"], str):
        return False, "timestamp must be a string"
    
    if entry["client_id"] is not None and not isinstance(entry["client_id"], str):
        return False, "client_id must be a string or null"
    
    if not isinstance(entry["type"], str):
        return False, "type must be a string"
    
    if not isinstance(entry["amount_usd"], (int, float)):
        return False, "amount_usd must be a number"
    
    # Optional package field
    if "package" in entry and not isinstance(entry["package"], str):
        return False, "package must be a string"
    
    return True, None


def validate_time_logs(data: List[Dict[str, Any]]) -> tuple[bool, Optional[str], int]:
    """
    Validate an array of time log entries.
    
    Returns:
        (is_valid, error_message, invalid_count)
    """
    if not isinstance(data, list):
        return False, "Time logs must be an array", 0
    
    invalid_count = 0
    for i, entry in enumerate(data):
        is_valid, error = validate_time_entry(entry)
        if not is_valid:
            invalid_count += 1
            logging.warning(f"Invalid time entry at index {i}: {error}")
    
    if invalid_count > 0:
        return False, f"{invalid_count} invalid entries found", invalid_count
    
    return True, None, 0


def validate_cost_entries(data: List[Dict[str, Any]], entry_type: str = "api") -> tuple[bool, Optional[str], int]:
    """
    Validate an array of cost entries (API or hosting).
    
    Args:
        data: Array of cost entries
        entry_type: "api" or "hosting"
    
    Returns:
        (is_valid, error_message, invalid_count)
    """
    if not isinstance(data, list):
        return False, f"{entry_type} costs must be an array", 0
    
    invalid_count = 0
    validator = validate_api_cost_entry if entry_type == "api" else validate_hosting_cost_entry
    
    for i, entry in enumerate(data):
        is_valid, error = validator(entry)
        if not is_valid:
            invalid_count += 1
            logging.warning(f"Invalid {entry_type} cost entry at index {i}: {error}")
    
    if invalid_count > 0:
        return False, f"{invalid_count} invalid entries found", invalid_count
    
    return True, None, 0


def validate_revenue_entries(data: List[Dict[str, Any]]) -> tuple[bool, Optional[str], int]:
    """
    Validate an array of revenue entries.
    
    Returns:
        (is_valid, error_message, invalid_count)
    """
    if not isinstance(data, list):
        return False, "Revenue entries must be an array", 0
    
    invalid_count = 0
    for i, entry in enumerate(data):
        is_valid, error = validate_revenue_entry(entry)
        if not is_valid:
            invalid_count += 1
            logging.warning(f"Invalid revenue entry at index {i}: {error}")
    
    if invalid_count > 0:
        return False, f"{invalid_count} invalid entries found", invalid_count
    
    return True, None, 0

