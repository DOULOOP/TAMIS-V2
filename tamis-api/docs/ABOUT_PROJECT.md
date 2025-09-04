# Hatay Deprem Hasar Değerlendirme Projesi

## 🌍 Proje Genel Bakış

Bu proje, yıkıcı Şubat 2023 depremlerinden önceki (2015) ve sonraki (2023) uydu görüntülerini kullanarak Hatay İli, Türkiye'deki deprem hasarını analiz etmek ve görselleştirmek için kapsamlı bir araç seti sağlar. Sistem, kentsel peyzaj boyunca hasarı otomatik olarak tespit etmek, sınıflandırmak ve ölçmek için gelişmiş AI ve görüntü işleme tekniklerini kullanır.

## 📊 Veri Kümesi Açıklaması

### Uydu Görüntüleri
- **Deprem Öncesi (2015)**
  - Boyut: 0.66 GB
  - Çözünürlük: 10 cm/piksel
  - Boyutlar: 25,063 × 19,956 piksel
  - Format: GeoTIFF (4-bant: RGB + Alpha/IR)
  - Kapsam: 5.00 km²

- **Deprem Sonrası (2023)**
  - Boyut: 2.48 GB
  - Çözünürlük: 5.5 cm/piksel
  - Boyutlar: 45,289 × 36,060 piksel
  - Format: GeoTIFF (4-bant: RGB + Alpha/IR)
  - Kapsam: 5.00 km²

### Coğrafi Veriler
- **Koordinat Sistemi:** WGS84 Transverse Mercator (Merkez Meridyen: 36°)
- **Çalışma Alanı:** Merkez Hatay (Antakya)
- **Sınırlar:** 36.136884°E - 36.164790°E, 36.200889°N - 36.218908°N

## 🛠️ Teknik Mimari

### 1. Temel Bileşenler
- **Veri İşleme Ardışık Düzeni**
  - Görüntü hizalama ve kayıt
  - Çok ölçekli değişiklik algılama
  - Hasar sınıflandırması
  - Alan düzeyinde analiz
  - İstatistiksel raporlama

- **Analiz Yöntemleri**
  - SSIM (Yapısal Benzerlik İndeksi)
  - Renk farkı analizi
  - Kenar algılama
  - Şekil analizi
  - Bağlı bileşen etiketleme

### 2. Performans Optimizasyonları
- **Bellek Yönetimi**
  - Döşeme tabanlı işleme (512×512 piksel)
  - Büyük görüntüler için otomatik alt örnekleme
  - 4 iş parçacığıyla paralel işleme
  - Verimli veri yapıları

- **İşleme Ardışık Düzeni**
  - Çok iş parçacıklı döşeme işleme
  - Aşamalı görüntü yükleme
  - Optimize edilmiş değişiklik algılama
  - Verimli alan analizi

## 🔬 Analiz Yetenekleri

### 1. Hasar Değerlendirmesi
- **Sınıflandırma Seviyeleri:**
  - Minimal (< %10 değişiklik)
  - Orta (%10-30 değişiklik)
  - Ciddi (%30-60 değişiklik)
  - Felaket (> %60 değişiklik)

- **Analiz Metrikleri:**
  - Değişiklik yoğunluğu
  - Yapısal hasar
  - Etkilenen alan
  - Desen tanıma

### 2. Alan Düzeyinde Analiz
- **Geometrik Özellikler:**
  - Alan sınırları
  - Alan hesaplama
  - Çevre ölçümü
  - Merkez konumu
  - Şekil özellikleri

- **Şekil Analizi:**
  - Kompaktlık oranı
  - En-boy oranı
  - Düzenlilik
  - Uzama

### 3. İstatistiksel Analiz
- **Hasar İstatistikleri:**
  - Toplam etkilenen alan
  - Hasar dağılımı
  - Alan boyutu dağılımı
  - Şekil metrikleri

## 📈 Çıktı Ürünleri

### 1. Görselleştirmeler
- **Statik Karşılaştırma (`hatay_comparison.png`)**
  - Yan yana görüntü karşılaştırması
  - Sınır katmanları
  - Teknik meta veriler

- **Hasar Değerlendirmesi (`hatay_damage_assessment.png`)**
  - Renk kodlu hasar seviyeleri
  - Alan sınırları
  - Şiddet göstergeleri

- **Etkileşimli Web Haritası (`hatay_interactive_map.html`)**
  - Çoklu temel katmanlar
  - Dinamik katmanlar
  - Tıklanabilir özellikler
  - Bilgi açılır pencereleri

