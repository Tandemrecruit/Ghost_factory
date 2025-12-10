"""
Comprehensive unit tests for automation/cost_tracker.py

Tests cover the changes from the current branch:
- Simplified flat pricing (removed tiered pricing logic)
- Updated _pricing_for to return only flat pricing dict
- Simplified cost calculation in record_api_cost
- Config changes (flat pricing only in tracker_config.json)

Test Strategy:
- Mock file I/O and datetime for deterministic tests
- Test cost calculations with various token counts
- Test missing config scenarios (graceful defaults)
- Test edge cases: zero tokens, missing pricing, invalid entries
- Test hosting cost recording
- Verify schema validation integration
"""

import pytest
import json
import tempfile
import os
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import Mock, patch, mock_open, call

from automation import cost_tracker


class TestLoadConfig:
    """Test suite for load_config function"""
    
    def test_load_valid_config(self):
        """Test loading a valid config file"""
        config_data = {
            "api_pricing": {
                "anthropic/claude-opus-4-5-20251101": {
                    "input_per_million": 15.0,
                    "output_per_million": 75.0
                }
            }
        }
        
        with patch('automation.cost_tracker.CONFIG_PATH') as mock_path:
            mock_path.exists.return_value = True
            with patch('builtins.open', mock_open(read_data=json.dumps(config_data))):
                result = cost_tracker.load_config()
                
                assert result == config_data
                assert "api_pricing" in result
    
    def test_load_config_file_not_exists(self):
        """Test load_config when file doesn't exist"""
        with patch('automation.cost_tracker.CONFIG_PATH') as mock_path:
            mock_path.exists.return_value = False
            
            result = cost_tracker.load_config()
            
            assert result == {}
    
    def test_load_config_json_error(self):
        """Test load_config when JSON is invalid"""
        with patch('automation.cost_tracker.CONFIG_PATH') as mock_path:
            mock_path.exists.return_value = True
            with patch('builtins.open', mock_open(read_data="invalid json {")):
                result = cost_tracker.load_config()
                
                # Should return empty dict on error
                assert result == {}
    
    def test_load_config_io_error(self):
        """Test load_config when file can't be read"""
        with patch('automation.cost_tracker.CONFIG_PATH') as mock_path:
            mock_path.exists.return_value = True
            with patch('builtins.open', side_effect=OSError("Permission denied")):
                result = cost_tracker.load_config()
                
                assert result == {}


class TestPricingFor:
    """Test suite for _pricing_for function (flat pricing only)"""
    
    def test_get_known_model_pricing(self):
        """Test getting pricing for a known model"""
        cfg = {
            "api_pricing": {
                "anthropic/claude-opus-4-5-20251101": {
                    "input_per_million": 15.0,
                    "output_per_million": 75.0
                }
            }
        }
        
        result = cost_tracker._pricing_for("anthropic/claude-opus-4-5-20251101", cfg)
        
        assert result == {"input_per_million": 15.0, "output_per_million": 75.0}
    
    def test_get_unknown_model_returns_defaults(self):
        """Test that unknown model returns default zero pricing"""
        cfg = {"api_pricing": {}}
        
        result = cost_tracker._pricing_for("unknown/model", cfg)
        
        assert result == {"input_per_million": 0.0, "output_per_million": 0.0}
    
    def test_empty_config_returns_defaults(self):
        """Test that empty config returns default zero pricing"""
        cfg = {}
        
        result = cost_tracker._pricing_for("any/model", cfg)
        
        assert result == {"input_per_million": 0.0, "output_per_million": 0.0}
    
    def test_pricing_is_flat_structure(self):
        """Test that pricing structure is flat (no tiered_pricing key)"""
        cfg = {
            "api_pricing": {
                "openai/gpt-4": {
                    "input_per_million": 10.0,
                    "output_per_million": 30.0
                }
            }
        }
        
        result = cost_tracker._pricing_for("openai/gpt-4", cfg)
        
        # Should be flat dict with only these two keys
        assert "tiered_pricing" not in result
        assert set(result.keys()) == {"input_per_million", "output_per_million"}
    
    def test_all_config_models_use_flat_pricing(self):
        """Test that all models in the actual config use flat pricing"""
        with patch('automation.cost_tracker.CONFIG_PATH') as mock_path:
            mock_path.exists.return_value = True
            # Load the actual config file
            actual_config_path = Path("automation/tracker_config.json")
            if not actual_config_path.exists():
                pytest.fail(f"Config file not found: {actual_config_path}. Cannot verify flat pricing structure.")
            
            with open(actual_config_path) as f:
                cfg = json.load(f)
            
            for pricing in cfg.get("api_pricing", {}).values():
                # Each model should have flat pricing structure
                assert "input_per_million" in pricing
                assert "output_per_million" in pricing
                assert "tiered_pricing" not in pricing


