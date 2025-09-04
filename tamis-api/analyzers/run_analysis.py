#!/usr/bin/env python3
"""
Quick start script for Hatay earthquake damage assessment analysis
This script provides a menu to run different analysis options
"""

import os
import sys
import subprocess

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import rasterio
        import geopandas
        import matplotlib
        import folium
        return True
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Please install required packages with: pip install -r requirements.txt")
        return False

def run_script(script_name):
    """Run a Python script and handle errors"""
    try:
        print(f"\n{'='*60}")
        print(f"Running: {script_name}")
        print(f"{'='*60}")
        
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=False, 
                              text=True)
        
        if result.returncode == 0:
            print(f"\nSUCCESS: {script_name} completed successfully!")
        else:
            print(f"\nFAILED: {script_name} failed with return code: {result.returncode}")
            
    except Exception as e:
        print(f"Error running {script_name}: {e}")

def main(auto_run_all=False):
    """
    Main function to run analysis toolkit
    
    Args:
        auto_run_all (bool): If True, automatically run all analyses without user interaction
    """
    
    print("HATAY EARTHQUAKE DAMAGE ASSESSMENT TOOLKIT")
    print("=" * 60)
    print("This toolkit helps analyze satellite imagery from Hatay, Turkey")
    print("comparing pre-earthquake (2015) vs post-earthquake (2023) conditions.")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        print("\nMissing required packages. Please run:")
        print("   pip install -r requirements.txt")
        return
    
    # Check if data exists
    data_dir = "1c__Hatay_Enkaz_Bina_Etiketleme"
    if not os.path.exists(data_dir):
        print(f"\nData directory not found: {data_dir}")
        print("Please ensure your data is in the correct location.")
        return
    
    print("\nDependencies and data directory found!")
    
    # Check if running in automated mode
    if auto_run_all:
        print("Running in automated mode - executing all analyses...")
        # Run all analysis in order - use absolute paths from analyzers directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        analyses = [
            ("Checking data information...", os.path.join(current_dir, "check_data_info.py")),
            ("Creating static visualization...", os.path.join(current_dir, "visualize_hatay_data.py")),
            ("Creating interactive web map...", os.path.join(current_dir, "create_web_map.py")),
            ("Running AI disaster size labeling...", os.path.join(current_dir, "disaster_labeling.py"))
        ]
        
        for desc, script in analyses:
            print(f"\n{desc}")
            try:
                result = subprocess.run([sys.executable, script], 
                                      capture_output=True, text=True, timeout=300)
                if result.returncode == 0:
                    print(f"PASS {desc} completed successfully")
                else:
                    print(f"FAIL {desc} failed: {result.stderr[:200]}")
            except subprocess.TimeoutExpired:
                print(f"TIMEOUT {desc} timed out after 5 minutes")
            except Exception as e:
                print(f"ERROR {desc}: {e}")
        
        print("\nAll automated analyses completed!")
        return
    
    # Interactive mode
    while True:
        print(f"\n{'='*60}")
        print("ANALYSIS OPTIONS")
        print("=" * 60)
        print("1. Check Data Information (Quick overview)")
        print("2. Create Static Visualization (Recommended)")
        print("3. Create Interactive Web Map")
        print("4. AI Disaster Size Labeling (NEW!)")
        print("5. Run All Analysis")
        print("6. Show Help")
        print("7. Exit")
        print("=" * 60)
        
        choice = input("\nSelect an option (1-7): ").strip()
        
        if choice == '1':
            print("\nChecking data information...")
            run_script("check_data_info.py")
            
        elif choice == '2':
            print("\nCreating static visualization...")
            run_script("visualize_hatay_data.py")
            print("\nOutput: hatay_comparison.png")
            
        elif choice == '3':
            print("\nCreating interactive web map...")
            run_script("create_web_map.py")
            print("\nOutput: hatay_interactive_map.html")
            print("Open the HTML file in your web browser to view the map")
            
        elif choice == '4':
            print("\nRunning AI Disaster Size Labeling...")
            print("This will analyze satellite imagery to automatically detect and")
            print("   classify earthquake damage into severity levels:")
            print("   • Minimal (green) - < 10% change")
            print("   • Moderate (yellow) - 10-30% change") 
            print("   • Severe (orange) - 30-60% change")
            print("   • Catastrophic (red) - > 60% change")
            print("\nProcessing large images with optimized algorithms...")
            run_script("disaster_labeling.py")
            print("\nAI Analysis outputs:")
            print("   • hatay_damage_assessment.png (damage visualization)")
            print("   • hatay_damage_report.json (detailed statistics)")
            
        elif choice == '5':
            print("\nRunning complete analysis...")
            run_script("check_data_info.py")
            run_script("visualize_hatay_data.py") 
            run_script("create_web_map.py")
            run_script("disaster_labeling.py")
            print("\nComplete analysis finished!")
            print("Generated files:")
            print("   • hatay_comparison.png (static visualization)")
            print("   • hatay_interactive_map.html (web map)")
            print("   • hatay_damage_assessment.png (AI damage analysis)")
            print("   • hatay_damage_report.json (damage statistics)")
            
        elif choice == '6':
            print("\nHELP & INFORMATION")
            print("-" * 40)
            print("Dataset: Hatay earthquake damage assessment")
            print("Time period: 2015 (pre) vs 2023 (post-earthquake)")
            print("Purpose: Building and infrastructure damage analysis")
            print("Data format: GeoTIFF imagery + Shapefile boundaries")
            print("\nAnalysis Options:")
            print("• Option 1: Basic data overview and file information")
            print("• Option 2: Side-by-side image comparison (best for analysis)")
            print("• Option 3: Interactive web map (best for exploration)")
            print("• Option 4: AI disaster labeling with damage severity classification")
            print("• Option 5: Complete analysis pipeline (all tools)")
            print("\nAI Features:")
            print("• Automated change detection using SSIM, color, and edge analysis")
            print("• Damage classification: Minimal, Moderate, Severe, Catastrophic")
            print("• Performance optimized for large satellite imagery")
            print("• Detailed statistics and visual overlays")
            print("\nFor detailed documentation, see README.md")
            
        elif choice == '7':
            print("\nExiting toolkit. Thank you for using the analysis tools!")
            break
            
        else:
            print("\nInvalid option. Please select 1-7.")
    
if __name__ == "__main__":
    # Check if script should run in automated mode
    import sys
    auto_mode = len(sys.argv) > 1 and sys.argv[1] == "--auto"
    main(auto_run_all=auto_mode)
