#!/usr/bin/env python3
"""
Hatay deprem hasar değerlendirme analizi için hızlı başlangıç betiği
Bu betik farklı analiz seçeneklerini çalıştırmak için bir menü sağlar
"""

import os
import sys
import subprocess

def check_dependencies():
    """Gerekli paketlerin yüklenip yüklenmediğini kontrol et"""
    try:
        import rasterio
        import geopandas
        import matplotlib
        import folium
        return True
    except ImportError as e:
        print(f"Eksik bağımlılık: {e}")
        print("Lütfen gerekli paketleri yükleyin: pip install -r requirements.txt")
        return False

def run_script(script_name):
    """Python betiğini çalıştır ve hataları işle"""
    try:
        print(f"\n{'='*60}")
        print(f"Çalıştırılıyor: {script_name}")
        print(f"{'='*60}")
        
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=False, 
                              text=True)
        
        if result.returncode == 0:
            print(f"\nBAŞARILI: {script_name} başarıyla tamamlandı!")
        else:
            print(f"\nBAŞARISIZ: {script_name} dönüş kodu ile başarısız oldu: {result.returncode}")
            
    except Exception as e:
        print(f"{script_name} çalıştırma hatası: {e}")

def main(auto_run_all=False):
    """
    Analiz araç setini çalıştırmak için ana fonksiyon
    
    Args:
        auto_run_all (bool): True ise, kullanıcı etkileşimi olmadan otomatik olarak tüm analizleri çalıştır
    """
    
    print("HATAY DEPREM HASAR DEĞERLENDİRME ARAÇ SETİ")
    print("=" * 60)
    print("Bu araç seti Hatay, Türkiye'den uydu görüntülerini analiz etmeye yardımcı olur")
    print("deprem öncesi (2015) ve deprem sonrası (2023) koşulları karşılaştırır.")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        print("\nGerekli paketler eksik. Lütfen çalıştırın:")
        print("   pip install -r requirements.txt")
        return
    
    # Check if data exists
    data_dir = "1c__Hatay_Enkaz_Bina_Etiketleme"
    if not os.path.exists(data_dir):
        print(f"\nVeri dizini bulunamadı: {data_dir}")
        print("Lütfen verilerinizin doğru konumda olduğundan emin olun.")
        return
    
    print("\nBağımlılıklar ve veri dizini bulundu!")
    
    # Check if running in automated mode
    if auto_run_all:
        print("Otomatik modda çalışıyor - tüm analizler yürütülüyor...")
        # Run all analysis in order - use absolute paths from analyzers directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        analyses = [
            ("Veri bilgileri kontrol ediliyor...", os.path.join(current_dir, "check_data_info.py")),
            ("Statik görselleştirme oluşturuluyor...", os.path.join(current_dir, "visualize_hatay_data.py")),
            ("Etkileşimli web haritası oluşturuluyor...", os.path.join(current_dir, "create_web_map.py")),
            ("AI afet boyutu etiketleme çalışıyor...", os.path.join(current_dir, "disaster_labeling.py"))
        ]
        
        for desc, script in analyses:
            print(f"\n{desc}")
            try:
                result = subprocess.run([sys.executable, script], 
                                      capture_output=True, text=True, timeout=300)
                if result.returncode == 0:
                    print(f"BAŞARILI {desc} başarıyla tamamlandı")
                else:
                    print(f"BAŞARISIZ {desc} başarısız: {result.stderr[:200]}")
            except subprocess.TimeoutExpired:
                print(f"ZAMAN AŞIMI {desc} 5 dakika sonra zaman aşımına uğradı")
            except Exception as e:
                print(f"HATA {desc}: {e}")
        
        print("\nTüm otomatik analizler tamamlandı!")
        return
    
    # Interactive mode
    while True:
        print(f"\n{'='*60}")
        print("ANALİZ SEÇENEKLERİ")
        print("=" * 60)
        print("1. Veri Bilgilerini Kontrol Et (Hızlı genel bakış)")
        print("2. Statik Görselleştirme Oluştur (Önerilen)")
        print("3. Etkileşimli Web Haritası Oluştur")
        print("4. AI Afet Boyutu Etiketleme (YENİ!)")
        print("5. Tüm Analizleri Çalıştır")
        print("6. Yardımı Göster")
        print("7. Çıkış")
        print("=" * 60)
        
        choice = input("\nBir seçenek seçin (1-7): ").strip()
        
        if choice == '1':
            print("\nVeri bilgileri kontrol ediliyor...")
            run_script("check_data_info.py")
            
        elif choice == '2':
            print("\nStatik görselleştirme oluşturuluyor...")
            run_script("visualize_hatay_data.py")
            print("\nÇıktı: hatay_comparison.png")
            
        elif choice == '3':
            print("\nEtkileşimli web haritası oluşturuluyor...")
            run_script("create_web_map.py")
            print("\nÇıktı: hatay_interactive_map.html")
            print("Haritayı görüntülemek için HTML dosyasını web tarayıcınızda açın")
            
        elif choice == '4':
            print("\nAI Afet Boyutu Etiketleme çalışıyor...")
            print("Bu, deprem hasarını otomatik olarak tespit etmek ve")
            print("   hasar şiddet seviyelerine göre sınıflandırmak için uydu görüntülerini analiz edecek:")
            print("   • Minimal (yeşil) - < %10 değişiklik")
            print("   • Orta (sarı) - %10-30 değişiklik") 
            print("   • Ciddi (turuncu) - %30-60 değişiklik")
            print("   • Felaket (kırmızı) - > %60 değişiklik")
            print("\nOptimize edilmiş algoritmalar ile büyük görüntüler işleniyor...")
            run_script("disaster_labeling.py")
            print("\nAI Analiz çıktıları:")
            print("   • hatay_damage_assessment.png (hasar görselleştirmesi)")
            print("   • hatay_damage_report.json (detaylı istatistikler)")
            
        elif choice == '5':
            print("\nKapsamlı analiz çalışıyor...")
            run_script("check_data_info.py")
            run_script("visualize_hatay_data.py") 
            run_script("create_web_map.py")
            run_script("disaster_labeling.py")
            print("\nKapsamlı analiz tamamlandı!")
            print("Oluşturulan dosyalar:")
            print("   • hatay_comparison.png (statik görselleştirme)")
            print("   • hatay_interactive_map.html (web haritası)")
            print("   • hatay_damage_assessment.png (AI hasar analizi)")
            print("   • hatay_damage_report.json (hasar istatistikleri)")
            
        elif choice == '6':
            print("\nYARDIM VE BİLGİ")
            print("-" * 40)
            print("Veri seti: Hatay deprem hasar değerlendirmesi")
            print("Zaman periyodu: 2015 (öncesi) vs 2023 (deprem sonrası)")
            print("Amaç: Bina ve altyapı hasar analizi")
            print("Veri formatı: GeoTIFF görüntü + Shapefile sınırlar")
            print("\nAnaliz Seçenekleri:")
            print("• Seçenek 1: Temel veri genel bakış ve dosya bilgileri")
            print("• Seçenek 2: Yan yana görüntü karşılaştırması (analiz için en iyi)")
            print("• Seçenek 3: Etkileşimli web haritası (keşif için en iyi)")
            print("• Seçenek 4: Hasar şiddeti sınıflandırması ile AI afet etiketleme")
            print("• Seçenek 5: Kapsamlı analiz ardışık düzeni (tüm araçlar)")
            print("\nAI Özellikleri:")
            print("• SSIM, renk ve kenar analizi kullanarak otomatik değişiklik tespiti")
            print("• Hasar sınıflandırması: Minimal, Orta, Ciddi, Felaket")
            print("• Büyük uydu görüntüleri için performans optimize edildi")
            print("• Detaylı istatistikler ve görsel katmanlar")
            print("\nDetaylı dokümantasyon için README.md dosyasına bakın")
            
        elif choice == '7':
            print("\nAraç setinden çıkılıyor. Analiz araçlarını kullandığınız için teşekkürler!")
            break
            
        else:
            print("\nGeçersiz seçenek. Lütfen 1-7 arası seçin.")
    
if __name__ == "__main__":
    # Check if script should run in automated mode
    import sys
    auto_mode = len(sys.argv) > 1 and sys.argv[1] == "--auto"
    main(auto_run_all=auto_mode)