class TestEstimateTokens:
    """Test suite for _estimate_tokens function"""
    
    def test_get_known_activity_estimate(self):
        """Test getting token estimate for known activity"""
        cfg = {
            "token_estimates": {
                "pipeline_architect": {
                    "input": 4000,
                    "output": 1200
                }
            }
        }
        
        result = cost_tracker._estimate_tokens("pipeline_architect", cfg)
        
        assert result == {"input": 4000, "output": 1200}
    
    def test_get_unknown_activity_returns_defaults(self):
        """Test unknown activity returns zero defaults"""
        cfg = {"token_estimates": {}}
        
        result = cost_tracker._estimate_tokens("unknown_activity", cfg)
        
        assert result == {"input": 0, "output": 0}
    
    def test_empty_config_returns_defaults(self):
        """Test empty config returns zero defaults"""
        cfg = {}
        
        result = cost_tracker._estimate_tokens("any_activity", cfg)
        
        assert result == {"input": 0, "output": 0}


class TestRecordApiCost:
    """Test suite for record_api_cost with flat pricing"""
    
    @pytest.fixture
    def mock_time(self):
        """Mock datetime for consistent timestamps"""
        fixed_time = datetime(2025, 1, 15, 10, 30, 0, tzinfo=timezone.utc)
        with patch('automation.cost_tracker.datetime') as mock_dt:
            mock_dt.utcnow.return_value = fixed_time
            yield mock_dt
    
    @pytest.fixture
    def temp_data_dir(self):
        """Create temporary directory for test data"""
        with tempfile.TemporaryDirectory() as temp_dir:
            with patch('automation.cost_tracker.API_COST_DIR', Path(temp_dir) / "api"):
                yield temp_dir
    
    def test_record_api_cost_with_explicit_tokens(self, mock_time, temp_data_dir):
        """Test recording cost with explicitly provided token counts"""
        cfg = {
            "api_pricing": {
                "anthropic/claude-opus-4-5-20251101": {
                    "input_per_million": 15.0,
                    "output_per_million": 75.0
                }
            }
        }
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_api_cost(
                provider="anthropic",
                model="claude-opus-4-5-20251101",
                client_id="test-client",
                activity="pipeline_architect",
                input_tokens=100000,  # 100k tokens
                output_tokens=50000   # 50k tokens
            )
            
            # Cost calculation: (100000/1M * 15.0) + (50000/1M * 75.0)
            # = 1.5 + 3.75 = 5.25
            expected_cost = 5.25
            
            assert result["cost_usd"] == expected_cost
            assert result["input_tokens"] == 100000
            assert result["output_tokens"] == 50000
            assert result["provider"] == "anthropic"
            assert result["model"] == "claude-opus-4-5-20251101"
            assert result["client_id"] == "test-client"
            
            # Verify _append_entry was called
            mock_append.assert_called_once()
    
    def test_record_api_cost_uses_estimates_when_tokens_not_provided(self, mock_time, temp_data_dir):
        """Test that token estimates are used when tokens not provided"""
        cfg = {
            "api_pricing": {
                "openai/gpt-4": {
                    "input_per_million": 10.0,
                    "output_per_million": 30.0
                }
            },
            "token_estimates": {
                "pipeline_copywriter": {
                    "input": 5000,
                    "output": 3200
                }
            }
        }
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_api_cost(
                provider="openai",
                model="gpt-4",
                client_id=None,
                activity="pipeline_copywriter",
                input_tokens=None,  # Use estimate
                output_tokens=None  # Use estimate
            )
            
            # Should use estimates: 5000 input, 3200 output
            assert result["input_tokens"] == 5000
            assert result["output_tokens"] == 3200
            
            # Cost: (5000/1M * 10.0) + (3200/1M * 30.0)
            # = 0.05 + 0.096 = 0.146
            expected_cost = 0.146
            assert result["cost_usd"] == expected_cost
    
    def test_record_api_cost_zero_tokens(self, mock_time, temp_data_dir):
        """Test recording cost with zero tokens"""
        cfg = {
            "api_pricing": {
                "anthropic/claude-haiku-4-5-20251015": {
                    "input_per_million": 0.25,
                    "output_per_million": 1.25
                }
            }
        }
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_api_cost(
                provider="anthropic",
                model="claude-haiku-4-5-20251015",
                client_id="client-1",
                activity="test",
                input_tokens=0,
                output_tokens=0
            )
            
            assert result["cost_usd"] == 0.0
            assert result["input_tokens"] == 0
            assert result["output_tokens"] == 0
    
    def test_record_api_cost_unknown_model_uses_zero_pricing(self, mock_time, temp_data_dir):
        """Test that unknown model defaults to zero pricing"""
        cfg = {"api_pricing": {}}
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_api_cost(
                provider="unknown",
                model="unknown-model",
                client_id="test",
                activity="test",
                input_tokens=100000,
                output_tokens=50000
            )
            
            # Unknown model should use 0.0 pricing
            assert result["cost_usd"] == 0.0
    
    def test_record_api_cost_large_token_counts(self, mock_time, temp_data_dir):
        """Test cost calculation with very large token counts"""
        cfg = {
            "api_pricing": {
                "anthropic/claude-sonnet-4-5-20250929": {
                    "input_per_million": 3.0,
                    "output_per_million": 15.0
                }
            }
        }
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_api_cost(
                provider="anthropic",
                model="claude-sonnet-4-5-20250929",
                client_id="large-client",
                activity="bulk_processing",
                input_tokens=5000000,  # 5 million tokens
                output_tokens=2000000  # 2 million tokens
            )
            
            # Cost: (5M/1M * 3.0) + (2M/1M * 15.0)
            # = 15.0 + 30.0 = 45.0
            expected_cost = 45.0
            assert result["cost_usd"] == expected_cost
    
    def test_record_api_cost_with_metadata(self, mock_time, temp_data_dir):
        """Test recording cost with custom metadata"""
        cfg = {
            "api_pricing": {
                "openai/gpt-4": {
                    "input_per_million": 10.0,
                    "output_per_million": 30.0
                }
            }
        }
        
        custom_metadata = {
            "version": "v2.1",
            "retry_count": 2,
            "stage": "architect"
        }
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_api_cost(
                provider="openai",
                model="gpt-4",
                client_id="test",
                activity="test",
                input_tokens=1000,
                output_tokens=500,
                metadata=custom_metadata
            )
            
            assert result["metadata"] == custom_metadata
    
    def test_record_api_cost_no_metadata_defaults_to_empty_dict(self, mock_time, temp_data_dir):
        """Test that metadata defaults to empty dict when not provided"""
        cfg = {"api_pricing": {"test/model": {"input_per_million": 1.0, "output_per_million": 1.0}}}
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_api_cost(
                provider="test",
                model="model",
                client_id="test",
                activity="test",
                input_tokens=100,
                output_tokens=50,
                metadata=None
            )
            
            assert result["metadata"] == {}
    
    def test_record_api_cost_timestamp_format(self, mock_time, temp_data_dir):
        """Test that timestamp is in ISO format"""
        cfg = {"api_pricing": {"test/model": {"input_per_million": 1.0, "output_per_million": 1.0}}}
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_api_cost(
                provider="test",
                model="model",
                client_id="test",
                activity="test",
                input_tokens=100,
                output_tokens=50
            )
            
            # Should be ISO format from fixed_time in mock
            assert result["timestamp"] == "2025-01-15T10:30:00"
    
    def test_record_api_cost_rounding(self, mock_time, temp_data_dir):
        """Test that cost is rounded to 4 decimal places"""
        cfg = {
            "api_pricing": {
                "test/model": {
                    "input_per_million": 1.234567,
                    "output_per_million": 2.345678
                }
            }
        }
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_api_cost(
                provider="test",
                model="model",
                client_id="test",
                activity="test",
                input_tokens=1000,
                output_tokens=1000
            )
            
            # Cost should be rounded to 4 decimals
            # (1000/1M * 1.234567) + (1000/1M * 2.345678) = 0.001234567 + 0.002345678
            # = 0.003580245 → 0.0036 (rounded)
            assert isinstance(result["cost_usd"], float)
            # Check that it has at most 4 decimal places
            cost_str = str(result["cost_usd"])
            if '.' in cost_str:
                decimals = len(cost_str.split('.')[1])
                assert decimals <= 4


