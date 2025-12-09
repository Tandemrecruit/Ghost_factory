"""
Comprehensive unit tests for automation/factory.py

Tests cover the new and modified functionality from the current branch:
- run_visual_designer (new parallel agent for theme generation)
- run_architect (modified with parallel Visual Designer execution)
- run_copywriter (new function with Copy Critic loop)
- run_builder (modified with theme.json support)
- select_niche_persona (modified with new niche mappings: webinar_funnel)

Test Strategy:
- Mock all external API calls (Anthropic, OpenAI)
- Mock file I/O where appropriate, use temp dirs for integration tests
- Mock time_tracker and cost_tracker modules
- Test happy paths, edge cases, and error conditions
- Verify retry logic and critic loops
- Test parallel execution with ThreadPoolExecutor
"""

import pytest
import json
import os
import tempfile
import shutil
from unittest.mock import Mock, patch, MagicMock, mock_open, call, ANY
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import module under test
from automation import factory


class TestSelectNichePersona:
    """Test suite for select_niche_persona with new niche mappings"""
    
    @pytest.fixture
    def mock_dependencies(self):
        """Mock all external dependencies for select_niche_persona"""
        with patch('automation.factory.client_anthropic') as mock_anthropic, \
             patch('automation.factory._load_prompt') as mock_load, \
             patch('automation.factory._record_model_cost') as mock_cost, \
             patch('automation.factory._extract_response_text') as mock_extract:
            
            mock_load.return_value = "Mock router prompt"
            
            yield {
                'anthropic': mock_anthropic,
                'load_prompt': mock_load,
                'record_cost': mock_cost,
                'extract_text': mock_extract
            }
    
    def test_saas_classification(self, mock_dependencies):
        """Test SaaS business classification"""
        mock_dependencies['extract_text'].return_value = "SAAS"
        
        result = factory.select_niche_persona("client123", "B2B SaaS platform...")
        
        assert result == "saas.md"
        mock_dependencies['anthropic'].messages.create.assert_called_once()
        
    def test_saas_b2b_variant_maps_to_saas(self, mock_dependencies):
        """Test that SAAS_B2B variant maps to saas.md"""
        mock_dependencies['extract_text'].return_value = "SAAS_B2B"
        
        result = factory.select_niche_persona("client456", "Enterprise software...")
        
        assert result == "saas.md"
    
    def test_local_service_classification(self, mock_dependencies):
        """Test local service business classification"""
        mock_dependencies['extract_text'].return_value = "LOCAL_SERVICE"
        
        result = factory.select_niche_persona("client789", "Local plumbing service...")
        
        assert result == "local_service.md"
    
    def test_ecommerce_classification(self, mock_dependencies):
        """Test ecommerce classification"""
        mock_dependencies['extract_text'].return_value = "ECOMMERCE"
        
        result = factory.select_niche_persona("client101", "Online jewelry store...")
        
        assert result == "ecommerce.md"
    
    def test_ecommerce_dtc_variant(self, mock_dependencies):
        """Test ecommerce_dtc variant maps to ecommerce.md"""
        mock_dependencies['extract_text'].return_value = "ECOMMERCE_DTC"
        
        result = factory.select_niche_persona("client102", "Direct-to-consumer brand...")
        
        assert result == "ecommerce.md"
    
    def test_personal_brand_classification(self, mock_dependencies):
        """Test personal brand classification"""
        mock_dependencies['extract_text'].return_value = "PERSONAL_BRAND"
        
        result = factory.select_niche_persona("client103", "Business coach...")
        
        assert result == "personal_brand.md"
    
    def test_webinar_funnel_classification_new(self, mock_dependencies):
        """Test NEW webinar_funnel classification added in this branch"""
        mock_dependencies['extract_text'].return_value = "WEBINAR_FUNNEL"
        
        result = factory.select_niche_persona("client104", "Live masterclass registration...")
        
        assert result == "webinar.md"
    
    def test_case_insensitive_classification(self, mock_dependencies):
        """Test that classification is case-insensitive"""
        mock_dependencies['extract_text'].return_value = "webinar_funnel"
        
        result = factory.select_niche_persona("client105", "Training webinar...")
        
        assert result == "webinar.md"
    
    def test_invalid_niche_defaults_to_local_service(self, mock_dependencies):
        """Test that invalid niche defaults to local_service.md"""
        mock_dependencies['extract_text'].return_value = "INVALID_NICHE"
        
        result = factory.select_niche_persona("client999", "Unknown business...")
        
        assert result == "local_service.md"
    
    def test_empty_response_defaults_to_local_service(self, mock_dependencies):
        """Test that empty router response defaults to local_service.md"""
        mock_dependencies['extract_text'].return_value = None
        
        result = factory.select_niche_persona("client106", "Some text...")
        
        assert result == "local_service.md"
    
    def test_whitespace_in_response_handled(self, mock_dependencies):
        """Test that whitespace in response is stripped properly"""
        mock_dependencies['extract_text'].return_value = "  SAAS  \n"
        
        result = factory.select_niche_persona("client107", "SaaS product...")
        
        assert result == "saas.md"
    
    def test_uses_correct_model(self, mock_dependencies):
        """Test that router uses MODEL_ROUTER (Haiku for fast classification)"""
        mock_dependencies['extract_text'].return_value = "SAAS"
        
        factory.select_niche_persona("client108", "Software platform...")
        
        call_kwargs = mock_dependencies['anthropic'].messages.create.call_args[1]
        assert call_kwargs['model'] == factory.MODEL_ROUTER
    
    def test_cost_tracking_called(self, mock_dependencies):
        """Test that cost tracking is called with correct parameters"""
        mock_dependencies['extract_text'].return_value = "SAAS"
        mock_response = Mock()
        mock_dependencies['anthropic'].messages.create.return_value = mock_response
        
        factory.select_niche_persona("client109", "SaaS app...")
        
        mock_dependencies['record_cost'].assert_called_once_with(
            "anthropic", factory.MODEL_ROUTER, "router_classify", "client109", mock_response
        )


