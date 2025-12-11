"""
Memory Module for Self-Correcting Factory Pipeline

This module provides long-term learning capabilities by:
1. Recording errors and their fixes to a persistent log
2. Compiling rules from error patterns to improve future generations
3. Injecting learned wisdom into builder prompts
4. Providing golden reference samples for few-shot learning
"""

import json
import os
import random
import re
import logging
import unicodedata
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple

# Paths for memory storage
DATA_MEMORY_DIR = "./data/memory"
RAW_ERRORS_PATH = os.path.join(DATA_MEMORY_DIR, "raw_errors.json")
DYNAMIC_RULES_PATH = "./design-system/dynamic_rules.md"
GOLDEN_SAMPLES_DIR = "./automation/memory/golden_samples"

# Ensure directories exist on module load
os.makedirs(DATA_MEMORY_DIR, exist_ok=True)
os.makedirs(GOLDEN_SAMPLES_DIR, exist_ok=True)


def _format_syntax_errors_human_readable(error_output: str) -> str:
    """
    Parse TypeScript error output and format it in a human-readable way for terminal display.
    
    Extracts key information: file, line numbers, error types, and messages.
    Returns a concise summary suitable for terminal output.
    
    Parameters:
        error_output: Raw TypeScript compiler error output
        
    Returns:
        str: Human-readable error summary
    """
    if not error_output:
        return "Unknown syntax error"
    
    # Remove "TypeScript compilation failed: " prefix if present
    if error_output.startswith("TypeScript compilation failed: "):
        error_output = error_output[len("TypeScript compilation failed: "):]
    
    # Parse errors: format is typically "file.tsx(line,col): error TS####: message"
    error_pattern = r'(\S+)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+([^\n]+)'
    matches = re.findall(error_pattern, error_output)
    
    if not matches:
        # Fallback: try to extract at least the first error line
        first_line = error_output.split('\n')[0].strip()
        if 'error TS' in first_line:
            # Extract error code if present
            ts_match = re.search(r'error (TS\d+)', first_line)
            error_code = ts_match.group(1) if ts_match else "error"
            return f"syntax error: {error_code}"
        return "syntax error (see logs for details)"
    
    # Group errors by file and line
    errors_by_file = {}
    for file, line, col, code, message in matches:
        if file not in errors_by_file:
            errors_by_file[file] = []
        errors_by_file[file].append({
            'line': int(line),
            'col': int(col),
            'code': code,
            'message': message.strip()
        })
    
    # Build human-readable summary
    parts = []
    total_errors = len(matches)
    
    for file, errors in errors_by_file.items():
        # Group by line number
        lines_with_errors = {}
        for err in errors:
            line_num = err['line']
            if line_num not in lines_with_errors:
                lines_with_errors[line_num] = []
            lines_with_errors[line_num].append(err)
        
        # Format: "3 errors in page.tsx (line 126: missing comma, line 127: unexpected token)"
        line_summaries = []
        for line_num in sorted(lines_with_errors.keys())[:3]:  # Show max 3 lines
            errs = lines_with_errors[line_num]
            # Get the first error message, simplified
            first_msg = errs[0]['message']
            # Simplify common error messages
            if first_msg.startswith("',' expected"):
                msg = "missing comma"
            elif first_msg.startswith("':' expected"):
                msg = "missing colon"
            elif first_msg.startswith("';' expected"):
                msg = "missing semicolon"
            elif first_msg.startswith("'}' expected"):
                msg = "missing closing brace"
            elif first_msg.startswith("')' expected"):
                msg = "missing closing parenthesis"
            elif first_msg.startswith("Identifier expected"):
                msg = "invalid identifier"
            elif first_msg.startswith("Unterminated string literal"):
                msg = "unclosed string"
            elif first_msg.startswith("Unterminated template literal"):
                msg = "unclosed template"
            elif "Cannot find module" in first_msg:
                msg = "module not found"
            else:
                # Truncate long messages
                msg = first_msg[:40] + "..." if len(first_msg) > 40 else first_msg
            
            line_summaries.append(f"line {line_num}: {msg}")
        
        if len(lines_with_errors) > 3:
            line_summaries.append(f"... and {len(lines_with_errors) - 3} more lines")
        
        file_summary = f"{len(matches)} error{'s' if len(matches) > 1 else ''} in {file}"
        if line_summaries:
            file_summary += f" ({', '.join(line_summaries)})"
        parts.append(file_summary)
    
    return " | ".join(parts) if parts else f"{total_errors} syntax error(s)"


