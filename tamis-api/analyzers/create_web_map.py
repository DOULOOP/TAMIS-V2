#!/usr/bin/env python3
"""
Hatay deprem hasar değerlendirme verileri için etkileşimli web haritası oluştur
"""

import os
import folium
import geopandas as gpd
import rasterio
from rasterio.warp import transform_bounds
import numpy as np

def create_web_map():
    """Hatay veri seti için etkileşimli web haritası oluştur"""
    
    data_dir = "1c__Hatay_Enkaz_Bina_Etiketleme"
    boundaries_path = os.path.join(data_dir, "HATAY MERKEZ-2 SINIR.shp")
    
    print("Hatay deprem hasar değerlendirmesi için etkileşimli web haritası oluşturuluyor...")
    print("=" * 70)
    
    # Start with a base map
    print("Harita başlatılıyor...")
    
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
        attr='Esri Dünya Görüntüleri',
        name='Uydu',
        overlay=False,
        control=True
    ).add_to(m)
    
    folium.TileLayer(
        tiles='OpenStreetMap',
        name='Sokak Haritası',
        overlay=False,
        control=True
    ).add_to(m)
    
    # Add boundaries if available
    if os.path.exists(boundaries_path):
        try:
            print("Sınır verileri yükleniyor...")
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
                print(f"Sınırlar {boundaries.crs} sisteminden WGS84'e dönüştürülüyor...")
                boundaries_wgs84 = boundaries.to_crs('EPSG:4326')
            else:
                boundaries_wgs84 = boundaries
            
            # Add boundaries to map
            folium.GeoJson(
                boundaries_wgs84,
                name="Çalışma Alanı Sınırları",
                style_function=lambda x: {
                    'fillColor': 'red',
                    'color': 'darkred',
                    'weight': 3,
                    'fillOpacity': 0.1,
                    'opacity': 0.8
                },
                popup=folium.Popup("Hatay Çalışma Alanı", parse_html=True),
                tooltip="Çalışma Alanı Sınırı"
            ).add_to(m)
            
            # Fit map to boundaries
            bounds = boundaries_wgs84.total_bounds
            m.fit_bounds([[bounds[1], bounds[0]], [bounds[3], bounds[2]]])
            
            print(f"✓ {len(boundaries_wgs84)} sınır özelliği eklendi")
            
        except Exception as e:
            print(f"Uyarı: Sınırlar yüklenemedi: {e}")
    
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
                        <b>{year} Uydu Görüntüsü</b><br>
                        Çözünürlük: {abs(src.transform[0]):.1f}m<br>
                        Boyutlar: {src.width} x {src.height}<br>
                        Bantlar: {src.count}<br>
                        Boyut: {os.path.getsize(img_path)/(1024**3):.2f} GB
                        """,
                        tooltip=f"{year} Görüntü Kapsamı",
                        color='blue' if year == '2015' else 'orange',
                        fill=True,
                        fillOpacity=0.1,
                        weight=2
                    ).add_to(m)
                    
                print(f"✓ {year} görüntü kapsamı eklendi")
                
            except Exception as e:
                print(f"Uyarı: {year} görüntüsü işlenemedi: {e}")
    
    # Add markers for key locations in Hatay
    key_locations = [
        {"name": "Antakya (Hatay Merkezi)", "coords": [36.2012, 36.1611], 
         "description": "İl merkezi ve ana şehir merkezi"},
        {"name": "İskenderun", "coords": [36.5877, 36.1704], 
         "description": "Büyük liman şehri"},
        {"name": "Reyhanlı", "coords": [36.2669, 36.5666], 
         "description": "Suriye ile sınır kasabası"}
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
    <h4>6 Şubat 2023 Depremleri</h4>
    <p><strong>Büyüklük 7.8</strong> - 04:17 yerel saat<br>
    Episantr: Pazarcık, Kahramanmaraş</p>
    <p><strong>Büyüklük 7.5</strong> - 13:24 yerel saat<br>
    Episantr: Elbistan, Kahramanmaraş</p>
    <p>Bu depremler Hatay İli'ni ciddi şekilde etkileyerek, 
    binalarda ve altyapıda yaygın hasara neden olmuştur.</p>
    </div>
    """
    
    folium.Marker(
        location=[36.0, 36.5],  # Approximate epicenter region
        popup=folium.Popup(earthquake_info, max_width=300),
        tooltip="2023 Deprem Bilgileri",
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
    <h4 style="margin: 0;">Hatay Deprem Hasar Değerlendirmesi</h4>
    <p style="margin: 5px 0;">Uydu görüntüsü karşılaştırması: 2015 vs 2023<br>
    <small>Mavi: 2015 görüntü kapsamı | Turuncu: 2023 görüntü kapsamı</small></p>
    </div>
    '''
    m.get_root().html.add_child(folium.Element(title_html))
    
    # Add legend
    legend_html = '''
    <div style="position: fixed; 
                bottom: 50px; left: 50px; width: 200px; height: 120px; 
                background-color: white; border:2px solid grey; z-index:9999; 
                font-size:12px; padding: 10px;">
    <h5 style="margin: 0;">Lejant</h5>
    <p style="margin: 3px 0;"><span style="color: darkred;">■</span> Çalışma Alanı</p>
    <p style="margin: 3px 0;"><span style="color: blue;">■</span> 2015 Görüntüsü</p>
    <p style="margin: 3px 0;"><span style="color: orange;">■</span> 2023 Görüntüsü</p>
    <p style="margin: 3px 0;"><span style="color: red;">📍</span> Şehirler</p>
    <p style="margin: 3px 0;"><span style="color: black;">⚠</span> Deprem Bilgisi</p>
    </div>
    '''
    m.get_root().html.add_child(folium.Element(legend_html))
    
    # Save the map

    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "hatay_interactive_map.html")
    m.save(output_file)
    
    print(f"\n✓ Etkileşimli harita kaydedildi: {output_file}")
    print(f"\nEtkileşimli haritayı görüntülemek için {output_file} dosyasını web tarayıcınızda açın.")
    
    # Print summary
    print(f"\n{'='*70}")
    print("HARİTA ÖZELLİKLERİ:")
    print("• Çalışma alanı sınırları")
    print("• Uydu görüntü kapsamları (2015 vs 2023)")
    print("• Önemli şehirler ve deprem episantr bilgileri")
    print("• Çoklu temel harita katmanları (Sokak haritası, Uydu)")
    print("• Detaylı bilgilerle etkileşimli açılır pencereler")
    
    if raster_info:
        print(f"\nGÖRÜNTÜ KAPSAMI:")
        for year, info in raster_info.items():
            print(f"• {year}: {info['width']}x{info['height']} piksel, {info['resolution']:.1f}m çözünürlük")
    
    return output_file

if __name__ == "__main__":
    create_web_map()