class TestRunVisualDesigner:
    """Test suite for the NEW run_visual_designer function"""
    
    @pytest.fixture
    def temp_client_dir(self):
        """Create temporary client directory with intake.md"""
        temp_dir = tempfile.mkdtemp()
        client_path = os.path.join(temp_dir, "test_client")
        os.makedirs(client_path)
        
        intake_content = """# Client Intake
Company: TestCo
Industry: Technology
Brand Colors: Navy (#1E3A8A) and Gold (#F59E0B)
Vibe: Professional and modern
"""
        with open(os.path.join(client_path, "intake.md"), "w") as f:
            f.write(intake_content)
        
        yield client_path
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def mock_all(self):
        """Mock all external dependencies"""
        with patch('automation.factory.client_anthropic') as mock_anthropic, \
             patch('automation.factory.time_tracker') as mock_tracker, \
             patch('automation.factory._load_prompt') as mock_load, \
             patch('automation.factory._record_model_cost') as mock_cost, \
             patch('automation.factory._extract_response_text') as mock_extract:
            
            mock_load.return_value = "Palette generator prompt"
            mock_tracker.track_span.return_value = MagicMock(__enter__=Mock(), __exit__=Mock())
            
            yield {
                'anthropic': mock_anthropic,
                'tracker': mock_tracker,
                'load': mock_load,
                'cost': mock_cost,
                'extract': mock_extract
            }
    
    def test_creates_valid_theme_json(self, temp_client_dir, mock_all):
        """Test that visual designer creates valid theme.json"""
        theme_data = {
            "primary": "#1E3A8A",
            "secondary": "#3B82F6",
            "accent": "#F59E0B",
            "background": "white",
            "font_heading": "Inter",
            "font_body": "Inter",
            "border_radius": "0.5rem",
            "source": "intake"
        }
        
        mock_all['extract'].return_value = f"```json\n{json.dumps(theme_data)}\n```"
        
        result = factory.run_visual_designer(temp_client_dir)
        
        assert result is not None
        assert result["primary"] == "#1E3A8A"
        assert result["accent"] == "#F59E0B"
        
        # Verify file was created
        theme_path = os.path.join(temp_client_dir, "theme.json")
        assert os.path.exists(theme_path)
        
        with open(theme_path) as f:
            saved = json.load(f)
        assert saved == theme_data
    
    def test_handles_json_without_markdown_wrapper(self, temp_client_dir, mock_all):
        """Test handling of raw JSON without ```json wrapper"""
        theme_data = {
            "primary": "#2563EB",
            "secondary": "#1E40AF",
            "accent": "#DC2626",
            "background": "slate-900",
            "font_heading": "Space Grotesk",
            "font_body": "Lato",
            "border_radius": "1rem",
            "source": "generated"
        }
        
        mock_all['extract'].return_value = json.dumps(theme_data)
        
        result = factory.run_visual_designer(temp_client_dir)
        
        assert result is not None
        assert result["background"] == "slate-900"
        assert result["font_heading"] == "Space Grotesk"
    
    def test_creates_fallback_theme_on_invalid_json(self, temp_client_dir, mock_all):
        """Test that invalid JSON triggers fallback default theme"""
        mock_all['extract'].return_value = "This is not valid JSON {broken}"
        
        result = factory.run_visual_designer(temp_client_dir)
        
        assert result is not None
        assert result["primary"] == "#3B82F6"  # Default blue
        assert "font_heading" in result
        
        # Verify fallback was saved
        theme_path = os.path.join(temp_client_dir, "theme.json")
        assert os.path.exists(theme_path)
    
    def test_returns_none_when_intake_missing(self, temp_client_dir, mock_all):
        """Test graceful handling when intake.md is missing"""
        os.remove(os.path.join(temp_client_dir, "intake.md"))
        
        result = factory.run_visual_designer(temp_client_dir)
        
        assert result is None
    
    def test_returns_none_on_empty_response(self, temp_client_dir, mock_all):
        """Test handling of empty API response"""
        mock_all['extract'].return_value = None
        
        result = factory.run_visual_designer(temp_client_dir)
        
        assert result is None
    
    def test_uses_sonnet_model(self, temp_client_dir, mock_all):
        """Test that visual designer uses MODEL_COPY (Sonnet)"""
        theme = {"primary": "#000"}
        mock_all['extract'].return_value = json.dumps(theme)
        
        factory.run_visual_designer(temp_client_dir)
        
        call_kwargs = mock_all['anthropic'].messages.create.call_args[1]
        assert call_kwargs['model'] == factory.MODEL_COPY
    
    def test_loads_palette_generator_prompt(self, temp_client_dir, mock_all):
        """Test that correct prompt file is loaded"""
        theme = {"primary": "#000"}
        mock_all['extract'].return_value = json.dumps(theme)
        
        factory.run_visual_designer(temp_client_dir)
        
        mock_all['load'].assert_called_once_with("design/palette_generator.md")
    
    def test_time_tracking_called(self, temp_client_dir, mock_all):
        """Test that time tracking span is created"""
        theme = {"primary": "#000"}
        mock_all['extract'].return_value = json.dumps(theme)
        
        factory.run_visual_designer(temp_client_dir)
        
        mock_all['tracker'].track_span.assert_called_once()
        call_args = mock_all['tracker'].track_span.call_args[0]
        assert call_args[0] == "pipeline_visual_designer"
        assert call_args[2] == {"stage": "visual_designer"}


