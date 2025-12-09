# Test Suite for Ghost Factory

Comprehensive unit tests for the Ghost Factory automation pipeline, focusing on new and modified functionality in the current branch.

## What's Tested

### New Features
1. **run_visual_designer** - NEW parallel agent for theme generation
2. **run_copywriter** - NEW function with Copy Critic loop
3. **Parallel Execution** - NEW in run_architect

### Modified Features
4. **select_niche_persona** - Updated niche mappings (webinar_funnel)
5. **run_architect** - Enhanced with parallel execution
6. **run_builder** - Enhanced with theme support

## Running Tests

### Install dependencies
```bash
pip install -r requirements-test.txt
```

### Run all tests
```bash
pytest
```

### Run with coverage
```bash
pytest --cov=automation --cov-report=html
```

## Test Coverage

| Function | Tests | Focus |
|----------|-------|-------|
| select_niche_persona | 13 | New niches, edge cases |
| run_visual_designer | 9 | Theme creation, parsing |
| run_architect | 9 | Parallel exec, critic loop |
| run_copywriter | 9 | Critic loop, retries |
| run_builder | 5 | Theme loading |
| Edge cases | 3 | Unicode, empty files |
| Prompt validation | 4 | File checks |

**Total: 60+ tests**

## Quick Start

```bash
# Install dependencies
pip install -r requirements-test.txt

# Run tests
pytest

# With coverage
pytest --cov=automation --cov-report=html --cov-report=term

# Run specific test
pytest tests/test_factory.py::TestRunVisualDesigner -v
```

## Test Structure

- All external APIs are mocked
- Uses temp directories for file operations
- Tests cover happy paths, edge cases, and errors
- Verifies retry logic and parallel execution