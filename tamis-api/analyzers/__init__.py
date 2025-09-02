"""
Analyzers Package for Hatay Earthquake Damage Assessment

This package contains all the analysis tools for processing satellite imagery
and generating damage assessments for the Hatay earthquake analysis.

Available analyzers:
- analyzer_manager: Centralized manager for all analysis tools (NEW!)
- check_data_info: Data information and validation
- visualize_hatay_data: Static visualization generation  
- create_web_map: Interactive web map creation
- disaster_labeling: Advanced AI damage classification
- run_analysis: Complete analysis orchestrator
"""

__version__ = "2.0.0"
__author__ = "Hatay Earthquake Analysis Team"

# Import main analyzer manager and classes for easy access
try:
    from .analyzer_manager import AnalyzerManager
    from .disaster_labeling import DisasterLabeler
    from .analyzer_manager import (
        run_data_info_check,
        run_visualization,
        run_web_map,
        run_damage_labeling,
        run_full_analysis
    )
except ImportError as e:
    print(f"Warning: Could not import some analyzers: {e}")
    # Handle import errors gracefully
    pass

# Available analyzer IDs
AVAILABLE_ANALYZERS = [
    "data_info",
    "visualization", 
    "web_map",
    "damage_labeling",
    "full_analysis"
]

__all__ = [
    'AnalyzerManager',
    'DisasterLabeler',
    'AVAILABLE_ANALYZERS',
    'run_data_info_check',
    'run_visualization',
    'run_web_map',
    'run_damage_labeling',
    'run_full_analysis'
]
