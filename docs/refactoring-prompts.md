# Ghost Factory Refactoring Prompts

Use these prompts sequentially with Claude Code (Sonnet 4.5 or Haiku 4.5).
Each task is scoped to be completable in one session.

---

## Phase 1: Critical Security & Infrastructure

### Task 1.1: Fix Authentication (HIGH PRIORITY)

```
Fix the authentication system in lib/auth-utils.ts:

1. REMOVE the fallback that allows all access when DASHBOARD_SECRET is not set
2. Instead, return 401 Unauthorized if no secret is configured in production
3. Add a check for NODE_ENV - only allow open access in development mode (NODE_ENV === 'development')
4. Remove the same-origin check (it's bypassable via spoofed headers)
5. Add a simple in-memory rate limiter:
   - Track requests by IP (use x-forwarded-for header or request IP)
   - Limit to 100 requests per minute per IP
   - Return 429 Too Many Requests when exceeded

Keep the Bearer token and X-API-Key checks. Add tests for the new behavior.
```

### Task 1.2: Add SQLite Database

```
Replace the file-based JSON storage with SQLite:

1. Install better-sqlite3 (npm install better-sqlite3 @types/better-sqlite3)

2. Create lib/db.ts with:
   - Database initialization function
   - Tables: time_entries, api_costs, hosting_costs, revenue_entries
   - Schema should match the existing TypeScript interfaces in lib/schema-validator.ts
   - Add created_at and updated_at timestamps
   - Create indexes on timestamp and client_id columns

3. Create lib/db-queries.ts with functions:
   - insertTimeEntry(entry: TimeEntry)
   - insertApiCost(entry: ApiCostEntry)
   - insertHostingCost(entry: HostingCostEntry)
   - insertRevenue(entry: RevenueEntry)
   - getTimeEntriesByMonth(month: string): TimeEntry[]
   - getCostsByMonth(month: string): { api: ApiCostEntry[], hosting: HostingCostEntry[] }
   - getRevenueByMonth(month: string): RevenueEntry[]

4. Update app/api/dashboard/stats/route.ts to use the new database queries instead of reading JSON files

5. Create a migration script (scripts/migrate-json-to-sqlite.ts) that reads existing JSON files from data/ and inserts them into SQLite

Keep the JSON files as backup but use SQLite as primary storage.
```

### Task 1.3: Add Request Logging Middleware

```
Add request/response logging for API routes:

1. Create lib/request-logger.ts with:
   - A function that logs: timestamp, method, path, status code, duration_ms, client IP
   - Log to both console and a file (logs/api-requests.log)
   - Use JSON format for easy parsing

2. Create a wrapper function for API route handlers:

   export function withLogging(handler: (req: Request) => Promise<Response>) {
     return async (req: Request) => {
       const start = Date.now();
       // ... log request, call handler, log response
     }
   }

3. Update all routes in app/api/dashboard/ to use this wrapper

4. Add logs/ to .gitignore
```

---

## Phase 2: Break Up factory.py

### Task 2.1: Extract Git Operations

```
Extract git operations from automation/factory.py into a new module:

1. Create automation/services/git_service.py

2. Move these functions from factory.py:
   - git_pull()
   - git_commit_and_push(client_id)

3. Add proper error handling and return types:
   - git_pull() -> Tuple[bool, Optional[str]]  # (success, error_message)
   - git_commit_and_push(client_id) -> Tuple[bool, Optional[str]]

4. Add retry logic with exponential backoff (3 retries, 2s/4s/8s delays)

5. Update factory.py to import from automation.services.git_service

6. Add unit tests in tests/test_git_service.py
```

### Task 2.2: Extract Discord Notifications

```
Extract Discord notifications from automation/factory.py:

1. Create automation/services/discord_service.py

2. Move send_discord_alert() from factory.py

3. Improve the function:
   - Add type hints for all parameters
   - Add retry logic (2 retries with 1s delay)
   - Create an enum for status types: SUCCESS, QA_FAILED, WARNING, ERROR
   - Add a queue mechanism so notifications don't block the pipeline

4. Update factory.py to import from automation.services.discord_service

5. Add unit tests in tests/test_discord_service.py
```

### Task 2.3: Extract Syntax Checker

```
Extract the TypeScript syntax checker from automation/factory.py:

1. Create automation/services/syntax_checker.py

2. Move check_syntax() function from factory.py

3. Improve the function:
   - Add caching: if code hash matches a recently-checked hash, skip recheck
   - Add timeout parameter (default 30s)
   - Return a dataclass instead of tuple:

     @dataclass
     class SyntaxResult:
         success: bool
         errors: List[str]
         warnings: List[str]

4. Update factory.py to import from automation.services.syntax_checker

5. Add unit tests in tests/test_syntax_checker.py
```

### Task 2.4: Extract Pipeline Stages

