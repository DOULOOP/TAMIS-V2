#!/usr/bin/env python3
"""
Create an interactive web map for the Hatay earthquake damage assessment data
"""

import os
import folium
import geopandas as gpd
import rasterio
from rasterio.warp import transform_bounds
import numpy as np

def create_web_map():
    """Create an interactive web map of the Hatay dataset"""
    
    data_dir = "1c__Hatay_Enkaz_Bina_Etiketleme"
    boundaries_path = os.path.join(data_dir, "HATAY MERKEZ-2 SINIR.shp")
    
    print("Creating interactive web map for Hatay earthquake damage assessment...")
    print("=" * 70)
    
    # Start with a base map
    print("Initializing map...")
    
    # Default center for Hatay, Turkey
    hatay_center = [36.2012, 36.1611]  # Approximate center of Hatay
    m = folium.Map(
        location=hatay_center,
        zoom_start=10,
        tiles='OpenStreetMap'
    )
    
    # Add different base map options
    folium.TileLayer(
        tiles='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attr='Esri World Imagery',
        name='Satellite',
        overlay=False,
        control=True
    ).add_to(m)
    
    folium.TileLayer(
        tiles='OpenStreetMap',
        name='Street Map',
        overlay=False,
        control=True
    ).add_to(m)
    
    # Add boundaries if available
    if os.path.exists(boundaries_path):
        try:
            print("Loading boundary data...")
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
            
            # Convert to WGS84 for web mapping
            if boundaries.crs != 'EPSG:4326':
                print(f"Converting boundaries from {boundaries.crs} to WGS84...")
                boundaries_wgs84 = boundaries.to_crs('EPSG:4326')
            else:
                boundaries_wgs84 = boundaries
            
            # Add boundaries to map
            folium.GeoJson(
                boundaries_wgs84,
                name="Study Area Boundaries",
                style_function=lambda x: {
                    'fillColor': 'red',
                    'color': 'darkred',
                    'weight': 3,
                    'fillOpacity': 0.1,
                    'opacity': 0.8
                },
                popup=folium.Popup("Hatay Study Area", parse_html=True),
                tooltip="Study Area Boundary"
            ).add_to(m)
            
            # Fit map to boundaries
            bounds = boundaries_wgs84.total_bounds
            m.fit_bounds([[bounds[1], bounds[0]], [bounds[3], bounds[2]]])
            
            print(f"✓ Added {len(boundaries_wgs84)} boundary feature(s)")
            
        except Exception as e:
            print(f"Warning: Could not load boundaries: {e}")
    
    # Add raster information as popups
    raster_info = {}
    for year in ['2015', '2023']:
        img_path = os.path.join(data_dir, f"HATAY MERKEZ-2 {year}.tif")
        
        if os.path.exists(img_path):
            try:
                with rasterio.open(img_path) as src:
                    # Get bounds in WGS84
                    bounds_wgs84 = transform_bounds(src.crs, 'EPSG:4326', *src.bounds)
                    
                    raster_info[year] = {
                        'bounds': bounds_wgs84,
                        'width': src.width,
                        'height': src.height,
                        'bands': src.count,
                        'resolution': abs(src.transform[0])
                    }
                    
                    # Add raster extent as rectangle
                    folium.Rectangle(
                        bounds=[[bounds_wgs84[1], bounds_wgs84[0]], 
                               [bounds_wgs84[3], bounds_wgs84[2]]],
                        popup=f"""
                        <b>{year} Satellite Imagery</b><br>
                        Resolution: {abs(src.transform[0]):.1f}m<br>
                        Dimensions: {src.width} x {src.height}<br>
                        Bands: {src.count}<br>
                        Size: {os.path.getsize(img_path)/(1024**3):.2f} GB
                        """,
                        tooltip=f"{year} Imagery Extent",
                        color='blue' if year == '2015' else 'orange',
                        fill=True,
                        fillOpacity=0.1,
                        weight=2
                    ).add_to(m)
                    
                print(f"✓ Added {year} imagery extent")
                
            except Exception as e:
                print(f"Warning: Could not process {year} imagery: {e}")
    
    # Add markers for key locations in Hatay
    key_locations = [
        {"name": "Antakya (Hatay Center)", "coords": [36.2012, 36.1611], 
         "description": "Provincial capital and main urban center"},
        {"name": "İskenderun", "coords": [36.5877, 36.1704], 
         "description": "Major port city"},
        {"name": "Reyhanlı", "coords": [36.2669, 36.5666], 
         "description": "Border town with Syria"}
    ]
    
    for location in key_locations:
        folium.Marker(
            location=location["coords"],
            popup=f"<b>{location['name']}</b><br>{location['description']}",
            tooltip=location["name"],
            icon=folium.Icon(color='red', icon='info-sign')
        ).add_to(m)
    
    # Add earthquake information
    earthquake_info = """
    <div style='width: 300px;'>
    <h4>February 6, 2023 Earthquakes</h4>
    <p><strong>Magnitude 7.8</strong> - 04:17 local time<br>
    Epicenter: Pazarcık, Kahramanmaraş</p>
    <p><strong>Magnitude 7.5</strong> - 13:24 local time<br>
    Epicenter: Elbistan, Kahramanmaraş</p>
    <p>These earthquakes severely affected Hatay Province, 
    causing widespread damage to buildings and infrastructure.</p>
    </div>
    """
    
    folium.Marker(
        location=[36.0, 36.5],  # Approximate epicenter region
        popup=folium.Popup(earthquake_info, max_width=300),
        tooltip="2023 Earthquake Information",
        icon=folium.Icon(color='black', icon='warning-sign')
    ).add_to(m)
    
    # Add layer control
    folium.LayerControl().add_to(m)
    
    # Add title and description
    title_html = '''
    <div style="position: fixed; 
                top: 10px; left: 50px; width: 400px; height: 90px; 
                background-color: white; border:2px solid grey; z-index:9999; 
                font-size:14px; padding: 10px;">
    <h4 style="margin: 0;">Hatay Earthquake Damage Assessment</h4>
    <p style="margin: 5px 0;">Satellite imagery comparison: 2015 vs 2023<br>
    <small>Blue: 2015 imagery extent | Orange: 2023 imagery extent</small></p>
    </div>
    '''
    m.get_root().html.add_child(folium.Element(title_html))
    
    # Add legend
    legend_html = '''
    <div style="position: fixed; 
                bottom: 50px; left: 50px; width: 200px; height: 120px; 
                background-color: white; border:2px solid grey; z-index:9999; 
                font-size:12px; padding: 10px;">
    <h5 style="margin: 0;">Legend</h5>
    <p style="margin: 3px 0;"><span style="color: darkred;">■</span> Study Area</p>
    <p style="margin: 3px 0;"><span style="color: blue;">■</span> 2015 Imagery</p>
    <p style="margin: 3px 0;"><span style="color: orange;">■</span> 2023 Imagery</p>
    <p style="margin: 3px 0;"><span style="color: red;">📍</span> Cities</p>
    <p style="margin: 3px 0;"><span style="color: black;">⚠</span> Earthquake Info</p>
    </div>
    '''
    m.get_root().html.add_child(folium.Element(legend_html))
    
    # Save the map

    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "hatay_interactive_map.html")
    m.save(output_file)
    
    print(f"\n✓ Interactive map saved as: {output_file}")
    print(f"\nOpen {output_file} in your web browser to view the interactive map.")
    
    # Print summary
    print(f"\n{'='*70}")
    print("MAP FEATURES:")
    print("• Study area boundaries")
    print("• Satellite imagery extents (2015 vs 2023)")
    print("• Key cities and earthquake epicenter information")
    print("• Multiple base map layers (Street map, Satellite)")
    print("• Interactive popups with detailed information")
    
    if raster_info:
        print(f"\nIMAGERY COVERAGE:")
        for year, info in raster_info.items():
            print(f"• {year}: {info['width']}x{info['height']} pixels, {info['resolution']:.1f}m resolution")
    
    return output_file

if __name__ == "__main__":
    create_web_map()
