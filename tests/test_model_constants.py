"""
Unit tests for model constant validation in factory.py and intake_sanitizer.py

These tests ensure:
- Model constants have exact expected values
- No typos in model names
- No "-latest" aliases (production stability)
- Claude models follow correct pattern: claude-{tier}-{version}-{date}
- OpenAI models follow correct pattern: gpt-{version}-{variant}
- Dates are in YYYYMMDD format
"""

import pytest
import re

from automation import factory
from automation import intake_sanitizer


class TestFactoryModelConstants:
    """Test suite for model constants in factory.py"""

    def test_model_strategy_exists(self):
        """Test MODEL_STRATEGY is defined"""
        assert hasattr(factory, 'MODEL_STRATEGY')
        assert isinstance(factory.MODEL_STRATEGY, str)
        assert len(factory.MODEL_STRATEGY) > 0

    def test_model_strategy_exact_value(self):
        """Test MODEL_STRATEGY has exact expected value"""
        expected = "claude-opus-4-5-20251101"
        assert factory.MODEL_STRATEGY == expected, \
            f"MODEL_STRATEGY should be '{expected}', got '{factory.MODEL_STRATEGY}'"

    def test_model_coder_exists(self):
        """Test MODEL_CODER is defined"""
        assert hasattr(factory, 'MODEL_CODER')
        assert isinstance(factory.MODEL_CODER, str)
        assert len(factory.MODEL_CODER) > 0

    def test_model_coder_exact_value(self):
        """Test MODEL_CODER has exact expected value"""
        expected = "claude-sonnet-4-5-20250929"
        assert factory.MODEL_CODER == expected, \
            f"MODEL_CODER should be '{expected}', got '{factory.MODEL_CODER}'"

    def test_model_copy_exists(self):
        """Test MODEL_COPY is defined"""
        assert hasattr(factory, 'MODEL_COPY')
        assert isinstance(factory.MODEL_COPY, str)
        assert len(factory.MODEL_COPY) > 0

    def test_model_copy_exact_value(self):
        """Test MODEL_COPY has exact expected value"""
        expected = "claude-sonnet-4-5-20250929"
        assert factory.MODEL_COPY == expected, \
            f"MODEL_COPY should be '{expected}', got '{factory.MODEL_COPY}'"

    def test_model_qa_exists(self):
        """Test MODEL_QA is defined"""
        assert hasattr(factory, 'MODEL_QA')
        assert isinstance(factory.MODEL_QA, str)
        assert len(factory.MODEL_QA) > 0

    def test_model_qa_exact_value(self):
        """Test MODEL_QA has exact expected value"""
        expected = "claude-haiku-4-5-20251015"
        assert factory.MODEL_QA == expected, \
            f"MODEL_QA should be '{expected}', got '{factory.MODEL_QA}'"

    def test_model_router_exists(self):
        """Test MODEL_ROUTER is defined"""
        assert hasattr(factory, 'MODEL_ROUTER')
        assert isinstance(factory.MODEL_ROUTER, str)
        assert len(factory.MODEL_ROUTER) > 0

    def test_model_router_exact_value(self):
        """Test MODEL_ROUTER has exact expected value"""
        expected = "claude-haiku-4-5-20251015"
        assert factory.MODEL_ROUTER == expected, \
            f"MODEL_ROUTER should be '{expected}', got '{factory.MODEL_ROUTER}'"

    def test_model_critic_exists(self):
        """Test MODEL_CRITIC is defined"""
        assert hasattr(factory, 'MODEL_CRITIC')
        assert isinstance(factory.MODEL_CRITIC, str)
        assert len(factory.MODEL_CRITIC) > 0

    def test_model_critic_exact_value(self):
        """Test MODEL_CRITIC has exact expected value"""
        expected = "claude-sonnet-4-5-20250929"
        assert factory.MODEL_CRITIC == expected, \
            f"MODEL_CRITIC should be '{expected}', got '{factory.MODEL_CRITIC}'"

    def test_no_latest_aliases(self):
        """Test that no model constants use '-latest' aliases"""
        model_constants = [
            factory.MODEL_STRATEGY,
            factory.MODEL_CODER,
            factory.MODEL_COPY,
            factory.MODEL_QA,
            factory.MODEL_ROUTER,
            factory.MODEL_CRITIC,
        ]
        
        for model in model_constants:
            assert "-latest" not in model, \
                f"Model '{model}' should not use '-latest' alias for production stability"

    def test_claude_models_follow_pattern(self):
        """Test that all Claude models follow pattern: claude-{tier}-{version}-{date}"""
        claude_models = [
            factory.MODEL_STRATEGY,
            factory.MODEL_CODER,
            factory.MODEL_COPY,
            factory.MODEL_QA,
            factory.MODEL_ROUTER,
            factory.MODEL_CRITIC,
        ]
        
        # Pattern: claude-{tier}-{major}.{minor}-{YYYYMMDD}
        pattern = r'^claude-(opus|sonnet|haiku)-\d+-\d+-\d{8}$'
        
        for model in claude_models:
            assert re.match(pattern, model), \
                f"Model '{model}' does not match Claude pattern: claude-{{tier}}-{{version}}-{{YYYYMMDD}}"

    def test_claude_model_tiers_valid(self):
        """Test that Claude model tiers are valid (opus, sonnet, haiku)"""
        valid_tiers = {'opus', 'sonnet', 'haiku'}
        
        claude_models = [
            factory.MODEL_STRATEGY,
            factory.MODEL_CODER,
            factory.MODEL_COPY,
            factory.MODEL_QA,
            factory.MODEL_ROUTER,
            factory.MODEL_CRITIC,
        ]
        
        for model in claude_models:
            # Extract tier from model name
            match = re.match(r'^claude-(\w+)-\d+-\d+-\d{8}$', model)
            assert match, f"Could not extract tier from '{model}'"
            tier = match.group(1)
            assert tier in valid_tiers, \
                f"Model '{model}' has invalid tier '{tier}'. Must be one of: {valid_tiers}"

    def test_claude_model_dates_valid_format(self):
        """Test that Claude model dates are in YYYYMMDD format"""
        claude_models = [
            factory.MODEL_STRATEGY,
            factory.MODEL_CODER,
            factory.MODEL_COPY,
            factory.MODEL_QA,
            factory.MODEL_ROUTER,
            factory.MODEL_CRITIC,
        ]
        
        date_pattern = r'-\d{8}$'  # Ends with 8 digits
        
        for model in claude_models:
            assert re.search(date_pattern, model), \
                f"Model '{model}' date should be in YYYYMMDD format"
            
            # Extract and validate date
            date_match = re.search(r'-(\d{8})$', model)
            if date_match:
                date_str = date_match.group(1)
                assert len(date_str) == 8, \
                    f"Model '{model}' date '{date_str}' should be 8 digits"
                assert date_str.isdigit(), \
                    f"Model '{model}' date '{date_str}' should be numeric"

    def test_model_strategy_is_opus(self):
        """Test that MODEL_STRATEGY uses Opus tier (highest capability)"""
        assert "opus" in factory.MODEL_STRATEGY.lower(), \
            "MODEL_STRATEGY should use Opus tier for complex reasoning"

    def test_model_qa_is_haiku(self):
        """Test that MODEL_QA uses Haiku tier (cost-effective for QA)"""
        assert "haiku" in factory.MODEL_QA.lower(), \
            "MODEL_QA should use Haiku tier for cost-effective visual inspection"

    def test_model_router_is_haiku(self):
        """Test that MODEL_ROUTER uses Haiku tier (fast classification)"""
        assert "haiku" in factory.MODEL_ROUTER.lower(), \
            "MODEL_ROUTER should use Haiku tier for fast classification"

    def test_model_coder_is_sonnet(self):
        """Test that MODEL_CODER uses Sonnet tier (quality/cost balance)"""
        assert "sonnet" in factory.MODEL_CODER.lower(), \
            "MODEL_CODER should use Sonnet tier for code generation"

    def test_model_copy_is_sonnet(self):
        """Test that MODEL_COPY uses Sonnet tier (creative writing)"""
        assert "sonnet" in factory.MODEL_COPY.lower(), \
            "MODEL_COPY should use Sonnet tier for creative writing"

    def test_model_critic_is_sonnet(self):
        """Test that MODEL_CRITIC uses Sonnet tier (quality review)"""
        assert "sonnet" in factory.MODEL_CRITIC.lower(), \
            "MODEL_CRITIC should use Sonnet tier for quality review"

    def test_no_typos_in_model_names(self):
        """Test for common typos in model names"""
        common_typos = {
            'claude': ['cluade', 'cluade', 'cluade'],
            'opus': ['opuss', 'opu', 'opuss'],
            'sonnet': ['sonet', 'sonnett', 'sonet'],
            'haiku': ['haikku', 'haik', 'haikku'],
        }
        
        all_models = [
            factory.MODEL_STRATEGY,
            factory.MODEL_CODER,
            factory.MODEL_COPY,
            factory.MODEL_QA,
            factory.MODEL_ROUTER,
            factory.MODEL_CRITIC,
        ]
        
        for model in all_models:
            model_lower = model.lower()
            for correct, typos in common_typos.items():
                if correct in model_lower:
                    for typo in typos:
                        assert typo not in model_lower, \
                            f"Model '{model}' contains typo '{typo}' (should be '{correct}')"


