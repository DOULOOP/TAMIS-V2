#!/usr/bin/env python3
"""
Hatay deprem değerlendirme veri seti için hızlı veri bilgileri kontrolcüsü
"""

import os
import rasterio
import geopandas as gpd

def check_data_info():
    """Hatay veri seti hakkında temel bilgileri kontrol et ve göster"""
    
    data_dir = "1c__Hatay_Enkaz_Bina_Etiketleme"
    
    print("HATAY DEPREM HASAR DEĞERLENDİRME VERİ SETİ")
    print("=" * 50)
    
    # Check raster files
    for year in ['2015', '2023']:
        img_path = os.path.join(data_dir, f"HATAY MERKEZ-2 {year}.tif")
        
        if os.path.exists(img_path):
            print(f"\n📸 {year} UYDU GÖRÜNTÜLERİ")
            print("-" * 30)
            
            try:
                with rasterio.open(img_path) as src:
                    print(f"Dosya: {os.path.basename(img_path)}")
                    print(f"Boyut: {os.path.getsize(img_path) / (1024**3):.2f} GB")
                    print(f"Boyutlar: {src.width} x {src.height} piksel")
                    print(f"Bantlar: {src.count}")
                    print(f"Veri türü: {src.dtypes[0]}")
                    print(f"KRS: {src.crs}")
                    print(f"Çözünürlük: {abs(src.transform[0]):.2f} x {abs(src.transform[4]):.2f} metre/piksel")
                    
                    # Bounds in projected coordinates
                    bounds = src.bounds
                    print(f"Sınırlar (projekte edilmiş):")
                    print(f"  Sol: {bounds.left:.2f}")
                    print(f"  Alt: {bounds.bottom:.2f}")
                    print(f"  Sağ: {bounds.right:.2f}")
                    print(f"  Üst: {bounds.top:.2f}")
                    
                    # Convert to geographic coordinates for reference
                    from rasterio.warp import transform_bounds
                    geo_bounds = transform_bounds(src.crs, 'EPSG:4326', *bounds)
                    print(f"Sınırlar (WGS84):")
                    print(f"  Batı: {geo_bounds[0]:.6f}°")
                    print(f"  Güney: {geo_bounds[1]:.6f}°")
                    print(f"  Doğu: {geo_bounds[2]:.6f}°")
                    print(f"  Kuzey: {geo_bounds[3]:.6f}°")
                    
            except Exception as e:
                print(f"{img_path} okunurken hata: {e}")
        else:
            print(f"\n{year} görüntüleri bulunamadı: {img_path}")
    
    # Check shapefile
    shapefile_path = os.path.join(data_dir, "HATAY MERKEZ-2 SINIR.shp")
    
    if os.path.exists(shapefile_path):
        print(f"\n🗺️ SINIR VERİLERİ")
        print("-" * 30)
        
        try:
            gdf = gpd.read_file(shapefile_path)
            print(f"Dosya: {os.path.basename(shapefile_path)}")
            print(f"Özellik sayısı: {len(gdf)}")
            print(f"Geometri türü: {gdf.geom_type.iloc[0] if len(gdf) > 0 else 'Yok'}")
            print(f"KRS: {gdf.crs}")
            print(f"Sütunlar: {list(gdf.columns)}")
            
            if len(gdf) > 0:
                # Calculate total area
                if gdf.crs and gdf.crs.to_string() != 'EPSG:4326':
                    area_sq_m = gdf.geometry.area.sum()
                    area_sq_km = area_sq_m / 1_000_000
                    print(f"Toplam alan: {area_sq_km:.2f} km²")
                
                # Show bounds
                bounds = gdf.total_bounds
                print(f"Sınırlar:")
                print(f"  Sol: {bounds[0]:.2f}")
                print(f"  Alt: {bounds[1]:.2f}")
                print(f"  Sağ: {bounds[2]:.2f}")
                print(f"  Üst: {bounds[3]:.2f}")
                
                # Show attribute data
                print(f"\nÖzellik verisi önizlemesi:")
                print(gdf.head())
                
                # Show data types
                print(f"\nSütun veri türleri:")
                for col in gdf.columns:
                    if col != 'geometry':
                        print(f"  {col}: {gdf[col].dtype}")
                        
        except Exception as e:
            print(f"Shapefile okunurken hata: {e}")
    else:
        print(f"\nShapefile bulunamadı: {shapefile_path}")
    
    # List all files in the directory
    print(f"\nVERİ SETİNDEKİ TÜM DOSYALAR")
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
    print("ÖZET")
    print(f"{'='*50}")
    print("Bu veri seti, 2015 ile 2023 karşılaştırmalı deprem hasar")
    print("değerlendirmesi için Hatay, Türkiye'den uydu görüntüleri içerir.")
    print("\nBu veriyi görselleştirmek için çalıştırın:")
    print("  python visualize_hatay_data.py")
    print("\nWeb haritası oluşturmak için çalıştırın:")
    print("  python create_web_map.py")

if __name__ == "__main__":
    check_data_info()