def _log_memory(level: str, emoji: str, label: str, message: str):
    """
    Log a message with aligned header formatting (matches factory._log_aligned format).
    
    This is a local helper to avoid circular imports with factory.py.
    
    Args:
        level: Log level ('info', 'warning', 'error', 'debug')
        emoji: Emoji icon for the log message
        label: Fixed-width label (padded to 20 chars)
        message: The actual log message content
    """
    # Normalize emoji spacing (strip trailing spaces)
    emoji_clean = emoji.strip()
    
    # Ensure consistent visual spacing by using unicodedata to check width.
    # Target width is 4 cells (emoji + spaces).
    try:
        width = 2 if unicodedata.east_asian_width(emoji_clean[0]) in ('W', 'F') else 1
    except IndexError:
        width = 1
    
    padding = 4 - width
    emoji_column = f"{emoji_clean}{' ' * padding}"
    
    # Pad label to 20 characters for consistent alignment
    padded_label = f"{label:<20}"
    
    # Format: emoji_column (4 chars) + label (20 chars) + space + message
    formatted_message = f"{emoji_column}{padded_label} {message}"
    
    log_func = getattr(logging, level.lower(), logging.info)
    log_func(formatted_message)


def record_failure(category: str, issue: str, fix: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
    """
    Append an error record to the raw_errors.json log.

    Parameters:
        category: Error category (e.g., "syntax", "visual", "a11y", "qa")
        issue: Description of the problem that occurred
        fix: Description of how the problem was resolved
        metadata: Optional additional context (client_id, attempt, etc.)

    Returns:
        bool: True if successfully recorded, False on error
    """
    try:
        # Load existing errors or create empty list
        errors = []
        if os.path.exists(RAW_ERRORS_PATH):
            with open(RAW_ERRORS_PATH, "r", encoding="utf-8") as f:
                try:
                    errors = json.load(f)
                except json.JSONDecodeError as e:
                    logging.warning(f"Corrupted raw_errors.json at {RAW_ERRORS_PATH}: {e}, starting fresh")
                    errors = []

        # Create error record
        error_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "category": category,
            "issue": issue,
            "fix": fix,
            "metadata": metadata or {}
        }

        errors.append(error_record)

        # Save back to file
        with open(RAW_ERRORS_PATH, "w", encoding="utf-8") as f:
            json.dump(errors, f, indent=2)

        # Format issue for terminal display
        # If it's a syntax error with TypeScript compilation output, format it human-readably
        if category == "syntax" and issue.startswith("TypeScript compilation failed: "):
            issue_preview = _format_syntax_errors_human_readable(issue)
        else:
            # Truncate issue for readability, but keep more context than before
            issue_preview = issue[:80] + "..." if len(issue) > 80 else issue
        
        _log_memory("info", "🧠", "Memory", f"Recorded {category} failure | {issue_preview}")
        return True

    except Exception:
        logging.exception("[Memory] Failed to record error")
        return False