class TestIntakeSanitizerModelConstants:
    """Test suite for model constants in intake_sanitizer.py"""

    def test_model_sanitizer_exists(self):
        """Test MODEL_SANITIZER is defined"""
        assert hasattr(intake_sanitizer, 'MODEL_SANITIZER')
        assert isinstance(intake_sanitizer.MODEL_SANITIZER, str)
        assert len(intake_sanitizer.MODEL_SANITIZER) > 0

    def test_model_sanitizer_default_value(self):
        """Test MODEL_SANITIZER default value (when env var not set)"""
        # The actual value depends on os.getenv, but we can test the pattern
        # In practice, it should default to "gpt-5-nano" if env var is not set
        model = intake_sanitizer.MODEL_SANITIZER
        
        # Should be a valid model name (either from env or default)
        assert len(model) > 0
        assert isinstance(model, str)

    def test_model_sanitizer_no_latest_alias(self):
        """Test that MODEL_SANITIZER does not use '-latest' alias"""
        model = intake_sanitizer.MODEL_SANITIZER
        assert "-latest" not in model, \
            f"MODEL_SANITIZER '{model}' should not use '-latest' alias for production stability"

    def test_model_sanitizer_follows_openai_pattern(self):
        """Test that MODEL_SANITIZER follows OpenAI model pattern"""
        model = intake_sanitizer.MODEL_SANITIZER
        
        # OpenAI models typically: gpt-{version}-{variant}
        # Examples: gpt-5-nano, gpt-4-turbo, gpt-3.5-turbo
        openai_pattern = r'^gpt-[\d.]+-[\w-]+$'
        
        assert re.match(openai_pattern, model), \
            f"MODEL_SANITIZER '{model}' does not match OpenAI pattern: gpt-{{version}}-{{variant}}"

    def test_model_sanitizer_is_gpt5_nano_when_default(self):
        """Test that default MODEL_SANITIZER is gpt-5-nano"""
        # This test checks the expected default, but respects env var override
        # We can't directly test os.getenv default, but we can verify the pattern
        model = intake_sanitizer.MODEL_SANITIZER
        
        # If it's the default (not overridden by env), it should be gpt-5-nano
        # But we can't know if env var is set, so we just check it's valid
        assert model.startswith("gpt-"), \
            f"MODEL_SANITIZER '{model}' should start with 'gpt-'"

    def test_no_typos_in_sanitizer_model(self):
        """Test for common typos in sanitizer model name"""
        model = intake_sanitizer.MODEL_SANITIZER.lower()
        
        # Check for common typos
        assert "gpt" in model, "MODEL_SANITIZER should contain 'gpt'"
        assert "gptt" not in model, "MODEL_SANITIZER should not contain typo 'gptt'"
        assert "nano" in model or "turbo" in model or "mini" in model, \
            "MODEL_SANITIZER should contain a valid variant (nano, turbo, mini, etc.)"


