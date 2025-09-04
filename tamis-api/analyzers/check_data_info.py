#!/usr/bin/env python3
"""
Quick data information checker for Hatay earthquake assessment dataset
"""

import os
import rasterio
import geopandas as gpd

def check_data_info():
    """Check and display basic information about the Hatay dataset"""
    
    data_dir = "1c__Hatay_Enkaz_Bina_Etiketleme"
    
    print("HATAY EARTHQUAKE DAMAGE ASSESSMENT DATASET")
    print("=" * 50)
    
    # Check raster files
    for year in ['2015', '2023']:
        img_path = os.path.join(data_dir, f"HATAY MERKEZ-2 {year}.tif")
        
        if os.path.exists(img_path):
            print(f"\n📸 {year} SATELLITE IMAGERY")
            print("-" * 30)
            
            try:
                with rasterio.open(img_path) as src:
                    print(f"File: {os.path.basename(img_path)}")
                    print(f"Size: {os.path.getsize(img_path) / (1024**3):.2f} GB")
                    print(f"Dimensions: {src.width} x {src.height} pixels")
                    print(f"Bands: {src.count}")
                    print(f"Data type: {src.dtypes[0]}")
                    print(f"CRS: {src.crs}")
                    print(f"Resolution: {abs(src.transform[0]):.2f} x {abs(src.transform[4]):.2f} meters/pixel")
                    
                    # Bounds in projected coordinates
                    bounds = src.bounds
                    print(f"Bounds (projected):")
                    print(f"  Left: {bounds.left:.2f}")
                    print(f"  Bottom: {bounds.bottom:.2f}")
                    print(f"  Right: {bounds.right:.2f}")
                    print(f"  Top: {bounds.top:.2f}")
                    
                    # Convert to geographic coordinates for reference
                    from rasterio.warp import transform_bounds
                    geo_bounds = transform_bounds(src.crs, 'EPSG:4326', *bounds)
                    print(f"Bounds (WGS84):")
                    print(f"  West: {geo_bounds[0]:.6f}°")
                    print(f"  South: {geo_bounds[1]:.6f}°")
                    print(f"  East: {geo_bounds[2]:.6f}°")
                    print(f"  North: {geo_bounds[3]:.6f}°")
                    
            except Exception as e:
                print(f"Error reading {img_path}: {e}")
        else:
            print(f"\n{year} imagery not found: {img_path}")
    
    # Check shapefile
    shapefile_path = os.path.join(data_dir, "HATAY MERKEZ-2 SINIR.shp")
    
    if os.path.exists(shapefile_path):
        print(f"\nBOUNDARY DATA")
        print("-" * 30)
        
        try:
            gdf = gpd.read_file(shapefile_path)
            print(f"File: {os.path.basename(shapefile_path)}")
            print(f"Number of features: {len(gdf)}")
            print(f"Geometry type: {gdf.geom_type.iloc[0] if len(gdf) > 0 else 'None'}")
            print(f"CRS: {gdf.crs}")
            print(f"Columns: {list(gdf.columns)}")
            
            if len(gdf) > 0:
                # Calculate total area
                if gdf.crs and gdf.crs.to_string() != 'EPSG:4326':
                    area_sq_m = gdf.geometry.area.sum()
                    area_sq_km = area_sq_m / 1_000_000
                    print(f"Total area: {area_sq_km:.2f} km²")
                
                # Show bounds
                bounds = gdf.total_bounds
                print(f"Bounds:")
                print(f"  Left: {bounds[0]:.2f}")
                print(f"  Bottom: {bounds[1]:.2f}")
                print(f"  Right: {bounds[2]:.2f}")
                print(f"  Top: {bounds[3]:.2f}")
                
                # Show attribute data
                print(f"\nAttribute data preview:")
                print(gdf.head())
                
                # Show data types
                print(f"\nColumn data types:")
                for col in gdf.columns:
                    if col != 'geometry':
                        print(f"  {col}: {gdf[col].dtype}")
                        
        except Exception as e:
            print(f"Error reading shapefile: {e}")
    else:
        print(f"\nShapefile not found: {shapefile_path}")
    
    # List all files in the directory
    print(f"\nALL FILES IN DATASET")
    print("-" * 30)
    
    if os.path.exists(data_dir):
        for root, dirs, files in os.walk(data_dir):
            level = root.replace(data_dir, '').count(os.sep)
            indent = ' ' * 2 * level
            print(f"{indent}{os.path.basename(root)}/")
            subindent = ' ' * 2 * (level + 1)
            for file in files:
                file_path = os.path.join(root, file)
                file_size = os.path.getsize(file_path)
                if file_size < 1024:
                    size_str = f"{file_size} B"
                elif file_size < 1024**2:
                    size_str = f"{file_size/1024:.1f} KB"
                elif file_size < 1024**3:
                    size_str = f"{file_size/(1024**2):.1f} MB"
                else:
                    size_str = f"{file_size/(1024**3):.2f} GB"
                print(f"{subindent}{file} ({size_str})")
    
    print(f"\n{'='*50}")
    print("SUMMARY")
    print(f"{'='*50}")
    print("This dataset contains satellite imagery from Hatay, Turkey")
    print("for earthquake damage assessment comparing 2015 vs 2023.")
    print("\nTo visualize this data, run:")
    print("  python visualize_hatay_data.py")
    print("\nTo create a web map, run:")
    print("  python create_web_map.py")

if __name__ == "__main__":
    check_data_info()