class TestRecordHostingCosts:
    """Test suite for record_hosting_costs function"""
    
    @pytest.fixture
    def temp_data_dir(self):
        """Create temporary directory for test data"""
        with tempfile.TemporaryDirectory() as temp_dir:
            with patch('automation.cost_tracker.HOSTING_COST_DIR', Path(temp_dir) / "hosting"):
                yield temp_dir
    
    def test_record_hosting_costs_for_multiple_clients(self, temp_data_dir):
        """Test recording hosting costs for multiple managed clients"""
        cfg = {
            "hosting": {
                "cost_per_managed_client": 5.0
            }
        }
        
        managed_clients = ["client-1", "client-2", "client-3"]
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_hosting_costs(managed_clients, "2025-01")
            
            assert len(result) == 3
            assert mock_append.call_count == 3
            
            # Verify each entry
            for i, client_id in enumerate(managed_clients):
                entry = result[i]
                assert entry["client_id"] == client_id
                assert entry["cost_usd"] == 5.0
                assert entry["type"] == "hosting"
                assert entry["timestamp"] == "2025-01-01T00:00:00Z"
    
    def test_record_hosting_costs_empty_list(self, temp_data_dir):
        """Test recording hosting costs with empty client list"""
        cfg = {"hosting": {"cost_per_managed_client": 5.0}}
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_hosting_costs([], "2025-01")
            
            assert result == []
            assert mock_append.call_count == 0
    
    def test_record_hosting_costs_uses_current_month_when_not_specified(self, temp_data_dir):
        """Test that current month is used when month_str not provided"""
        cfg = {"hosting": {"cost_per_managed_client": 5.0}}
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append, \
             patch('automation.cost_tracker.datetime') as mock_dt:
            
            mock_dt.utcnow.return_value = datetime(2025, 3, 15, tzinfo=timezone.utc)
            
            result = cost_tracker.record_hosting_costs(["client-1"])
            
            # Should use 2025-03 as month_str
            entry = result[0]
            assert "2025-03" in entry["timestamp"]
    
    def test_record_hosting_costs_custom_cost_per_client(self, temp_data_dir):
        """Test hosting costs with custom cost per client"""
        cfg = {
            "hosting": {
                "cost_per_managed_client": 12.50
            }
        }
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_hosting_costs(["premium-client"], "2025-02")
            
            assert result[0]["cost_usd"] == 12.50
    
    def test_record_hosting_costs_missing_config_uses_default(self, temp_data_dir):
        """Test that default cost is used when config missing"""
        cfg = {}  # No hosting config
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_hosting_costs(["client-1"], "2025-01")
            
            # Should use default of 5.0
            assert result[0]["cost_usd"] == 5.0


