#!/usr/bin/env python3
"""
Centralized Analyzer Manager for Hatay Earthquake Assessment
This class-based infrastructure provides a unified interface for all analysis tools
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from typing import Dict, List, Optional, Callable, Any
import importlib.util


class AnalyzerManager:
    """
    Centralized manager for all Hatay earthquake analysis tools
    Provides a class-based interface for running analyses programmatically
    """
    
    def __init__(self, data_dir: str = "1c__Hatay_Enkaz_Bina_Etiketleme"):
        """
        Initialize the analyzer manager
        
        Args:
            data_dir (str): Directory containing satellite imagery data
        """
        self.data_dir = data_dir
        self.output_dir = "output"
        self.analyzers_dir = os.path.dirname(os.path.abspath(__file__))
        self.root_dir = os.path.dirname(self.analyzers_dir)
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Define available analyzers
        self.analyzers = {
            'data_info': {
                'name': 'Data Information Check',
                'description': 'Analyze basic information about satellite imagery files',
                'script': 'check_data_info.py',
                'class': None,  # Script-based analyzer
                'outputs': ['console_output'],
                'estimated_time': 10  # seconds
            },
            'coordinates': {
                'name': 'Coordinate Extraction',
                'description': 'Extract precise coordinates from shapefile and raster data',
                'script': 'coordinate_extractor.py',
                'class': 'CoordinateExtractor',
                'outputs': ['hatay_coordinates.json'],
                'estimated_time': 30
            },
            'visualization': {
                'name': 'Static Visualization',
                'description': 'Generate side-by-side comparison visualizations',
                'script': 'visualize_hatay_data.py',
                'class': None,
                'outputs': ['hatay_comparison.png', 'hatay_damage_assessment.png'],
                'estimated_time': 120
            },
            'web_map': {
                'name': 'Interactive Web Map',
                'description': 'Create interactive web map with damage layers',
                'script': 'create_web_map.py',
                'class': None,
                'outputs': ['hatay_interactive_map.html'],
                'estimated_time': 45
            },
            'damage_labeling': {
                'name': 'AI Damage Assessment',
                'description': 'AI-powered damage classification with severity analysis',
                'script': 'disaster_labeling.py',
                'class': 'DisasterLabeler',
                'outputs': ['hatay_damage_assessment.png', 'hatay_damage_report.json', 'hatay_field_analysis.json'],
                'estimated_time': 180
            },
            'full_analysis': {
                'name': 'Complete Analysis Pipeline',
                'description': 'Run all analysis tools in sequence',
                'script': 'run_analysis.py',
                'class': None,
                'outputs': ['all_outputs'],
                'estimated_time': 300
            }
        }
        
        # Progress tracking
        self.current_analysis = None
        self.progress_callbacks = []
    
    def add_progress_callback(self, callback: Callable[[str, float, str], None]):
        """
        Add a callback function for progress updates
        
        Args:
            callback: Function that takes (analysis_id, progress_percent, message)
        """
        self.progress_callbacks.append(callback)
    
    def _update_progress(self, analysis_id: str, progress: float, message: str):
        """Update progress for all registered callbacks"""
        for callback in self.progress_callbacks:
            try:
                callback(analysis_id, progress, message)
            except Exception as e:
                print(f"Warning: Progress callback failed: {e}")
    
    def list_analyzers(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all available analyzers"""
        return self.analyzers.copy()
    
    def get_analyzer_info(self, analyzer_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific analyzer"""
        return self.analyzers.get(analyzer_id)
    
    def check_prerequisites(self) -> Dict[str, bool]:
        """
        Check if all prerequisites are met for running analyses
        
        Returns:
            Dict with status of various prerequisites
        """
        status = {}
        
        # Check data directory
        status['data_directory'] = os.path.exists(self.data_dir)
        
        # Check required data files
        required_files = [
            "HATAY MERKEZ-2 2015.tif",
            "HATAY MERKEZ-2 2023.tif",
            "HATAY MERKEZ-2 SINIR.shp"
        ]
        
        for file in required_files:
            file_path = os.path.join(self.data_dir, file)
            status[f'file_{file}'] = os.path.exists(file_path)
        
        # Check Python dependencies
        required_packages = [
            'rasterio', 'geopandas', 'matplotlib', 'folium', 
            'scikit-learn', 'opencv-python', 'scikit-image'
        ]
        
        for package in required_packages:
            try:
                __import__(package.replace('-', '_'))
                status[f'package_{package}'] = True
            except ImportError:
                status[f'package_{package}'] = False
        
        return status
    
    def run_analyzer_script(self, analyzer_id: str, analysis_id: str = None) -> Dict[str, Any]:
        """
        Run an analyzer using subprocess (script-based approach)
        
        Args:
            analyzer_id: ID of the analyzer to run
            analysis_id: Unique ID for this analysis run
            
        Returns:
            Dict with analysis results and metadata
        """
        if analyzer_id not in self.analyzers:
            raise ValueError(f"Unknown analyzer: {analyzer_id}")
        
        analyzer = self.analyzers[analyzer_id]
        script_path = os.path.join(self.analyzers_dir, analyzer['script'])
        
        if not os.path.exists(script_path):
            raise FileNotFoundError(f"Analyzer script not found: {script_path}")
        
        analysis_id = analysis_id or f"{analyzer_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.current_analysis = analysis_id
        
        result = {
            'analysis_id': analysis_id,
            'analyzer_id': analyzer_id,
            'analyzer_name': analyzer['name'],
            'start_time': datetime.now().isoformat(),
            'status': 'running',
            'progress': 0,
            'message': f"Starting {analyzer['name']}...",
            'outputs': {},
            'errors': []
        }
        
        try:
            self._update_progress(analysis_id, 10, "Initializing analysis...")
            
            # Change to root directory for script execution
            original_cwd = os.getcwd()
            os.chdir(self.root_dir)
            
            # Add special handling for automated run_analysis
            cmd = [sys.executable, os.path.join(self.analyzers_dir, analyzer['script'])]
            if analyzer_id == 'full_analysis':
                cmd.append('--auto')
            
            self._update_progress(analysis_id, 20, f"Running {analyzer['name']}...")
            
            # Run the script
            process = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=analyzer['estimated_time'] + 60,  # Add buffer time
                cwd=self.root_dir
            )
            
            # Restore original working directory
            os.chdir(original_cwd)
            
            if process.returncode == 0:
                self._update_progress(analysis_id, 90, "Analysis completed, processing outputs...")
                
                result.update({
                    'status': 'completed',
                    'progress': 100,
                    'message': f"{analyzer['name']} completed successfully",
                    'end_time': datetime.now().isoformat(),
                    'stdout': process.stdout,
                    'stderr': process.stderr
                })
                
                # Check for output files
                result['outputs'] = self._check_output_files(analyzer['outputs'])
                
            else:
                result.update({
                    'status': 'failed',
                    'progress': 100,
                    'message': f"{analyzer['name']} failed with return code {process.returncode}",
                    'end_time': datetime.now().isoformat(),
                    'stdout': process.stdout,
                    'stderr': process.stderr,
                    'errors': [f"Process failed with return code {process.returncode}"]
                })
            
        except subprocess.TimeoutExpired:
            result.update({
                'status': 'timeout',
                'progress': 100,
                'message': f"{analyzer['name']} timed out after {analyzer['estimated_time']} seconds",
                'end_time': datetime.now().isoformat(),
                'errors': ['Analysis timed out']
            })
            
        except Exception as e:
            result.update({
                'status': 'error',
                'progress': 100,
                'message': f"{analyzer['name']} failed with error: {str(e)}",
                'end_time': datetime.now().isoformat(),
                'errors': [str(e)]
            })
        
        finally:
            self.current_analysis = None
            self._update_progress(analysis_id, 100, result['message'])
        
        return result
    
    def run_analyzer_class(self, analyzer_id: str, analysis_id: str = None) -> Dict[str, Any]:
        """
        Run an analyzer using direct class instantiation (class-based approach)
        
        Args:
            analyzer_id: ID of the analyzer to run
            analysis_id: Unique ID for this analysis run
            
        Returns:
            Dict with analysis results and metadata
        """
        if analyzer_id not in self.analyzers:
            raise ValueError(f"Unknown analyzer: {analyzer_id}")
        
        analyzer = self.analyzers[analyzer_id]
        
        if not analyzer['class']:
            # Fall back to script-based approach
            return self.run_analyzer_script(analyzer_id, analysis_id)
        
        analysis_id = analysis_id or f"{analyzer_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.current_analysis = analysis_id
        
        result = {
            'analysis_id': analysis_id,
            'analyzer_id': analyzer_id,
            'analyzer_name': analyzer['name'],
            'start_time': datetime.now().isoformat(),
            'status': 'running',
            'progress': 0,
            'message': f"Starting {analyzer['name']}...",
            'outputs': {},
            'errors': []
        }
        
        try:
            self._update_progress(analysis_id, 10, "Loading analyzer class...")
            
            # Import the analyzer module and class
            script_path = os.path.join(self.analyzers_dir, analyzer['script'])
            spec = importlib.util.spec_from_file_location("analyzer_module", script_path)
            module = importlib.util.module_from_spec(spec)
            
            # Change to root directory for class execution
            original_cwd = os.getcwd()
            os.chdir(self.root_dir)
            
            spec.loader.exec_module(module)
            
            analyzer_class = getattr(module, analyzer['class'])
            
            self._update_progress(analysis_id, 20, "Initializing analyzer...")
            
            # Create analyzer instance
            analyzer_instance = analyzer_class(data_dir=self.data_dir)
            
            # Add progress callback to analyzer if it supports it
            if hasattr(analyzer_instance, 'add_progress_callback'):
                analyzer_instance.add_progress_callback(
                    lambda p, m: self._update_progress(analysis_id, 20 + (p * 0.7), m)
                )
            
            self._update_progress(analysis_id, 30, "Running analysis...")
            
            # Run the analysis
            if analyzer_id == 'damage_labeling':
                analysis_result = analyzer_instance.run_analysis()
            elif analyzer_id == 'coordinates':
                analysis_result = analyzer_instance.extract_all_coordinates()
            else:
                analysis_result = analyzer_instance.analyze()
            
            # Restore original working directory
            os.chdir(original_cwd)
            
            self._update_progress(analysis_id, 90, "Analysis completed, processing outputs...")
            
            result.update({
                'status': 'completed',
                'progress': 100,
                'message': f"{analyzer['name']} completed successfully",
                'end_time': datetime.now().isoformat(),
                'analysis_result': analysis_result
            })
            
            # Check for output files
            result['outputs'] = self._check_output_files(analyzer['outputs'])
            
        except Exception as e:
            result.update({
                'status': 'error',
                'progress': 100,
                'message': f"{analyzer['name']} failed with error: {str(e)}",
                'end_time': datetime.now().isoformat(),
                'errors': [str(e)]
            })
        
        finally:
            self.current_analysis = None
            self._update_progress(analysis_id, 100, result['message'])
        
        return result
    
    def run_analyzer(self, analyzer_id: str, analysis_id: str = None, use_class: bool = True) -> Dict[str, Any]:
        """
        Run an analyzer with automatic method selection
        
        Args:
            analyzer_id: ID of the analyzer to run
            analysis_id: Unique ID for this analysis run
            use_class: Whether to prefer class-based approach when available
            
        Returns:
            Dict with analysis results and metadata
        """
        analyzer = self.analyzers.get(analyzer_id)
        
        if not analyzer:
            raise ValueError(f"Unknown analyzer: {analyzer_id}")
        
        # Choose execution method
        if use_class and analyzer['class']:
            return self.run_analyzer_class(analyzer_id, analysis_id)
        else:
            return self.run_analyzer_script(analyzer_id, analysis_id)
    
    def _check_output_files(self, expected_outputs: List[str]) -> Dict[str, Any]:
        """Check if expected output files were created"""
        outputs = {}
        
        # Common output locations
        output_locations = [
            self.output_dir,
            self.root_dir,
            os.path.join(self.root_dir, "static")
        ]
        
        for expected in expected_outputs:
            if expected in ['console_output', 'all_outputs']:
                continue
                
            found = False
            for location in output_locations:
                file_path = os.path.join(location, expected)
                if os.path.exists(file_path):
                    outputs[expected] = {
                        'path': file_path,
                        'size': os.path.getsize(file_path),
                        'modified': datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
                    }
                    found = True
                    break
            
            if not found:
                outputs[expected] = {'status': 'not_found'}
        
        return outputs
    
    def get_analysis_status(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Get the current status of an analysis (if it's the current one)"""
        if self.current_analysis == analysis_id:
            return {
                'analysis_id': analysis_id,
                'status': 'running',
                'current': True
            }
        return None
    
    def cancel_analysis(self, analysis_id: str) -> bool:
        """
        Attempt to cancel a running analysis
        Note: This is limited for subprocess-based analyses
        """
        if self.current_analysis == analysis_id:
            # For now, we can't easily cancel subprocess-based analyses
            # In future versions, we could implement process tracking
            return False
        return True


# Convenience functions for backward compatibility
def run_data_info_check() -> Dict[str, Any]:
    """Run data information check"""
    manager = AnalyzerManager()
    return manager.run_analyzer('data_info')

def run_visualization() -> Dict[str, Any]:
    """Run static visualization"""
    manager = AnalyzerManager()
    return manager.run_analyzer('visualization')

def run_web_map() -> Dict[str, Any]:
    """Run interactive web map creation"""
    manager = AnalyzerManager()
    return manager.run_analyzer('web_map')

def run_damage_labeling() -> Dict[str, Any]:
    """Run AI damage assessment"""
    manager = AnalyzerManager()
    return manager.run_analyzer('damage_labeling')

def run_coordinate_extraction() -> Dict[str, Any]:
    """Run coordinate extraction"""
    manager = AnalyzerManager()
    return manager.run_analyzer('coordinates')

def run_full_analysis() -> Dict[str, Any]:
    """Run complete analysis pipeline"""
    manager = AnalyzerManager()
    return manager.run_analyzer('full_analysis')


if __name__ == "__main__":
    # Demo usage
    print("Hatay Earthquake Analyzer Manager Demo")
    print("=" * 50)
    
    manager = AnalyzerManager()
    
    # Check prerequisites
    print("Checking prerequisites...")
    prereqs = manager.check_prerequisites()
    
    for check, status in prereqs.items():
        status_icon = "PASS" if status else "FAIL"
        print(f"  {status_icon} {check}: {status}")
    
    # List available analyzers
    print(f"\nAvailable analyzers:")
    for analyzer_id, info in manager.list_analyzers().items():
        print(f"  • {analyzer_id}: {info['name']}")
        print(f"    {info['description']}")
        print(f"    Estimated time: {info['estimated_time']}s")
        print()