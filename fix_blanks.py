#!/usr/bin/env python3
"""
Collapse extra blank lines in Markdown files and remove empty lines between
adjacent list items. Does not touch other file types.
"""

import os
import re
from typing import List

ROOT = "."
TARGET_EXTS = (".md",)


def is_list_item(line: str) -> bool:
    """Detect markdown list items."""
    return bool(re.match(r"\s*(?:[-*+]|[0-9]+\.)\s", line))


def clean_lines(lines: List[str]) -> List[str]:
    """Collapse multiple blanks and remove blanks between list items."""
    cleaned: List[str] = []
    prev_blank = False

    for idx, line in enumerate(lines):
        is_blank = line.strip() == ""
        next_line = lines[idx + 1] if idx + 1 < len(lines) else None

        if is_blank:
            prev_line = cleaned[-1] if cleaned else ""
            # Drop blank lines between consecutive list items
            if is_list_item(prev_line) and next_line is not None and is_list_item(next_line):
                continue
            # Collapse consecutive blank lines to a single blank
            if prev_blank:
                continue
            prev_blank = True
            cleaned.append("")
        else:
            prev_blank = False
            cleaned.append(line)

    return cleaned


def process_file(path: str) -> bool:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    lines = content.splitlines()
    cleaned = clean_lines(lines)

    # Preserve trailing newline if it existed
    new_content = "\n".join(cleaned)
    if content.endswith("\n"):
        new_content += "\n"

    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    return False


def main():
    changed = 0
    for root, _, files in os.walk(ROOT):
        for fname in files:
            if not fname.lower().endswith(TARGET_EXTS):
                continue
            path = os.path.join(root, fname)
            if process_file(path):
                changed += 1
                print(f"fixed: {path}")
    print(f"\nTotal files changed: {changed}")


if __name__ == "__main__":
    main()