### 2. Analiz Raporları
- **Hasar Raporu (`hatay_damage_report.json`)**
  - Genel istatistikler
  - Hasar özetleri
  - Alan hesaplamaları
  - Değişiklik metrikleri

- **Alan Analizi (`hatay_field_analysis.json`)**
  - Alan bazında veriler
  - Geometrik özellikler
  - Hasar değerlendirmeleri
  - Şekil özellikleri

## 🔧 Uygulama Detayları

### 1. Değişiklik Algılama Algoritması
```python
# Çok yöntemli değişiklik algılama
- SSIM (%50 ağırlık): Yapısal değişiklikler
- Renk farkı (%30 ağırlık): Malzeme değişiklikleri
- Kenar algılama (%20 ağırlık): Sınır değişiklikleri
- Gürültü azaltma için Gaussian yumuşatma
- Sınıflandırma için uyarlanabilir eşikleme
```

### 2. Alan Analizi Ardışık Düzeni
```python
# Her alan için:
1. Sınırları çıkar
2. Geometrik özellikleri hesapla
3. Şekil metriklerini hesapla
4. Hasar yoğunluğunu değerlendir
5. Hasar seviyesini sınıflandır
6. Alan meta verilerini oluştur
```

### 3. Performans Metrikleri
- **İşleme Hızı:** Tam analiz için ~5-10 dakika
- **Bellek Kullanımı:** 2.48GB görüntü için optimize edildi
- **Doğruluk:** Çok algoritmalı doğrulama
- **Çözünürlük:** 5.5cm/piksel detayına kadar

## 📊 Örnek Sonuçlar

### Genel İstatistikler
- Analiz Edilen Toplam Alan: 5.002 km²
- Toplam Hasarlı Alan: 2.817 km² (%56.32)
- Analiz Edilen Toplam Alan: 41,076

### Hasar Dağılımı
- Minimal: 1,704 alan (%0.64 alan)
- Orta: 9,791 alan (%0.94 alan)
- Ciddi: 23,174 alan (%35.58 alan)
- Felaket: 6,407 alan (%19.17 alan)

### Alan Metrikleri
- Ortalama Alan Boyutu: 1,399.7 piksel
- Boyut Aralığı: 10 - 172,171 piksel
- Ortalama Kompaktlık: 1,430.358
- Ortalama Düzenlilik: 0.177

## 🚀 Kullanım Talimatları

### 1. Temel Analiz
```bash
python run_analysis.py
# Menü seçeneklerinden seçin:
1. Veri Bilgilerini Kontrol Et
2. Statik Görselleştirme Oluştur
3. Etkileşimli Web Haritası Oluştur
4. AI Afet Boyutu Etiketleme
5. Tüm Analizleri Çalıştır
```

### 2. Gelişmiş Kullanım
```python
# Doğrudan betik yürütme
python check_data_info.py      # Veri genel bakış
python visualize_hatay_data.py # Statik karşılaştırma
python create_web_map.py       # Etkileşimli harita
python disaster_labeling.py    # AI analizi
```

## 🔍 Teknik Gereksinimler

### Yazılım Bağımlılıkları
```
rasterio>=1.3.0      # Uydu görüntü işleme
geopandas>=0.12.0    # Coğrafi veri işleme
matplotlib>=3.5.0    # Görselleştirme
folium>=0.14.0       # Web haritalama
numpy>=1.21.0        # Sayısal işleme
opencv-python>=4.6.0 # Görüntü işleme
scikit-image>=0.19.0 # Gelişmiş görüntü analizi
scikit-learn>=1.1.0  # Makine öğrenmesi
```

### Donanım Gereksinimleri
- RAM: Minimum 8GB, 16GB önerilen
- Depolama: 5GB boş alan
- CPU: Çok çekirdekli işlemci önerilen
- GPU: İsteğe bağlı, CPU optimize edilmiş işleme

## 📚 Referanslar

### Deprem Bağlamı
- Tarih: 6 Şubat 2023
- Büyüklük: 7.8 (04:17 yerel) ve 7.5 (13:24 yerel)
- Konum: Hatay İli, Türkiye
- Etki: Kentsel altyapıda ciddi hasar

### Teknik Referanslar
- SSIM: Wang ve ark. (2004)
- Değişiklik Algılama: Coppin ve ark. (2004)
- Hasar Değerlendirmesi: UNITAR yönergeleri
- Görüntü İşleme: OpenCV dokümantasyonu

## 👥 Katkıda Bulunanlar
Bu analiz aracı, Hatay İli, Türkiye'deki deprem hasar değerlendirmesi ve kurtarma planlama çabalarını desteklemek için oluşturulmuştur.

---

*Son Güncelleme: 2025-08-28*