def _compile_rules(logs: List[Dict[str, Any]], top_n: int = 5) -> str:
    """
    Analyze raw error logs and generate a markdown list of top avoidable mistakes.

    Groups errors by category, counts frequency, and generates actionable rules.

    Parameters:
        logs: List of error records from raw_errors.json
        top_n: Number of top rules to generate (default 5)

    Returns:
        str: Markdown formatted rules list
    """
    if not logs:
        return "# Dynamic Rules\n\n*No errors recorded yet. The system is learning.*\n"

    # Count errors by category and track unique issues
    category_counts: Dict[str, int] = {}
    category_issues: Dict[str, List[Dict[str, str]]] = {}

    for log in logs:
        cat = log.get("category", "unknown")
        category_counts[cat] = category_counts.get(cat, 0) + 1

        if cat not in category_issues:
            category_issues[cat] = []

        # Only keep unique issues (by issue text)
        issue_text = log.get("issue", "")
        fix_text = log.get("fix", "")

        # Check if this exact issue already exists
        existing_issues = [i["issue"] for i in category_issues[cat]]
        if issue_text not in existing_issues:
            category_issues[cat].append({
                "issue": issue_text,
                "fix": fix_text
            })

    # Sort categories by frequency
    sorted_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)

    # Build markdown rules
    rules_md = "# Dynamic Rules - Top Avoidable Mistakes\n\n"
    rules_md += f"*Auto-generated from {len(logs)} recorded errors. Last updated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}*\n\n"

    rule_count = 0
    for category, count in sorted_categories:
        if rule_count >= top_n:
            break

        issues = category_issues.get(category, [])
        if not issues:
            continue

        # Get the most recent/representative issue for this category
        representative = issues[0]

        rule_count += 1
        rules_md += f"## Rule {rule_count}: Avoid {category.title()} Errors ({count} occurrences)\n\n"
        rules_md += f"**Common Problem:** {representative['issue']}\n\n"
        if representative['fix']:
            rules_md += f"**Prevention:** {representative['fix']}\n\n"
        rules_md += "---\n\n"

    return rules_md


def compile_and_save_rules() -> bool:
    """
    Read raw_errors.json, compile rules, and save to dynamic_rules.md.

    Returns:
        bool: True if successful, False on error
    """
    try:
        # Load existing errors
        logs = []
        if os.path.exists(RAW_ERRORS_PATH):
            with open(RAW_ERRORS_PATH, "r", encoding="utf-8") as f:
                try:
                    logs = json.load(f)
                except json.JSONDecodeError:
                    logs = []

        # Compile rules
        rules_md = _compile_rules(logs)

        # Ensure design-system directory exists
        os.makedirs(os.path.dirname(DYNAMIC_RULES_PATH), exist_ok=True)

        # Save rules
        with open(DYNAMIC_RULES_PATH, "w", encoding="utf-8") as f:
            f.write(rules_md)

        _log_memory("info", "🧠", "Memory", f"Compiled rules from {len(logs)} errors | {DYNAMIC_RULES_PATH}")
        return True

    except Exception:
        logging.exception("[Memory] Failed to compile rules")
        return False