class TestRunArchitectParallelExecution:
    """Test suite for run_architect with parallel Visual Designer"""
    
    @pytest.fixture
    def temp_client_dir(self):
        """Create temp client directory"""
        temp_dir = tempfile.mkdtemp()
        client_path = os.path.join(temp_dir, "test_client")
        os.makedirs(client_path)
        
        with open(os.path.join(client_path, "intake.md"), "w") as f:
            f.write("# Intake\nCompany: Test\nProduct: Analytics")
        
        yield client_path
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def mock_all(self):
        """Mock all dependencies"""
        with patch('automation.factory.client_anthropic') as mock_anthropic, \
             patch('automation.factory.time_tracker') as mock_tracker, \
             patch('automation.factory._load_prompt') as mock_load, \
             patch('automation.factory._record_model_cost') as mock_cost, \
             patch('automation.factory._extract_response_text') as mock_extract, \
             patch('automation.factory.select_niche_persona') as mock_niche, \
             patch('automation.factory.run_copywriter') as mock_copy, \
             patch('automation.factory.run_visual_designer') as mock_designer:
            
            mock_load.return_value = "Mock prompt"
            mock_niche.return_value = "saas.md"
            mock_tracker.track_span.return_value = MagicMock(__enter__=Mock(), __exit__=Mock())
            mock_designer.return_value = {"primary": "#123"}
            
            yield {
                'anthropic': mock_anthropic,
                'tracker': mock_tracker,
                'load': mock_load,
                'cost': mock_cost,
                'extract': mock_extract,
                'niche': mock_niche,
                'copywriter': mock_copy,
                'designer': mock_designer
            }
    
    def test_spawns_visual_designer_in_parallel(self, temp_client_dir, mock_all):
        """Test that visual designer is spawned using ThreadPoolExecutor"""
        mock_all['extract'].side_effect = ["Brief content", "PASS"]
        
        with patch('automation.factory.ThreadPoolExecutor') as mock_executor:
            mock_future = Mock()
            mock_future.result.return_value = {"primary": "#000"}
            mock_executor.return_value.__enter__.return_value.submit.return_value = mock_future
            
            factory.run_architect(temp_client_dir)
            
            # Verify executor was created with 1 worker
            mock_executor.assert_called_once_with(max_workers=1)
            
            # Verify designer was submitted
            submit_call = mock_executor.return_value.__enter__.return_value.submit
            submit_call.assert_called_once()
            assert submit_call.call_args[0][0] == factory.run_visual_designer
    
    def test_waits_for_visual_designer_completion(self, temp_client_dir, mock_all):
        """Test that architect waits for visual designer with timeout"""
        mock_all['extract'].side_effect = ["Brief", "PASS"]
        
        with patch('automation.factory.ThreadPoolExecutor') as mock_executor:
            mock_future = Mock()
            mock_future.result.return_value = {"primary": "#456"}
            mock_executor.return_value.__enter__.return_value.submit.return_value = mock_future
            
            factory.run_architect(temp_client_dir)
            
            # Verify result() was called with 60 second timeout
            mock_future.result.assert_called_once_with(timeout=60)
    
    def test_handles_visual_designer_timeout_gracefully(self, temp_client_dir, mock_all):
        """Test graceful handling of visual designer timeout"""
        mock_all['extract'].side_effect = ["Brief", "PASS"]
        
        with patch('automation.factory.ThreadPoolExecutor') as mock_executor:
            mock_future = Mock()
            mock_future.result.side_effect = TimeoutError("Timeout")
            mock_executor.return_value.__enter__.return_value.submit.return_value = mock_future
            
            # Should not raise exception
            factory.run_architect(temp_client_dir)
            
            # Pipeline should continue
            mock_all['copywriter'].assert_called_once()
    
    def test_handles_visual_designer_exception(self, temp_client_dir, mock_all):
        """Test handling of visual designer exceptions"""
        mock_all['extract'].side_effect = ["Brief", "PASS"]
        
        with patch('automation.factory.ThreadPoolExecutor') as mock_executor:
            mock_future = Mock()
            mock_future.result.side_effect = Exception("Designer failed")
            mock_executor.return_value.__enter__.return_value.submit.return_value = mock_future
            
            # Should not raise
            factory.run_architect(temp_client_dir)
            
            # Should continue to copywriter
            mock_all['copywriter'].assert_called_once()
    
    def test_critic_loop_pass_on_first_attempt(self, temp_client_dir, mock_all):
        """Test critic loop when brief passes on first attempt"""
        mock_all['extract'].side_effect = ["Brief content", "PASS"]
        
        factory.run_architect(temp_client_dir)
        
        # Should only make 2 API calls (strategist + critic)
        assert mock_all['anthropic'].messages.create.call_count == 2
        
        # Verify files were saved
        assert os.path.exists(os.path.join(temp_client_dir, "brief.md"))
        assert os.path.exists(os.path.join(temp_client_dir, "brief.orig.md"))
    
    def test_critic_loop_retry_on_fail(self, temp_client_dir, mock_all):
        """Test critic loop retries when brief fails"""
        mock_all['extract'].side_effect = [
            "First brief",
            "FAIL: Missing information",
            "Improved brief",
            "PASS"
        ]
        
        factory.run_architect(temp_client_dir)
        
        # Should make 4 calls (strategist, critic, strategist, critic)
        assert mock_all['anthropic'].messages.create.call_count == 4
    
    def test_critic_loop_max_retries(self, temp_client_dir, mock_all):
        """Test that critic loop respects MAX_CRITIC_RETRIES"""
        # All attempts fail
        mock_all['extract'].side_effect = [
            "Brief", "FAIL: Issues"
        ] * factory.MAX_CRITIC_RETRIES
        
        factory.run_architect(temp_client_dir)
        
        # Should make exactly MAX_CRITIC_RETRIES * 2 calls
        expected_calls = factory.MAX_CRITIC_RETRIES * 2
        assert mock_all['anthropic'].messages.create.call_count == expected_calls
        
        # Should still save the last brief
        assert os.path.exists(os.path.join(temp_client_dir, "brief.md"))
    
    def test_saves_original_and_working_copy(self, temp_client_dir, mock_all):
        """Test that both brief.orig.md and brief.md are saved"""
        brief_content = "Final brief content"
        mock_all['extract'].side_effect = [brief_content, "PASS"]
        
        factory.run_architect(temp_client_dir)
        
        # Verify both files exist
        orig_path = os.path.join(temp_client_dir, "brief.orig.md")
        working_path = os.path.join(temp_client_dir, "brief.md")
        
        assert os.path.exists(orig_path)
        assert os.path.exists(working_path)
        
        # Verify content matches
        with open(orig_path) as f:
            orig = f.read()
        with open(working_path) as f:
            working = f.read()
        
        assert orig == working == brief_content
    
    def test_critic_checks_fail_before_pass(self, temp_client_dir, mock_all):
        """Test that FAIL is checked before PASS to avoid false positives"""
        # Response contains both FAIL and PASS
        mock_all['extract'].side_effect = [
            "Brief",
            "FAIL: Issues found. Don't PASS this.",
            "Improved brief",
            "PASS"
        ]
        
        factory.run_architect(temp_client_dir)
        
        # Should retry (4 calls total)
        assert mock_all['anthropic'].messages.create.call_count == 4


