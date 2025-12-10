"""
Unit tests for automation/memory.py

Tests the new Evolutionary Memory module including:
- Error recording and persistence
- Rule compilation from error logs
- Golden reference loading
- Memory prompt generation
"""

import pytest
import json
import os
import tempfile
import shutil
from unittest.mock import patch, mock_open

from automation import memory


class TestRecordFailure:
    """Test suite for record_failure function"""

    @pytest.fixture
    def temp_dir(self):
        """Create temporary directory for test files"""
        temp = tempfile.mkdtemp()
        yield temp
        shutil.rmtree(temp)

    def test_records_basic_failure(self, temp_dir):
        """Test recording a basic failure"""
        with patch.object(memory, 'RAW_ERRORS_PATH', os.path.join(temp_dir, 'raw_errors.json')):
            with patch.object(memory, 'DATA_MEMORY_DIR', temp_dir):
                result = memory.record_failure(
                    category="syntax",
                    issue="Missing semicolon",
                    fix="Added semicolon"
                )

                assert result is True

                # Verify file was created
                with open(os.path.join(temp_dir, 'raw_errors.json')) as f:
                    errors = json.load(f)

                assert len(errors) == 1
                assert errors[0]["category"] == "syntax"
                assert errors[0]["issue"] == "Missing semicolon"
                assert errors[0]["fix"] == "Added semicolon"

    def test_records_with_metadata(self, temp_dir):
        """Test recording failure with metadata"""
        with patch.object(memory, 'RAW_ERRORS_PATH', os.path.join(temp_dir, 'raw_errors.json')):
            with patch.object(memory, 'DATA_MEMORY_DIR', temp_dir):
                metadata = {"client_id": "test123", "attempt": 2}
                result = memory.record_failure(
                    category="visual",
                    issue="Broken layout",
                    fix="Fixed flexbox",
                    metadata=metadata
                )

                assert result is True

                with open(os.path.join(temp_dir, 'raw_errors.json')) as f:
                    errors = json.load(f)

                assert errors[0]["metadata"]["client_id"] == "test123"
                assert errors[0]["metadata"]["attempt"] == 2

    def test_appends_to_existing_errors(self, temp_dir):
        """Test that new errors are appended to existing log"""
        errors_path = os.path.join(temp_dir, 'raw_errors.json')

        # Create initial error
        with open(errors_path, 'w') as f:
            json.dump([{"category": "a11y", "issue": "Old error", "fix": "Old fix", "metadata": {}, "timestamp": "2024-01-01"}], f)

        with patch.object(memory, 'RAW_ERRORS_PATH', errors_path):
            with patch.object(memory, 'DATA_MEMORY_DIR', temp_dir):
                memory.record_failure("syntax", "New error", "New fix")

                with open(errors_path) as f:
                    errors = json.load(f)

                assert len(errors) == 2
                assert errors[0]["issue"] == "Old error"
                assert errors[1]["issue"] == "New error"

    def test_handles_corrupted_json(self, temp_dir):
        """Test handling of corrupted JSON file"""
        errors_path = os.path.join(temp_dir, 'raw_errors.json')

        # Create corrupted file
        with open(errors_path, 'w') as f:
            f.write("{ invalid json }")

        with patch.object(memory, 'RAW_ERRORS_PATH', errors_path):
            with patch.object(memory, 'DATA_MEMORY_DIR', temp_dir):
                result = memory.record_failure("syntax", "Test", "Fix")

                assert result is True

                # Should start fresh
                with open(errors_path) as f:
                    errors = json.load(f)
                assert len(errors) == 1