```
Extract pipeline stages from automation/factory.py into separate modules:

1. Create automation/pipeline/ directory with __init__.py

2. Create automation/pipeline/architect.py:
   - Move run_architect() function
   - Move run_visual_designer() function

3. Create automation/pipeline/copywriter.py:
   - Move run_copywriter() function

4. Create automation/pipeline/builder.py:
   - Move run_builder() function
   - Move related constants (MAX_SYNTAX_RETRIES, etc.)

5. Create automation/pipeline/qa.py:
   - Move run_qa() function
   - Move finalize_client() function

6. Update factory.py to:
   - Import from the new pipeline modules
   - Keep only the main loop and orchestration logic
   - Should be under 200 lines after extraction

7. Update all tests to use new import paths
```

---

## Phase 3: Replace Manual Validation with Zod

### Task 3.1: Add Zod Schemas

```
Replace manual validation in lib/schema-validator.ts with Zod:

1. Install Zod: npm install zod

2. Rewrite lib/schema-validator.ts:

   import { z } from 'zod';

   export const TimeEntrySchema = z.object({
     timestamp: z.string().datetime(),
     activity: z.string().min(1),
     client_id: z.string().nullable().optional(),
     duration_seconds: z.number().nonnegative(),
     time_saved_seconds: z.number().optional(),
     metadata: z.record(z.any()).optional(),
   });

   export const ApiCostEntrySchema = z.object({
     timestamp: z.string().datetime(),
     provider: z.string().min(1),
     model: z.string().min(1),
     activity: z.string().min(1),
     client_id: z.string().nullable().optional(),
     input_tokens: z.number().nonnegative(),
     output_tokens: z.number().nonnegative(),
     cost_usd: z.number().nonnegative(),
     metadata: z.record(z.any()).optional(),
   });

   // Add schemas for HostingCostEntry and RevenueEntry

3. Export type inference: export type TimeEntry = z.infer<typeof TimeEntrySchema>

4. Create validation functions that wrap Zod's safeParse:
   - validateTimeEntry(entry: unknown) -> { valid: boolean; error?: string; data?: TimeEntry }
   - validateTimeLogs(data: unknown[]) -> { valid: boolean; errors: string[]; data?: TimeEntry[] }

5. Update all imports in API routes to use new types

6. Run existing tests to ensure compatibility
```

### Task 3.2: Add Pydantic to Python

```
Add Pydantic validation to the Python automation code:

1. Add pydantic>=2.0 to requirements.txt

2. Create automation/schemas.py with Pydantic models:

   from pydantic import BaseModel, Field
   from typing import Optional, Dict, Any
   from datetime import datetime

   class TimeEntry(BaseModel):
       timestamp: datetime
       activity: str = Field(min_length=1)
       client_id: Optional[str] = None
       duration_seconds: float = Field(ge=0)
       time_saved_seconds: Optional[float] = None
       metadata: Optional[Dict[str, Any]] = None

   class ApiCostEntry(BaseModel):
       timestamp: datetime
       provider: str
       model: str
       activity: str
       client_id: Optional[str] = None
       input_tokens: int = Field(ge=0)
       output_tokens: int = Field(ge=0)
       cost_usd: float = Field(ge=0)
       metadata: Optional[Dict[str, Any]] = None

   # Add HostingCostEntry and RevenueEntry

3. Update automation/schema_validator.py to use Pydantic models

4. Update time_tracker.py and cost_tracker.py to validate entries before saving

5. Add tests for the new schemas
```

---

## Phase 4: Configuration & CI/CD

### Task 4.1: Centralize Configuration

```
Create a centralized configuration system:

1. Create automation/config.py:

   import os
   from dataclasses import dataclass
   from typing import Optional

   @dataclass
   class FactoryConfig:
       watch_dir: str = "./clients"
       library_path: str = "./design-system/manifest.md"
       prompts_dir: str = "./prompts"
       batch_interval: int = 3600
       max_critic_retries: int = 3
       max_syntax_retries: int = 3
       max_visual_repair_retries: int = 3

       # Model configuration
       model_strategy: str = "claude-opus-4-5-20251101"
       model_coder: str = "claude-sonnet-4-5-20250929"
       model_copy: str = "claude-sonnet-4-5-20250929"
       model_qa: str = "claude-haiku-4-5-20251015"
       model_router: str = "claude-haiku-4-5-20251015"
       model_critic: str = "claude-sonnet-4-5-20250929"

       @classmethod
       def from_env(cls) -> "FactoryConfig":
           return cls(
               watch_dir=os.getenv("FACTORY_WATCH_DIR", "./clients"),
               # ... load all from environment with defaults
           )

   # Global config instance
   config = FactoryConfig.from_env()

2. Update factory.py to use config.watch_dir, config.model_strategy, etc.

3. Create a .env.example with all configurable options documented

4. Add a config validation function that runs at startup
```