class TestRunCopywriter:
    """Test suite for NEW run_copywriter function with Copy Critic loop"""
    
    @pytest.fixture
    def temp_client_dir(self):
        """Create temp directory with required files"""
        temp_dir = tempfile.mkdtemp()
        client_path = os.path.join(temp_dir, "test_client")
        os.makedirs(client_path)
        
        with open(os.path.join(client_path, "brief.md"), "w") as f:
            f.write("# Brief\nObjective: Create landing page")
        
        with open(os.path.join(client_path, "intake.md"), "w") as f:
            f.write("# Intake\nCompany: Test\nProduct: Tool")
        
        yield client_path
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def mock_all(self):
        """Mock dependencies"""
        with patch('automation.factory.client_anthropic') as mock_anthropic, \
             patch('automation.factory.time_tracker') as mock_tracker, \
             patch('automation.factory._load_prompt') as mock_load, \
             patch('automation.factory._record_model_cost') as mock_cost, \
             patch('automation.factory._extract_response_text') as mock_extract, \
             patch('automation.factory.run_builder') as mock_builder:
            
            mock_load.return_value = "Copy critic prompt"
            mock_tracker.track_span.return_value = MagicMock(__enter__=Mock(), __exit__=Mock())
            
            yield {
                'anthropic': mock_anthropic,
                'tracker': mock_tracker,
                'load': mock_load,
                'cost': mock_cost,
                'extract': mock_extract,
                'builder': mock_builder
            }
    
    def test_pass_on_first_attempt(self, temp_client_dir, mock_all):
        """Test copywriter when critic passes immediately"""
        mock_all['extract'].side_effect = ["Great content", "PASS"]
        
        factory.run_copywriter(temp_client_dir)
        
        # Should make 2 calls (copywriter + critic)
        assert mock_all['anthropic'].messages.create.call_count == 2
        
        # Verify files created
        assert os.path.exists(os.path.join(temp_client_dir, "content.md"))
        assert os.path.exists(os.path.join(temp_client_dir, "content.orig.md"))
        
        # Verify builder was called
        mock_all['builder'].assert_called_once_with(temp_client_dir)
    
    def test_retry_on_critic_fail(self, temp_client_dir, mock_all):
        """Test retry when copy critic fails"""
        mock_all['extract'].side_effect = [
            "Content with [placeholder]",
            "FAIL: Contains placeholder text",
            "Improved content",
            "PASS"
        ]
        
        factory.run_copywriter(temp_client_dir)
        
        # Should make 4 calls
        assert mock_all['anthropic'].messages.create.call_count == 4
        
        # Final content should be the improved version
        with open(os.path.join(temp_client_dir, "content.md")) as f:
            content = f.read()
        assert content == "Improved content"
    
    def test_max_retries_exhausted(self, temp_client_dir, mock_all):
        """Test behavior after max retries"""
        mock_all['extract'].side_effect = [
            "Content", "FAIL: Issues"
        ] * factory.MAX_CRITIC_RETRIES
        
        factory.run_copywriter(temp_client_dir)
        
        # Should make MAX_CRITIC_RETRIES * 2 calls
        expected = factory.MAX_CRITIC_RETRIES * 2
        assert mock_all['anthropic'].messages.create.call_count == expected
        
        # Should still save and continue
        assert os.path.exists(os.path.join(temp_client_dir, "content.md"))
        mock_all['builder'].assert_called_once()
    
    def test_empty_response_retries(self, temp_client_dir, mock_all):
        """Test retry on empty copywriter response"""
        mock_all['extract'].side_effect = [
            None,  # Empty
            "Valid content",
            "PASS"
        ]
        
        factory.run_copywriter(temp_client_dir)
        
        # Should retry and succeed
        with open(os.path.join(temp_client_dir, "content.md")) as f:
            content = f.read()
        assert content == "Valid content"
    
    def test_handles_intake_processed_fallback(self, temp_client_dir, mock_all):
        """Test fallback to intake-processed.md if intake.md missing"""
        os.remove(os.path.join(temp_client_dir, "intake.md"))
        with open(os.path.join(temp_client_dir, "intake-processed.md"), "w") as f:
            f.write("# Processed Intake")
        
        mock_all['extract'].side_effect = ["Content", "PASS"]
        
        # Should not raise error
        factory.run_copywriter(temp_client_dir)
        
        assert os.path.exists(os.path.join(temp_client_dir, "content.md"))
    
    def test_saves_original_and_working_copy(self, temp_client_dir, mock_all):
        """Test that both content.orig.md and content.md are saved"""
        final_content = "Final website content"
        mock_all['extract'].side_effect = [final_content, "PASS"]
        
        factory.run_copywriter(temp_client_dir)
        
        # Verify both files
        with open(os.path.join(temp_client_dir, "content.orig.md")) as f:
            orig = f.read()
        with open(os.path.join(temp_client_dir, "content.md")) as f:
            working = f.read()
        
        assert orig == working == final_content
    
    def test_ambiguous_critic_response_treated_as_pass(self, temp_client_dir, mock_all):
        """Test that unclear critic response is treated as pass"""
        mock_all['extract'].side_effect = [
            "Content",
            "This looks okay but not sure"  # No PASS/FAIL
        ]
        
        factory.run_copywriter(temp_client_dir)
        
        # Should accept and continue
        assert os.path.exists(os.path.join(temp_client_dir, "content.md"))
        mock_all['builder'].assert_called_once()
    
    def test_uses_sonnet_model(self, temp_client_dir, mock_all):
        """Test that copywriter uses MODEL_COPY (Sonnet)"""
        mock_all['extract'].side_effect = ["Content", "PASS"]
        
        factory.run_copywriter(temp_client_dir)
        
        # Check first call (copywriter)
        call_kwargs = mock_all['anthropic'].messages.create.call_args_list[0][1]
        assert call_kwargs['model'] == factory.MODEL_COPY