class TestCompileRules:
    """Test suite for _compile_rules and compile_and_save_rules"""

    def test_empty_logs_returns_placeholder(self):
        """Test that empty logs return placeholder message"""
        result = memory._compile_rules([])

        assert "Dynamic Rules" in result
        assert "No errors recorded yet" in result

    def test_generates_rules_from_logs(self):
        """Test rule generation from error logs"""
        logs = [
            {"category": "syntax", "issue": "Missing import", "fix": "Add import statement", "timestamp": "2024-01-01"},
            {"category": "syntax", "issue": "Type error", "fix": "Fix type annotation", "timestamp": "2024-01-02"},
            {"category": "visual", "issue": "Layout broken", "fix": "Fix CSS", "timestamp": "2024-01-03"},
        ]

        result = memory._compile_rules(logs)

        assert "Dynamic Rules" in result
        assert "syntax" in result.lower() or "Syntax" in result
        assert "2 occurrences" in result or "visual" in result.lower()

    def test_respects_top_n_limit(self):
        """Test that top_n parameter limits rules"""
        logs = [
            {"category": f"cat{i}", "issue": f"Issue {i}", "fix": f"Fix {i}", "timestamp": "2024-01-01"}
            for i in range(10)
        ]

        result = memory._compile_rules(logs, top_n=3)

        # Should only have 3 rules
        rule_count = result.count("## Rule")
        assert rule_count <= 3


class TestGetMemoryPrompt:
    """Test suite for get_memory_prompt"""

    @pytest.fixture
    def temp_dir(self):
        temp = tempfile.mkdtemp()
        yield temp
        shutil.rmtree(temp)

    def test_returns_empty_when_no_rules(self, temp_dir):
        """Test that missing rules file returns empty string"""
        with patch.object(memory, 'DYNAMIC_RULES_PATH', os.path.join(temp_dir, 'nonexistent.md')):
            with patch.object(memory, 'RAW_ERRORS_PATH', os.path.join(temp_dir, 'nonexistent.json')):
                result = memory.get_memory_prompt()
                assert result == ""

    def test_returns_formatted_rules(self, temp_dir):
        """Test that existing rules are formatted as prompt"""
        rules_path = os.path.join(temp_dir, 'dynamic_rules.md')

        with open(rules_path, 'w') as f:
            f.write("# Test Rules\n\n1. Don't do X\n2. Always do Y")

        with patch.object(memory, 'DYNAMIC_RULES_PATH', rules_path):
            result = memory.get_memory_prompt()

            assert "LEARNED RULES" in result
            assert "Test Rules" in result


class TestGetGoldenReference:
    """Test suite for golden reference functions"""

    @pytest.fixture
    def temp_dir(self):
        temp = tempfile.mkdtemp()
        samples_dir = os.path.join(temp, 'golden_samples')
        os.makedirs(samples_dir)
        yield temp
        shutil.rmtree(temp)

    def test_returns_empty_when_no_samples(self, temp_dir):
        """Test that missing samples return empty tuple"""
        samples_dir = os.path.join(temp_dir, 'golden_samples')

        with patch.object(memory, 'GOLDEN_SAMPLES_DIR', samples_dir):
            filename, content = memory.get_golden_reference()

            assert filename == ""
            assert content == ""

    def test_returns_random_sample(self, temp_dir):
        """Test that a sample is returned when available"""
        samples_dir = os.path.join(temp_dir, 'golden_samples')

        # Create a sample file
        sample_path = os.path.join(samples_dir, 'test_sample.tsx')
        with open(sample_path, 'w') as f:
            f.write("export default function Page() { return <div>Test</div>; }")

        with patch.object(memory, 'GOLDEN_SAMPLES_DIR', samples_dir):
            filename, content = memory.get_golden_reference()

            assert filename == "test_sample.tsx"
            assert "Page()" in content

    def test_get_golden_reference_prompt_formats_correctly(self, temp_dir):
        """Test that golden reference prompt is formatted correctly"""
        samples_dir = os.path.join(temp_dir, 'golden_samples')

        sample_path = os.path.join(samples_dir, 'excellent.tsx')
        with open(sample_path, 'w') as f:
            f.write("// Excellent code here")

        with patch.object(memory, 'GOLDEN_SAMPLES_DIR', samples_dir):
            prompt = memory.get_golden_reference_prompt()

            assert "GOLDEN REFERENCE" in prompt
            assert "excellent.tsx" in prompt
            assert "Excellent code here" in prompt


