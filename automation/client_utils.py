"""
Client ID validation and sanitization utilities.

Prevents path traversal attacks and filesystem issues by validating
client IDs before use in file paths.
"""
import re
import logging
from typing import Optional


# Pattern: alphanumeric, hyphens, underscores only
# Must not be empty, must not start/end with hyphen/underscore
# Windows invalid chars: < > : " | ? * \
# Unix path separators: / \
CLIENT_ID_PATTERN = re.compile(r'^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$')


def is_valid_client_id(client_id: str) -> bool:
    """
    Validate that a client ID is safe for use in file paths.
    
    Rules:
    - Only alphanumeric characters, hyphens, and underscores
    - Cannot start or end with hyphen/underscore (except single char)
    - Cannot contain path separators (/, \\)
    - Cannot contain Windows invalid chars (< > : " | ? *)
    - Must be non-empty
    
    Args:
        client_id: The client ID to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not client_id or not isinstance(client_id, str):
        return False
    
    # Check for path separators and invalid characters
    invalid_chars = ['/', '\\', '<', '>', ':', '"', '|', '?', '*']
    if any(char in client_id for char in invalid_chars):
        return False
    
    # Check for path traversal patterns
    if '..' in client_id:
        return False
    
    # Match against safe pattern
    if not CLIENT_ID_PATTERN.match(client_id):
        return False
    
    return True


def sanitize_client_id(client_id: str) -> Optional[str]:
    """
    Sanitize a client ID, returning None if invalid.
    
    This function validates and returns the client ID if safe,
    or None if it contains dangerous characters.
    
    Args:
        client_id: The client ID to sanitize
        
    Returns:
        Sanitized client ID if valid, None otherwise
    """
    if not is_valid_client_id(client_id):
        logging.warning(f"Invalid client ID rejected: {client_id}")
        return None
    return client_id


def validate_client_id_or_raise(client_id: str, context: str = "") -> str:
    """
    Validate client ID and raise ValueError if invalid.
    
    Args:
        client_id: The client ID to validate
        context: Optional context string for error message
        
    Returns:
        The validated client ID
        
    Raises:
        ValueError: If client ID is invalid
    """
    if not is_valid_client_id(client_id):
        msg = f"Invalid client ID: {client_id}"
        if context:
            msg += f" (context: {context})"
        raise ValueError(msg)
    return client_id

