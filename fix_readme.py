#!/usr/bin/env python3
import re

with open('README.md', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Fix corrupted box-drawing characters
content = re.sub(r'â"‚\s+â"€â"€\s+│\s+└──', '│   └──', content)
content = re.sub(r'â"‚\s+â"€â"€\s+', '│   └── ', content)
content = re.sub(r'â"€└──\s+└──', '└──', content)
content = re.sub(r'â"‚\s+â"œâ"€â"€', '│   ├──', content)
content = re.sub(r'â"œâ"€â"€', '├──', content)

with open('README.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed README.md")