class TestAppendEntry:
    """Test suite for _append_entry function"""
    
    @pytest.fixture
    def temp_data_dir(self):
        """Create temporary directory for test data"""
        with tempfile.TemporaryDirectory() as temp_dir:
            yield Path(temp_dir)
    
    def test_append_entry_creates_new_file(self, temp_data_dir):
        """Test that _append_entry creates new file if it doesn't exist"""
        entry = {
            "timestamp": "2025-01-15T10:00:00",
            "provider": "anthropic",
            "model": "claude-opus",
            "activity": "test",
            "client_id": "test",
            "input_tokens": 1000,
            "output_tokens": 500,
            "cost_usd": 0.10,
            "metadata": {}
        }
        
        with patch('automation.cost_tracker.validate_api_cost_entry', return_value=(True, None)):
            cost_tracker._append_entry(temp_data_dir, "2025-01", entry)
        
        file_path = temp_data_dir / "2025-01.json"
        assert file_path.exists()
        
        with open(file_path) as f:
            data = json.load(f)
        
        assert len(data) == 1
        assert data[0] == entry
    
    def test_append_entry_appends_to_existing_file(self, temp_data_dir):
        """Test that _append_entry appends to existing file"""
        # Create existing file with one entry
        existing_entry = {"id": 1}
        file_path = temp_data_dir / "2025-01.json"
        with open(file_path, 'w') as f:
            json.dump([existing_entry], f)
        
        new_entry = {
            "timestamp": "2025-01-15T10:00:00",
            "provider": "openai",
            "model": "gpt-4",
            "activity": "test",
            "client_id": "test",
            "input_tokens": 2000,
            "output_tokens": 1000,
            "cost_usd": 0.20,
            "metadata": {}
        }
        
        with patch('automation.cost_tracker.validate_api_cost_entry', return_value=(True, None)):
            cost_tracker._append_entry(temp_data_dir, "2025-01", new_entry)
        
        with open(file_path) as f:
            data = json.load(f)
        
        assert len(data) == 2
        assert data[0] == existing_entry
        assert data[1] == new_entry
    
    def test_append_entry_handles_corrupted_json(self, temp_data_dir):
        """Test that _append_entry handles corrupted JSON gracefully"""
        # Create corrupted JSON file
        file_path = temp_data_dir / "2025-01.json"
        with open(file_path, 'w') as f:
            f.write("invalid json {")
        
        entry = {
            "timestamp": "2025-01-15T10:00:00",
            "provider": "test",
            "model": "test",
            "activity": "test",
            "client_id": "test",
            "input_tokens": 100,
            "output_tokens": 50,
            "cost_usd": 0.01,
            "metadata": {}
        }
        
        with patch('automation.cost_tracker.validate_api_cost_entry', return_value=(True, None)):
            # Should not crash, should start fresh
            cost_tracker._append_entry(temp_data_dir, "2025-01", entry)
        
        # File should now contain valid JSON with just the new entry
        with open(file_path) as f:
            data = json.load(f)
        
        assert len(data) == 1
        assert data[0] == entry
    
    def test_append_entry_rejects_invalid_api_cost_entry(self, temp_data_dir):
        """Test that invalid API cost entries are rejected"""
        invalid_entry = {
            "timestamp": "2025-01-15T10:00:00",
            "provider": "test",
            # Missing required fields
        }
        
        with patch('automation.cost_tracker.validate_api_cost_entry', return_value=(False, "Missing required fields")):
            cost_tracker._append_entry(temp_data_dir, "2025-01", invalid_entry)
        
        # File should not be created
        file_path = temp_data_dir / "2025-01.json"
        assert not file_path.exists()
    
    def test_append_entry_validates_hosting_entries(self, temp_data_dir):
        """Test that hosting entries are validated with correct validator"""
        hosting_entry = {
            "timestamp": "2025-01-01T00:00:00Z",
            "client_id": "test-client",
            "cost_usd": 5.0,
            "type": "hosting"
        }
        
        with patch('automation.cost_tracker.validate_hosting_cost_entry', return_value=(True, None)) as mock_validator:
            cost_tracker._append_entry(temp_data_dir, "2025-01", hosting_entry)
            
            # Should use hosting validator
            mock_validator.assert_called_once_with(hosting_entry)