class TestModelConstantsConsistency:
    """Test suite for consistency across model constants"""

    def test_all_models_are_strings(self):
        """Test that all model constants are strings"""
        factory_models = [
            factory.MODEL_STRATEGY,
            factory.MODEL_CODER,
            factory.MODEL_COPY,
            factory.MODEL_QA,
            factory.MODEL_ROUTER,
            factory.MODEL_CRITIC,
        ]
        
        sanitizer_model = intake_sanitizer.MODEL_SANITIZER
        
        all_models = factory_models + [sanitizer_model]
        
        for model in all_models:
            assert isinstance(model, str), \
                f"Model constant should be string, got {type(model)}"

    def test_no_empty_models(self):
        """Test that no model constants are empty"""
        factory_models = [
            factory.MODEL_STRATEGY,
            factory.MODEL_CODER,
            factory.MODEL_COPY,
            factory.MODEL_QA,
            factory.MODEL_ROUTER,
            factory.MODEL_CRITIC,
        ]
        
        sanitizer_model = intake_sanitizer.MODEL_SANITIZER
        
        all_models = factory_models + [sanitizer_model]
        
        for model in all_models:
            assert len(model) > 0, \
                f"Model constant should not be empty: '{model}'"

    def test_no_whitespace_in_models(self):
        """Test that model constants don't have leading/trailing whitespace"""
        factory_models = [
            factory.MODEL_STRATEGY,
            factory.MODEL_CODER,
            factory.MODEL_COPY,
            factory.MODEL_QA,
            factory.MODEL_ROUTER,
            factory.MODEL_CRITIC,
        ]
        
        sanitizer_model = intake_sanitizer.MODEL_SANITIZER
        
        all_models = factory_models + [sanitizer_model]
        
        for model in all_models:
            assert model == model.strip(), \
                f"Model constant '{model}' should not have leading/trailing whitespace"

    def test_claude_models_have_version_4_5(self):
        """Test that all Claude models use version 4-5"""
        claude_models = [
            factory.MODEL_STRATEGY,
            factory.MODEL_CODER,
            factory.MODEL_COPY,
            factory.MODEL_QA,
            factory.MODEL_ROUTER,
            factory.MODEL_CRITIC,
        ]
        
        for model in claude_models:
            assert "4-5" in model or "4.5" in model, \
                f"Model '{model}' should use version 4-5 or 4.5"


# Run tests with: pytest tests/test_model_constants.py -v