def get_memory_prompt() -> str:
    """
    Read dynamic_rules.md and return content for injection into Builder prompts.

    If the file doesn't exist or is empty, returns an empty string.

    Returns:
        str: Content of dynamic_rules.md or empty string
    """
    try:
        if not os.path.exists(DYNAMIC_RULES_PATH):
            # Try to compile rules if we have error logs
            if os.path.exists(RAW_ERRORS_PATH):
                compile_and_save_rules()

        if os.path.exists(DYNAMIC_RULES_PATH):
            with open(DYNAMIC_RULES_PATH, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    return f"""
## LEARNED RULES (from previous mistakes - MUST FOLLOW)

{content}

---
"""
        return ""

    except Exception as e:
        logging.warning(f"[Memory] Failed to load memory prompt: {e}")
        return ""


def get_golden_reference() -> Tuple[str, str]:
    """
    Read a random file from golden_samples directory for few-shot learning.

    Returns:
        Tuple[str, str]: (filename, content) if a sample exists, ("", "") otherwise
    """
    try:
        if not os.path.exists(GOLDEN_SAMPLES_DIR):
            os.makedirs(GOLDEN_SAMPLES_DIR, exist_ok=True)
            return ("", "")

        # Get list of files in golden samples directory
        samples = [f for f in os.listdir(GOLDEN_SAMPLES_DIR)
                   if os.path.isfile(os.path.join(GOLDEN_SAMPLES_DIR, f))
                   and f.endswith(('.tsx', '.ts', '.jsx', '.js'))]

        if not samples:
            return ("", "")

        # Pick a random sample
        sample_file = random.choice(samples)
        sample_path = os.path.join(GOLDEN_SAMPLES_DIR, sample_file)

        with open(sample_path, "r", encoding="utf-8") as f:
            content = f.read()

        _log_memory("info", "🧠", "Memory", f"Loaded golden reference | {sample_file}")
        return (sample_file, content)

    except Exception as e:
        logging.warning(f"[Memory] Failed to load golden reference: {e}")
        return ("", "")


def get_golden_reference_prompt() -> str:
    """
    Format the golden reference as a prompt section for the Builder.

    Returns:
        str: Formatted prompt section with golden sample, or empty string
    """
    filename, content = get_golden_reference()

    if not content:
        return ""

    return f"""
## GOLDEN REFERENCE (Example of Good Code)

The following is an example of a well-structured, high-quality page.tsx file.
Use it as a reference for style, structure, and patterns.

**File:** `{filename}`

```tsx
{content}
```

---
"""


def add_golden_sample(filename: str, content: str) -> bool:
    """
    Add a new golden sample to the golden_samples directory.

    Parameters:
        filename: Name of the sample file (e.g., "excellent_saas_page.tsx")
        content: The code content to save

    Returns:
        bool: True if successfully saved, False on error
    """
    try:
        os.makedirs(GOLDEN_SAMPLES_DIR, exist_ok=True)

        sample_path = os.path.join(GOLDEN_SAMPLES_DIR, filename)
        with open(sample_path, "w", encoding="utf-8") as f:
            f.write(content)

        _log_memory("info", "🧠", "Memory", f"Added golden sample | {filename}")
        return True

    except Exception:
        logging.exception("[Memory] Failed to add golden sample")
        return False


def get_error_stats() -> Dict[str, Any]:
    """
    Get statistics about recorded errors.

    Returns:
        dict: Statistics including total count, by category, and recent errors
    """
    try:
        if not os.path.exists(RAW_ERRORS_PATH):
            return {"total": 0, "by_category": {}, "recent": []}

        with open(RAW_ERRORS_PATH, "r", encoding="utf-8") as f:
            logs = json.load(f)

        # Count by category
        by_category: Dict[str, int] = {}
        for log in logs:
            cat = log.get("category", "unknown")
            by_category[cat] = by_category.get(cat, 0) + 1

        # Get 5 most recent
        recent = logs[-5:] if len(logs) >= 5 else logs

        return {
            "total": len(logs),
            "by_category": by_category,
            "recent": recent
        }

    except Exception as e:
        logging.exception("[Memory] Failed to get error stats")
        return {"total": 0, "by_category": {}, "recent": [], "error": str(e)}


def clear_old_errors(keep_last_n: int = 100) -> int:
    """
    Trim old errors to prevent unbounded growth.

    Parameters:
        keep_last_n: Number of recent errors to keep

    Returns:
        int: Number of errors removed
    """
    try:
        if not os.path.exists(RAW_ERRORS_PATH):
            return 0

        with open(RAW_ERRORS_PATH, "r", encoding="utf-8") as f:
            logs = json.load(f)

        if len(logs) <= keep_last_n:
            return 0

        removed_count = len(logs) - keep_last_n
        logs = logs[-keep_last_n:]

        with open(RAW_ERRORS_PATH, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=2)

        logging.info(f"[Memory] Cleared {removed_count} old errors, kept {keep_last_n}")
        return removed_count

    except Exception:
        logging.exception("[Memory] Failed to clear old errors")
        return 0