class TestFlatPricingMigration:
    """Test suite to verify tiered pricing has been completely removed"""
    
    def test_no_tiered_pricing_in_config_file(self):
        """Verify tracker_config.json has no tiered_pricing structures"""
        config_path = Path("automation/tracker_config.json")
        
        if config_path.exists():
            with open(config_path) as f:
                content = f.read()
            
            # Should not contain tiered_pricing anywhere
            assert "tiered_pricing" not in content
            assert "threshold" not in content
            assert "below_threshold" not in content
            assert "above_threshold" not in content
    
    def test_no_tiered_pricing_function_exists(self):
        """Verify _calculate_cost_with_tiered_pricing function no longer exists"""
        assert not hasattr(cost_tracker, '_calculate_cost_with_tiered_pricing')
    
    def test_pricing_for_returns_only_flat_structure(self):
        """Verify _pricing_for always returns flat structure"""
        cfg = {
            "api_pricing": {
                "test/model": {
                    "input_per_million": 1.0,
                    "output_per_million": 2.0
                }
            }
        }
        
        result = cost_tracker._pricing_for("test/model", cfg)
        
        # Should only have these two keys
        assert set(result.keys()) == {"input_per_million", "output_per_million"}
        assert "tiered_pricing" not in result
    
    def test_cost_calculation_is_linear(self):
        """Verify cost calculation is linear (no tier thresholds)"""
        cfg = {
            "api_pricing": {
                "test/model": {
                    "input_per_million": 3.0,
                    "output_per_million": 15.0
                }
            }
        }
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry'):
            
            # Test below theoretical old threshold (200k)
            result1 = cost_tracker.record_api_cost(
                provider="test",
                model="model",
                client_id="test",
                activity="test",
                input_tokens=100000,
                output_tokens=50000
            )
            
            # Test above theoretical old threshold (200k)
            result2 = cost_tracker.record_api_cost(
                provider="test",
                model="model",
                client_id="test",
                activity="test",
                input_tokens=300000,
                output_tokens=150000
            )
            
            # Cost should scale linearly
            # 100k input: 0.3, 50k output: 0.75 = 1.05
            assert result1["cost_usd"] == 1.05
            
            # 300k input: 0.9, 150k output: 2.25 = 3.15
            # This is exactly 3x the first cost (linear scaling)
            assert result2["cost_usd"] == 3.15
            assert result2["cost_usd"] == result1["cost_usd"] * 3