class TestRunBuilder:
    """Test suite for run_builder with theme.json support"""
    
    @pytest.fixture
    def temp_client_dir(self):
        """Create temp directory with required files"""
        temp_dir = tempfile.mkdtemp()
        client_path = os.path.join(temp_dir, "test_client")
        os.makedirs(client_path)
        
        with open(os.path.join(client_path, "brief.md"), "w") as f:
            f.write("# Brief\nObjective: Modern site")
        
        with open(os.path.join(client_path, "content.md"), "w") as f:
            f.write("# Content\n## Hero\nWelcome")
        
        yield client_path
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def mock_all(self):
        """Mock dependencies"""
        with patch('automation.factory.client_anthropic') as mock_anthropic, \
             patch('automation.factory.time_tracker') as mock_tracker, \
             patch('automation.factory._record_model_cost') as mock_cost:
            
            mock_tracker.track_span.return_value = MagicMock(__enter__=Mock(), __exit__=Mock())
            
            yield {
                'anthropic': mock_anthropic,
                'tracker': mock_tracker,
                'cost': mock_cost
            }
    
    def test_loads_and_applies_theme_json(self, temp_client_dir, mock_all):
        """Test builder loads theme.json and includes in prompt"""
        theme_data = {
            "primary": "#1E3A8A",
            "secondary": "#3B82F6",
            "accent": "#F59E0B",
            "background": "white",
            "font_heading": "Playfair Display",
            "font_body": "Inter",
            "border_radius": "0.5rem"
        }
        
        with open(os.path.join(temp_client_dir, "theme.json"), "w") as f:
            json.dump(theme_data, f)
        
        mock_response = Mock()
        mock_response.content = [Mock(text="```tsx\n// Code\n```")]
        mock_all['anthropic'].messages.create.return_value = mock_response
        
        with patch('os.path.exists', return_value=True), \
             patch('builtins.open', mock_open(read_data="Library")):
            factory.run_builder(temp_client_dir)
        
        # Verify theme was included in system prompt
        call_kwargs = mock_all['anthropic'].messages.create.call_args[1]
        system_prompt = call_kwargs['system']
        
        assert "DESIGN THEME" in system_prompt
        assert "#1E3A8A" in system_prompt
        assert "Playfair Display" in system_prompt
    
    def test_works_without_theme_json(self, temp_client_dir, mock_all):
        """Test builder works when theme.json doesn't exist"""
        mock_response = Mock()
        mock_response.content = [Mock(text="```tsx\n// Code\n```")]
        mock_all['anthropic'].messages.create.return_value = mock_response
        
        with patch('os.path.exists', return_value=True), \
             patch('builtins.open', mock_open(read_data="Library")):
            factory.run_builder(temp_client_dir)
        
        # Should not include theme section
        call_kwargs = mock_all['anthropic'].messages.create.call_args[1]
        system_prompt = call_kwargs['system']
        
        assert "DESIGN THEME" not in system_prompt
    
    def test_handles_invalid_theme_json(self, temp_client_dir, mock_all):
        """Test graceful handling of corrupted theme.json"""
        with open(os.path.join(temp_client_dir, "theme.json"), "w") as f:
            f.write("{ invalid json }")
        
        mock_response = Mock()
        mock_response.content = [Mock(text="```tsx\n// Code\n```")]
        mock_all['anthropic'].messages.create.return_value = mock_response
        
        with patch('os.path.exists', return_value=True), \
             patch('builtins.open', mock_open(read_data="Library")):
            # Should not raise error
            factory.run_builder(temp_client_dir)
    
    def test_includes_color_application_instructions(self, temp_client_dir, mock_all):
        """Test that theme prompt includes specific application instructions"""
        theme_data = {
            "primary": "#FF0000",
            "secondary": "#00FF00",
            "accent": "#0000FF",
            "background": "slate-900",
            "font_heading": "Space Grotesk",
            "font_body": "Inter",
            "border_radius": "1rem"
        }
        
        with open(os.path.join(temp_client_dir, "theme.json"), "w") as f:
            json.dump(theme_data, f)
        
        mock_response = Mock()
        mock_response.content = [Mock(text="```tsx\n// Code\n```")]
        mock_all['anthropic'].messages.create.return_value = mock_response
        
        with patch('os.path.exists', return_value=True), \
             patch('builtins.open', mock_open(read_data="Library")):
            factory.run_builder(temp_client_dir)
        
        call_kwargs = mock_all['anthropic'].messages.create.call_args[1]
        system_prompt = call_kwargs['system']
        
        # Verify specific instructions
        assert 'primary" color for main CTAs' in system_prompt
        assert 'secondary" color for secondary elements' in system_prompt
        assert 'accent" color for highlights' in system_prompt
        assert 'font_heading" for h1, h2, h3' in system_prompt
        assert 'border_radius" to buttons' in system_prompt
    
    def test_creates_page_tsx(self, temp_client_dir, mock_all):
        """Test that page.tsx file is created"""
        code = """```tsx
import { Hero } from '@/components/hero'

export default function Page() {
  return <Hero />
}
```"""
        mock_response = Mock()
        mock_response.content = [Mock(text=code)]
        mock_all['anthropic'].messages.create.return_value = mock_response
        
        with patch('os.path.exists', return_value=True), \
             patch('builtins.open', mock_open(read_data="Library")):
            factory.run_builder(temp_client_dir)
        
        # Verify file exists
        page_path = os.path.join(temp_client_dir, "page.tsx")
        assert os.path.exists(page_path)


