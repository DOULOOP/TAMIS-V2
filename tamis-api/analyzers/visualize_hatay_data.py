#!/usr/bin/env python3
"""
Hatay Deprem Hasar Değerlendirme Veri Görselleştirmesi
2015 (deprem öncesi) ve 2023 (deprem sonrası) uydu görüntülerini karşılaştırır
"""

import os
import rasterio
import geopandas as gpd
import matplotlib.pyplot as plt
from rasterio.plot import show
import numpy as np

def main():
    # Set the data directory
    data_dir = "C:\\Users\\furka\\Desktop\\TAMIS-V2\\tamis-api\\1c__Hatay_Enkaz_Bina_Etiketleme"

    # File paths
    img_2015_path = os.path.join(data_dir, "HATAY MERKEZ-2 2015.tif")
    img_2023_path = os.path.join(data_dir, "HATAY MERKEZ-2 2023.tif")
    boundaries_path = os.path.join(data_dir, "HATAY MERKEZ-2 SINIR.shp")
    
    # Check if files exist
    files_to_check = [img_2015_path, img_2023_path, boundaries_path]
    for file_path in files_to_check:
        if not os.path.exists(file_path):
            print(f"Hata: Dosya bulunamadı: {file_path}")
            return
    
    print("Hatay deprem hasar değerlendirme verileri okunuyor...")
    print("=" * 60)
    
    # Read the boundary shapefile
    print("Sınır verileri yükleniyor...")
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
        print(f"✓ Sınır şekil dosyası başarıyla yüklendi")
        print(f"  - Özellik sayısı: {len(boundaries)}")
        print(f"  - Geometri türü: {boundaries.geom_type.iloc[0] if len(boundaries) > 0 else 'Hiçbiri'}")
        print(f"  - CRS: {boundaries.crs}")
        print(f"  - Sütunlar: {list(boundaries.columns)}")
        
        if len(boundaries) > 0:
            print("\nSınır veri önizlemesi:")
            print(boundaries.head())
            
    except Exception as e:
        print(f"Sınır dosyası okuma hatası: {e}")
        boundaries = None
    
    # Read and display satellite imagery
    print(f"\n{'='*60}")
    print("Uydu görüntüleri yükleniyor...")
    
    try:
        # Create figure for side-by-side comparison
        fig, axes = plt.subplots(1, 2, figsize=(16, 8))
        fig.suptitle('Hatay Uydu Görüntüsü Karşılaştırması: Deprem Öncesi vs Sonrası', fontsize=16, fontweight='bold')
        
        # Display 2015 imagery (pre-earthquake)
        print("2015 görüntüsü (deprem öncesi) yükleniyor...")
        with rasterio.open(img_2015_path) as src_2015:
            print(f"  - Boyutlar: {src_2015.width} x {src_2015.height}")
            print(f"  - Bantlar: {src_2015.count}")
            print(f"  - CRS: {src_2015.crs}")
            print(f"  - Sınırlar: {src_2015.bounds}")
            
            # Read with downsampling if image is too large
            if src_2015.width * src_2015.height > 50_000_000:  # > 50M pixels
                print("  - Büyük görüntü algılandı, görüntüleme için örnekleme yapılıyor...")
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
            
            axes[0].set_title('2015 (Deprem Öncesi)', fontsize=14, fontweight='bold')
        
        # Display 2023 imagery (post-earthquake)
        print("\n2023 görüntüsü (deprem sonrası) yükleniyor...")
        with rasterio.open(img_2023_path) as src_2023:
            print(f"  - Boyutlar: {src_2023.width} x {src_2023.height}")
            print(f"  - Bantlar: {src_2023.count}")
            print(f"  - CRS: {src_2023.crs}")
            print(f"  - Sınırlar: {src_2023.bounds}")
            
            # Read with downsampling if image is too large
            if src_2023.width * src_2023.height > 50_000_000:  # > 50M pixels
                print("  - Büyük görüntü algılandı, görüntüleme için örnekleme yapılıyor...")
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
            
            axes[1].set_title('2023 (Deprem Sonrası)', fontsize=14, fontweight='bold')
        
        # Overlay boundaries if available and in compatible CRS
        if boundaries is not None:
            try:
                # Convert boundaries to same CRS as raster if needed
                with rasterio.open(img_2015_path) as src:
                    raster_crs = src.crs
                
                if boundaries.crs != raster_crs:
                    print(f"Sınırlar {boundaries.crs} sisteminden {raster_crs} sistemine dönüştürülüyor")
                    boundaries_proj = boundaries.to_crs(raster_crs)
                else:
                    boundaries_proj = boundaries
                
                # Plot boundaries on both images
                boundaries_proj.plot(ax=axes[0], facecolor='none', edgecolor='red', linewidth=2, alpha=0.8)
                boundaries_proj.plot(ax=axes[1], facecolor='none', edgecolor='red', linewidth=2, alpha=0.8)
                print("✓ Sınırlar görüntülerin üzerine yerleştirildi")
                
            except Exception as e:
                print(f"Uyarı: Sınırlar yerleştirilemedi: {e}")
        
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
        print(f"\n✓ Görselleştirme kaydedildi: {output_file}")
        
        # Show the plot
        plt.show()
        
    except Exception as e:
        print(f"Görüntü işleme hatası: {e}")
    
    print(f"\n{'='*60}")
    print("Analiz tamamlandı!")
    print("\nBu veri seti şunları içeriyor gibi görünüyor:")
    print("• 2015'ten deprem öncesi uydu görüntüleri")
    print("• 2023'ten deprem sonrası uydu görüntüleri") 
    print("• İdari/çalışma alanı sınırları")
    print("\nBu veriyi şunlar için kullanın:")
    print("• Hasarlı binaları ve altyapıyı belirleyin")
    print("• Depremin kentsel çevre üzerindeki etkisini değerlendirin")
    print("• İyileştirme ve yeniden yapılanma çalışmalarını planlayın")

if __name__ == "__main__":
    main()