### Task 4.2: Add GitHub Actions CI

```
Create a GitHub Actions workflow for CI:

1. Create .github/workflows/ci.yml:

   name: CI

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     test-python:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-python@v5
           with:
             python-version: '3.11'
         - run: pip install -r requirements.txt -r requirements-test.txt
         - run: pytest --cov=automation --cov-report=xml
         - uses: codecov/codecov-action@v3

     test-typescript:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
         - run: npm ci
         - run: npm run lint
         - run: npm run build

     security:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - run: pip install bandit safety
         - run: bandit -r automation/ -ll
         - run: safety check -r requirements.txt

2. Create .github/workflows/deploy.yml for deployment (placeholder)

3. Add status badges to README.md
```

### Task 4.3: Add Pre-commit Hooks

```
Add pre-commit hooks for code quality:

1. Create .pre-commit-config.yaml:

   repos:
     - repo: https://github.com/pre-commit/pre-commit-hooks
       rev: v4.5.0
       hooks:
         - id: trailing-whitespace
         - id: end-of-file-fixer
         - id: check-yaml
         - id: check-json
         - id: check-added-large-files

     - repo: https://github.com/psf/black
       rev: 24.3.0
       hooks:
         - id: black
           language_version: python3.11

     - repo: https://github.com/pycqa/isort
       rev: 5.13.2
       hooks:
         - id: isort

     - repo: https://github.com/pycqa/flake8
       rev: 7.0.0
       hooks:
         - id: flake8
           args: [--max-line-length=120]

2. Add to requirements-dev.txt: pre-commit>=3.6.0

3. Update README.md with setup instructions:
   pip install pre-commit
   pre-commit install

4. Run pre-commit on all files and fix any issues:
   pre-commit run --all-files
```

---

## Phase 5: Prompt Injection Protection

### Task 5.1: Sanitize AI Inputs

```
Add protection against prompt injection in the AI pipeline:

1. Create automation/security/prompt_sanitizer.py:

   import re
   from typing import Tuple

   # Patterns that could indicate prompt injection
   SUSPICIOUS_PATTERNS = [
       r'ignore\s+(previous|above|all)\s+instructions',
       r'disregard\s+(previous|above|all)',
       r'forget\s+(everything|what|your)',
       r'you\s+are\s+now',
       r'new\s+instructions?:',
       r'system\s*:\s*',
       r'\[INST\]',
       r'<\|.*?\|>',
   ]

   def check_for_injection(text: str) -> Tuple[bool, list[str]]:
       """Check text for potential prompt injection patterns."""
       found = []
       text_lower = text.lower()
       for pattern in SUSPICIOUS_PATTERNS:
           if re.search(pattern, text_lower):
               found.append(pattern)
       return len(found) > 0, found

   def sanitize_user_content(content: str, max_length: int = 50000) -> str:
       """Sanitize user-provided content before passing to AI."""
       # Truncate extremely long inputs
       if len(content) > max_length:
           content = content[:max_length] + "\n[Content truncated]"

       # Escape any markdown code blocks that might confuse the model
       content = content.replace("```", "'''")

       return content

2. Update factory.py to use sanitize_user_content() before passing intake content to AI:
   - In select_niche_persona()
   - In run_architect()
   - In run_copywriter()
   - In run_builder()

3. Add logging when suspicious patterns are detected (but don't block - just warn)

4. Add tests for the sanitizer
```

---

## Execution Order

Run these prompts in this order for best results:

1. **Task 1.1** - Fix auth (15 min)
2. **Task 2.1** - Extract git service (20 min)
3. **Task 2.2** - Extract discord service (15 min)
4. **Task 2.3** - Extract syntax checker (15 min)
5. **Task 2.4** - Extract pipeline stages (30 min)
6. **Task 3.1** - Add Zod schemas (20 min)
7. **Task 4.1** - Centralize config (20 min)
8. **Task 4.2** - Add GitHub Actions (15 min)
9. **Task 1.2** - Add SQLite (45 min) - do after other refactoring
10. **Task 3.2** - Add Pydantic (25 min)
11. **Task 5.1** - Prompt injection protection (20 min)
12. **Task 1.3** - Request logging (15 min)
13. **Task 4.3** - Pre-commit hooks (10 min)

Total estimated time: ~4-5 hours of Claude Code work

---

## Tips for Best Results

1. **Run tests after each task**: `pytest` and `npm run build`
2. **Commit after each task**: Keep changes atomic
3. **If a task fails**: Ask Claude to fix the specific error rather than re-running the whole prompt
4. **For Haiku**: Use Tasks 1.1, 1.3, 2.1-2.3, 4.2, 4.3 (simpler tasks)
5. **For Sonnet**: Use Tasks 1.2, 2.4, 3.1, 3.2, 5.1 (more complex tasks)