class TestAddGoldenSample:
    """Test suite for add_golden_sample"""

    @pytest.fixture
    def temp_dir(self):
        temp = tempfile.mkdtemp()
        yield temp
        shutil.rmtree(temp)

    def test_adds_sample_successfully(self, temp_dir):
        """Test adding a golden sample"""
        samples_dir = os.path.join(temp_dir, 'golden_samples')

        with patch.object(memory, 'GOLDEN_SAMPLES_DIR', samples_dir):
            result = memory.add_golden_sample(
                filename="new_sample.tsx",
                content="export default function Good() { return <div>Good</div>; }"
            )

            assert result is True
            assert os.path.exists(os.path.join(samples_dir, "new_sample.tsx"))

            with open(os.path.join(samples_dir, "new_sample.tsx")) as f:
                assert "Good()" in f.read()


class TestErrorStats:
    """Test suite for get_error_stats"""

    @pytest.fixture
    def temp_dir(self):
        temp = tempfile.mkdtemp()
        yield temp
        shutil.rmtree(temp)

    def test_returns_zeros_when_no_errors(self, temp_dir):
        """Test stats when no errors recorded"""
        with patch.object(memory, 'RAW_ERRORS_PATH', os.path.join(temp_dir, 'nonexistent.json')):
            stats = memory.get_error_stats()

            assert stats["total"] == 0
            assert stats["by_category"] == {}
            assert stats["recent"] == []

    def test_returns_correct_stats(self, temp_dir):
        """Test stats calculation"""
        errors_path = os.path.join(temp_dir, 'raw_errors.json')

        errors = [
            {"category": "syntax", "issue": "E1", "fix": "F1", "metadata": {}, "timestamp": "2024-01-01"},
            {"category": "syntax", "issue": "E2", "fix": "F2", "metadata": {}, "timestamp": "2024-01-02"},
            {"category": "visual", "issue": "E3", "fix": "F3", "metadata": {}, "timestamp": "2024-01-03"},
        ]

        with open(errors_path, 'w') as f:
            json.dump(errors, f)

        with patch.object(memory, 'RAW_ERRORS_PATH', errors_path):
            stats = memory.get_error_stats()

            assert stats["total"] == 3
            assert stats["by_category"]["syntax"] == 2
            assert stats["by_category"]["visual"] == 1
            assert len(stats["recent"]) == 3


class TestClearOldErrors:
    """Test suite for clear_old_errors"""

    @pytest.fixture
    def temp_dir(self):
        temp = tempfile.mkdtemp()
        yield temp
        shutil.rmtree(temp)

    def test_keeps_only_last_n(self, temp_dir):
        """Test that only last N errors are kept"""
        errors_path = os.path.join(temp_dir, 'raw_errors.json')

        errors = [
            {"category": "syntax", "issue": f"E{i}", "fix": f"F{i}", "metadata": {}, "timestamp": f"2024-01-{i:02d}"}
            for i in range(1, 21)  # 20 errors
        ]

        with open(errors_path, 'w') as f:
            json.dump(errors, f)

        with patch.object(memory, 'RAW_ERRORS_PATH', errors_path):
            removed = memory.clear_old_errors(keep_last_n=5)

            assert removed == 15

            with open(errors_path) as f:
                remaining = json.load(f)

            assert len(remaining) == 5
            # Should keep the most recent (last) ones
            assert remaining[0]["issue"] == "E16"

    def test_returns_zero_when_under_limit(self, temp_dir):
        """Test no removal when under limit"""
        errors_path = os.path.join(temp_dir, 'raw_errors.json')

        errors = [{"category": "test", "issue": "E1", "fix": "F1", "metadata": {}, "timestamp": "2024-01-01"}]

        with open(errors_path, 'w') as f:
            json.dump(errors, f)

        with patch.object(memory, 'RAW_ERRORS_PATH', errors_path):
            removed = memory.clear_old_errors(keep_last_n=100)

            assert removed == 0


# Run tests with: pytest tests/test_memory.py -v