class TestEdgeCasesAndErrorHandling:
    """Test suite for edge cases and error conditions"""
    
    def test_empty_intake_file(self):
        """Test handling of empty intake file"""
        with tempfile.TemporaryDirectory() as temp_dir:
            client_path = os.path.join(temp_dir, "client")
            os.makedirs(client_path)
            
            with open(os.path.join(client_path, "intake.md"), "w") as f:
                f.write("")
            
            with patch('automation.factory.client_anthropic') as mock_api, \
                 patch('automation.factory._load_prompt', return_value="prompt"), \
                 patch('automation.factory._record_model_cost'), \
                 patch('automation.factory.time_tracker.track_span'):
                
                mock_response = Mock()
                mock_response.content = [Mock(text='{"primary": "#000"}')]
                mock_api.messages.create.return_value = mock_response
                
                # Should not crash
                result = factory.run_visual_designer(client_path)
                assert result is not None
    
    def test_unicode_in_content(self):
        """Test handling of unicode characters"""
        with tempfile.TemporaryDirectory() as temp_dir:
            client_path = os.path.join(temp_dir, "client")
            os.makedirs(client_path)
            
            with open(os.path.join(client_path, "brief.md"), "w", encoding="utf-8") as f:
                f.write("# Brief\n🚀 Objective: émojis 你好")
            
            with open(os.path.join(client_path, "content.md"), "w", encoding="utf-8") as f:
                f.write("# Content\n## Héro\n¡Hola!")
            
            with patch('automation.factory.client_anthropic') as mock_api, \
                 patch('automation.factory.time_tracker.track_span'), \
                 patch('automation.factory._record_model_cost'), \
                 patch('os.path.exists', return_value=True), \
                 patch('builtins.open', mock_open(read_data="Library")):
                
                mock_response = Mock()
                mock_response.content = [Mock(text="```tsx\n// Code\n```")]
                mock_api.messages.create.return_value = mock_response
                
                # Should handle unicode
                factory.run_builder(client_path)
    
    def test_very_long_content(self):
        """Test handling of very long content responses"""
        with tempfile.TemporaryDirectory() as temp_dir:
            client_path = os.path.join(temp_dir, "client")
            os.makedirs(client_path)
            
            with open(os.path.join(client_path, "brief.md"), "w") as f:
                f.write("# Brief")
            
            with open(os.path.join(client_path, "intake.md"), "w") as f:
                f.write("# Intake")
            
            with patch('automation.factory.client_anthropic'), \
                 patch('automation.factory.time_tracker.track_span'), \
                 patch('automation.factory._load_prompt', return_value="prompt"), \
                 patch('automation.factory._record_model_cost'), \
                 patch('automation.factory._extract_response_text') as mock_extract, \
                 patch('automation.factory.run_builder'):
                
                # 10k character content
                long_content = "Lorem ipsum " * 1000
                mock_extract.side_effect = [long_content, "PASS"]
                
                factory.run_copywriter(client_path)
                
                # Verify saved
                with open(os.path.join(client_path, "content.md")) as f:
                    saved = f.read()
                assert len(saved) == len(long_content)


class TestPromptFileValidation:
    """Test that new prompt files are present"""
    
    def test_copy_critic_prompt_exists(self):
        """Test copy_critic.md exists"""
        path = os.path.join("prompts", "critique", "copy_critic.md")
        assert os.path.exists(path), f"{path} should exist"
    
    def test_palette_generator_prompt_exists(self):
        """Test palette_generator.md exists"""
        path = os.path.join("prompts", "design", "palette_generator.md")
        assert os.path.exists(path), f"{path} should exist"
    
    def test_webinar_strategy_prompt_exists(self):
        """Test webinar.md strategy prompt exists"""
        path = os.path.join("prompts", "strategy", "webinar.md")
        assert os.path.exists(path), f"{path} should exist"
    
    def test_router_includes_webinar_category(self):
        """Test router.md includes WEBINAR_FUNNEL"""
        path = os.path.join("prompts", "router.md")
        
        if os.path.exists(path):
            with open(path) as f:
                content = f.read()
            assert "WEBINAR_FUNNEL" in content or "webinar" in content.lower()


# Run tests with: pytest tests/test_factory.py -v