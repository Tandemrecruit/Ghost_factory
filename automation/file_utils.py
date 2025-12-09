"""
File I/O utilities with atomic writes and error handling.
"""
import os
import tempfile
import logging
from pathlib import Path
from typing import Optional


def atomic_write(file_path: str, content: str, encoding: str = "utf-8") -> bool:
    """
    Write content to a file atomically using temp file + rename.
    
    This prevents corrupted files if the process crashes during write.
    
    Args:
        file_path: Path to the target file
        content: Content to write
        encoding: File encoding (default: utf-8)
        
    Returns:
        True if successful, False otherwise
    """
    target_path = Path(file_path)
    target_dir = target_path.parent
    
    # Ensure directory exists
    try:
        target_dir.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        logging.error(f"Failed to create directory {target_dir}: {e}")
        return False
    
    # Create temp file in same directory (required for atomic rename on Windows)
    try:
        # Use NamedTemporaryFile with delete=False so we can rename it
        with tempfile.NamedTemporaryFile(
            mode='w',
            encoding=encoding,
            dir=str(target_dir),
            delete=False,
            suffix='.tmp'
        ) as temp_file:
            temp_path = Path(temp_file.name)
            temp_file.write(content)
            temp_file.flush()
            os.fsync(temp_file.fileno())  # Ensure data is written to disk
        
        # Atomic rename (works on both Unix and Windows)
        try:
            os.replace(str(temp_path), str(target_path))
            return True
        except OSError as e:
            logging.error(f"Failed to rename temp file to {file_path}: {e}")
            # Clean up temp file
            try:
                temp_path.unlink()
            except OSError:
                pass
            return False
            
    except (OSError, IOError) as e:
        logging.error(f"Failed to write temp file for {file_path}: {e}")
        return False


def safe_read(file_path: str, encoding: str = "utf-8", default: Optional[str] = None) -> Optional[str]:
    """
    Safely read a file with proper error handling.
    
    Args:
        file_path: Path to the file
        encoding: File encoding (default: utf-8)
        default: Default value to return on error (default: None)
        
    Returns:
        File content or default value on error
    """
    try:
        with open(file_path, "r", encoding=encoding) as f:
            return f.read()
    except (OSError, IOError) as e:
        logging.warning(f"Failed to read {file_path}: {e}")
        return default
    except UnicodeDecodeError as e:
        logging.error(f"Encoding error reading {file_path}: {e}")
        return default