class TestEdgeCases:
    """Test suite for edge cases and boundary conditions"""
    
    def test_very_small_token_counts(self):
        """Test cost calculation with very small token counts"""
        cfg = {
            "api_pricing": {
                "test/model": {
                    "input_per_million": 10.0,
                    "output_per_million": 30.0
                }
            }
        }
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry'):
            
            result = cost_tracker.record_api_cost(
                provider="test",
                model="model",
                client_id="test",
                activity="test",
                input_tokens=1,
                output_tokens=1
            )
            
            # 1/1M * 10 + 1/1M * 30 = 0.00001 + 0.00003 = 0.00004 → 0.0 (rounded)
            assert result["cost_usd"] >= 0.0
            assert result["cost_usd"] < 0.01
    
    def test_null_client_id(self):
        """Test recording cost with null client_id"""
        cfg = {"api_pricing": {"test/model": {"input_per_million": 1.0, "output_per_million": 1.0}}}
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry') as mock_append:
            
            result = cost_tracker.record_api_cost(
                provider="test",
                model="model",
                client_id=None,
                activity="test",
                input_tokens=1000,
                output_tokens=500
            )
            
            assert result["client_id"] is None
    
    def test_fractional_tokens_not_expected_but_handled(self):
        """Test that fractional tokens (if somehow passed) are handled"""
        cfg = {
            "api_pricing": {
                "test/model": {
                    "input_per_million": 10.0,
                    "output_per_million": 20.0
                }
            }
        }
        
        with patch('automation.cost_tracker.load_config', return_value=cfg), \
             patch('automation.cost_tracker._append_entry'):
            
            # Even though tokens should be integers, test floats
            result = cost_tracker.record_api_cost(
                provider="test",
                model="model",
                client_id="test",
                activity="test",
                input_tokens=1500.5,
                output_tokens=750.25
            )
            
            # Should still calculate cost
            # (1500.5/1M * 10) + (750.25/1M * 20)
            expected = (1500.5 / 1_000_000 * 10.0) + (750.25 / 1_000_000 * 20.0)
            assert abs(result["cost_usd"] - expected) < 0.0001


# Run tests with: pytest tests/test_cost_tracker.py -v