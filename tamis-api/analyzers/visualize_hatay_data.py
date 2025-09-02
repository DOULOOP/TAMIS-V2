#!/usr/bin/env python3
"""
Hatay Earthquake Damage Assessment Data Visualization
Compares satellite imagery from 2015 (pre-earthquake) and 2023 (post-earthquake)
"""

import os
import rasterio
import geopandas as gpd
import matplotlib.pyplot as plt
from rasterio.plot import show
import numpy as np

def main():
    # Set the data directory
    data_dir = "1c__Hatay_Enkaz_Bina_Etiketleme"
    
    # File paths
    img_2015_path = os.path.join(data_dir, "HATAY MERKEZ-2 2015.tif")
    img_2023_path = os.path.join(data_dir, "HATAY MERKEZ-2 2023.tif")
    boundaries_path = os.path.join(data_dir, "HATAY MERKEZ-2 SINIR.shp")
    
    # Check if files exist
    files_to_check = [img_2015_path, img_2023_path, boundaries_path]
    for file_path in files_to_check:
        if not os.path.exists(file_path):
            print(f"Error: File not found: {file_path}")
            return
    
    print("Reading Hatay earthquake damage assessment data...")
    print("=" * 60)
    
    # Read the boundary shapefile
    print("Loading boundary data...")
    try:
        # Try different encodings for the shapefile
        for encoding in ['utf-8', 'latin1', 'cp1252', 'iso-8859-1']:
            try:
                boundaries = gpd.read_file(boundaries_path, encoding=encoding)
                break
            except UnicodeDecodeError:
                continue
        else:
            # If all encodings fail, try without specifying encoding
            boundaries = gpd.read_file(boundaries_path)
        print(f"✓ Boundary shapefile loaded successfully")
        print(f"  - Number of features: {len(boundaries)}")
        print(f"  - Geometry type: {boundaries.geom_type.iloc[0] if len(boundaries) > 0 else 'None'}")
        print(f"  - CRS: {boundaries.crs}")
        print(f"  - Columns: {list(boundaries.columns)}")
        
        if len(boundaries) > 0:
            print("\nBoundary data preview:")
            print(boundaries.head())
            
    except Exception as e:
        print(f"Error reading boundary file: {e}")
        boundaries = None
    
    # Read and display satellite imagery
    print(f"\n{'='*60}")
    print("Loading satellite imagery...")
    
    try:
        # Create figure for side-by-side comparison
        fig, axes = plt.subplots(1, 2, figsize=(16, 8))
        fig.suptitle('Hatay Satellite Imagery Comparison: Pre vs Post Earthquake', fontsize=16, fontweight='bold')
        
        # Display 2015 imagery (pre-earthquake)
        print("Loading 2015 imagery (pre-earthquake)...")
        with rasterio.open(img_2015_path) as src_2015:
            print(f"  - Dimensions: {src_2015.width} x {src_2015.height}")
            print(f"  - Bands: {src_2015.count}")
            print(f"  - CRS: {src_2015.crs}")
            print(f"  - Bounds: {src_2015.bounds}")
            
            # Read with downsampling if image is too large
            if src_2015.width * src_2015.height > 50_000_000:  # > 50M pixels
                print("  - Large image detected, downsampling for display...")
                downsample_factor = max(1, int(np.sqrt((src_2015.width * src_2015.height) / 10_000_000)))
                data_2015 = src_2015.read(out_shape=(src_2015.count, 
                                                   src_2015.height // downsample_factor,
                                                   src_2015.width // downsample_factor))
                # Create a transform for the downsampled data
                from rasterio.transform import Affine
                new_transform = src_2015.transform * Affine.scale(downsample_factor)
                
                # Display the downsampled image
                axes[0].imshow(np.transpose(data_2015[[2,1,0]], (1,2,0)), 
                              extent=[src_2015.bounds.left, src_2015.bounds.right,
                                     src_2015.bounds.bottom, src_2015.bounds.top])
            else:
                # Display the image normally
                show(src_2015, ax=axes[0])
            
            axes[0].set_title('2015 (Pre-Earthquake)', fontsize=14, fontweight='bold')
        
        # Display 2023 imagery (post-earthquake)
        print("\nLoading 2023 imagery (post-earthquake)...")
        with rasterio.open(img_2023_path) as src_2023:
            print(f"  - Dimensions: {src_2023.width} x {src_2023.height}")
            print(f"  - Bands: {src_2023.count}")
            print(f"  - CRS: {src_2023.crs}")
            print(f"  - Bounds: {src_2023.bounds}")
            
            # Read with downsampling if image is too large
            if src_2023.width * src_2023.height > 50_000_000:  # > 50M pixels
                print("  - Large image detected, downsampling for display...")
                downsample_factor = max(1, int(np.sqrt((src_2023.width * src_2023.height) / 10_000_000)))
                data_2023 = src_2023.read(out_shape=(src_2023.count, 
                                                   src_2023.height // downsample_factor,
                                                   src_2023.width // downsample_factor))
                
                # Display the downsampled image
                axes[1].imshow(np.transpose(data_2023[[2,1,0]], (1,2,0)), 
                              extent=[src_2023.bounds.left, src_2023.bounds.right,
                                     src_2023.bounds.bottom, src_2023.bounds.top])
            else:
                # Display the image normally
                show(src_2023, ax=axes[1])
            
            axes[1].set_title('2023 (Post-Earthquake)', fontsize=14, fontweight='bold')
        
        # Overlay boundaries if available and in compatible CRS
        if boundaries is not None:
            try:
                # Convert boundaries to same CRS as raster if needed
                with rasterio.open(img_2015_path) as src:
                    raster_crs = src.crs
                
                if boundaries.crs != raster_crs:
                    print(f"Converting boundaries from {boundaries.crs} to {raster_crs}")
                    boundaries_proj = boundaries.to_crs(raster_crs)
                else:
                    boundaries_proj = boundaries
                
                # Plot boundaries on both images
                boundaries_proj.plot(ax=axes[0], facecolor='none', edgecolor='red', linewidth=2, alpha=0.8)
                boundaries_proj.plot(ax=axes[1], facecolor='none', edgecolor='red', linewidth=2, alpha=0.8)
                print("✓ Boundaries overlaid on imagery")
                
            except Exception as e:
                print(f"Warning: Could not overlay boundaries: {e}")
        
        # Improve plot appearance
        for ax in axes:
            ax.set_aspect('equal')
            ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # Save the plot
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(output_dir, "hatay_comparison.png")
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"\n✓ Visualization saved as: {output_file}")
        
        # Show the plot
        plt.show()
        
    except Exception as e:
        print(f"Error processing imagery: {e}")
    
    print(f"\n{'='*60}")
    print("Analysis complete!")
    print("\nThis dataset appears to contain:")
    print("• Pre-earthquake satellite imagery from 2015")
    print("• Post-earthquake satellite imagery from 2023") 
    print("• Administrative/study area boundaries")
    print("\nUse this data to:")
    print("• Identify damaged buildings and infrastructure")
    print("• Assess earthquake impact on the urban environment")
    print("• Plan recovery and reconstruction efforts")

if __name__ == "__main__":
    main()
