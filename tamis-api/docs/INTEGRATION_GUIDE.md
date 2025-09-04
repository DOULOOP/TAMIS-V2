# Hatay Deprem Değerlendirmesi - Tam Entegrasyon Kılavuzu

## 🌍 Genel Bakış

Bu kılavuz, hem FastAPI backend'i hem de Next.js frontend'i ile tam Hatay Deprem Hasar Değerlendirme sistemini nasıl kuracağınızı ve çalıştıracağınızı gösterir.

## 📦 Sistem Bileşenleri

### 1. **Python Analiz Backend'i** (`api_server.py`)
- FastAPI REST API sunucusu
- Uydu görüntü işleme
- AI hasar sınıflandırması
- Analiz sonucu oluşturma

### 2. **Next.js Web Panosu** (`nextjs-client-example/`)
- React tabanlı kullanıcı arayüzü
- Gerçek zamanlı analiz izleme
- Etkileşimli hasar görselleştirmeleri
- Duyarlı tasarım

## 🚀 Tam Kurulum Talimatları

### Adım 1: Backend Kurulumu

1. **Python bağımlılıklarını yükle:**
   ```bash
   cd "C:\Users\furka\Downloads\1c__Hatay_Enkaz_Bina_Etiketleme"
   pip install -r requirements.txt
   ```

2. **API sunucusunu başlat:**
   ```bash
   python start_api_server.py
   # veya
   python api_server.py
   ```

3. **API'nin çalıştığını doğrula:**
   - Aç: http://127.0.0.1:7887/health
   - Kontrol et: http://127.0.0.1:7887/docs (API dokümantasyonu)

### Adım 2: Frontend Kurulumu

1. **İstemci dizinine git:**
   ```bash
   cd nextjs-client-example
   ```

2. **Node.js bağımlılıklarını yükle:**
   ```bash
   npm install
   ```

3. **Next.js geliştirme sunucusunu başlat:**
   ```bash
   npm run dev
   ```

4. **Panoyu aç:**
   - Şuraya git: http://localhost:3000

### Adım 3: Entegrasyonu Test Et

1. **Sistem sağlığını kontrol et:**
   - Pano veri kümesi bilgilerini göstermeli
   - API bağlantısı için yeşil durum göstergeleri

2. **Analizi çalıştır:**
   - "AI Hasar Analizi" düğmesine tıkla
   - Gerçek zamanlı ilerlemeyi izle
   - Tamamlandığında sonuçları görüntüle

## 💻 Kullanım İş Akışı

### 1. **Veri Genel Bakış** 📊
- Uydu görüntü meta verilerini görüntüle
- Veri kümesi kullanılabilirliğini kontrol et
- Analiz yeteneklerini gör

### 2. **Analizi Çalıştır** 🤖
- **Statik Karşılaştırma**: Yan yana görüntü oluşturur
- **AI Hasar Değerlendirmesi**: Hasar şiddetini sınıflandırır
- **Etkileşimli Harita**: Web tabanlı harita oluşturur
- **Tam Analiz**: Tüm araçları çalıştırır

### 3. **Sonuçları Görüntüle** 📈
- Gerçek zamanlı ilerleme izleme
- Şiddete göre hasar istatistikleri
- Oluşturulan görselleştirmeler
- İndirilebilir raporlar

## 🛠️ API Entegrasyon Örnekleri

### Temel JavaScript Entegrasyonu
```javascript
// API'ye bağlan
const apiUrl = 'http://127.0.0.1:7887';

// Sağlığı kontrol et
const health = await fetch(`${apiUrl}/health`);
console.log(await health.json());

// Analizi başlat
const analysis = await fetch(`${apiUrl}/analysis/run`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    analysis_type: 'damage_labeling'
  })
});

// Sonuçları al
const results = await fetch(`${apiUrl}/results/damage-report`);
const damageData = await results.json();
```

### React Hook Örneği
```jsx
import { useState, useEffect } from 'react';

function useAnalysis() {
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch('http://127.0.0.1:7887/analysis/status');
      const statusData = await response.json();
      setStatus(statusData);
      
      if (!statusData.running && statusData.last_updated) {
        // Analiz tamamlandığında sonuçları yükle
        try {
          const resultsResponse = await fetch('http://127.0.0.1:7887/results/damage-report');
          const resultsData = await resultsResponse.json();
          setResults(resultsData);
        } catch (error) {
          console.log('Henüz sonuç mevcut değil');
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { status, results };
}
```

## 📊 Veri Yapısı Örnekleri

### Veri Kümesi Bilgi Yanıtı
```json
{
  "timestamp": "2025-08-28T...",
  "files": {
    "image_2015": {
      "file": "HATAY MERKEZ-2 2015.tif",
      "size_gb": 0.66,
      "dimensions": [25063, 19956],
      "resolution_meters": [0.10, 0.10]
    },
    "image_2023": {
      "file": "HATAY MERKEZ-2 2023.tif", 
      "size_gb": 2.48,
      "dimensions": [45289, 36060],
      "resolution_meters": [0.055, 0.055]
    }
  }
}
```

### Hasar Değerlendirme Sonuçları
```json
{
  "analysis_metadata": {
    "total_area_km2": 5.002,
    "analysis_method": "Çok yöntemli değişiklik algılama"
  },
  "damage_assessment": {
    "minimal": {
      "total_area_km2": 0.032,
      "percentage_of_total_area": 0.64
    },
    "severe": {
      "total_area_km2": 1.779,
      "percentage_of_total_area": 35.58
    }
  }
}
```

## 🎨 Mevcut UI Bileşenleri

### Pano Bileşenleri
- **DataInfoCard**: Uydu görüntü meta verilerini gösterir
- **AnalysisControls**: Farklı analizleri başlatmak için düğmeler
- **StatusMonitor**: Gerçek zamanlı ilerleme takibi
- **DamageVisualization**: Renk kodlu hasar şiddeti gösterimi
- **ImageGallery**: Oluşturulan karşılaştırma ve değerlendirme resimleri

### Stil Özellikleri
- **Duyarlı Tasarım**: Mobil öncelikli düzen
- **Yükleniyor Durumları**: Düzgün kullanıcı geri bildirimi
- **Hata İşleme**: Zarif hata mesajları
- **Renk Kodlama**: Hasar şiddeti görselleştirmesi
- **Gerçek Zamanlı Güncellemeler**: Canlı durum izleme

## 🔧 Gelişmiş Yapılandırma

### Özel Analiz Parametreleri
```javascript
// Özel seçeneklerle analizi başlat
await fetch('http://127.0.0.1:7887/analysis/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    analysis_type: 'damage_labeling',
    options: {
      tile_size: 256,
      downsample_factor: 2,
      damage_threshold: 0.5
    }
  })
});
```

### Ortam Yapılandırması
```bash
# .env.local (Next.js)
NEXT_PUBLIC_API_URL=http://127.0.0.1:7887
NEXT_PUBLIC_POLLING_INTERVAL=3000

# Python ortamı
export HATAY_DATA_DIR="custom/path/to/data"
export HATAY_OUTPUT_DIR="custom/output/path"
```

## 🚀 Üretim Dağıtımı

### Backend Dağıtımı
```bash
# Üretimde Uvicorn kullanma
uvicorn api_server:app --host 0.0.0.0 --port 7887 --workers 4

# Docker kullanma
docker build -t hatay-api .
docker run -p 7887:7887 hatay-api
```

### Frontend Dağıtımı
```bash
# Next.js uygulamasını derleme
npm run build
npm run start

# PM2 kullanma
pm2 start npm --name "hatay-dashboard" -- start
```

### Nginx Yapılandırması
```nginx
# API proxy
location /api/ {
    proxy_pass http://127.0.0.1:7887/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Frontend
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 📈 Performans Optimizasyonu

### Backend Optimizasyonları
- **Bellek Yönetimi**: Büyük görüntüler için döşeme tabanlı işleme
- **Paralel İşleme**: Çok iş parçacıklı analiz
- **Önbelleğe Alma**: Tekrarlanan istekler için sonuç önbelleğe alma
- **Arka Plan Görevleri**: Bloklama yapmayan analiz yürütme

### Frontend Optimizasyonları
- **Kod Bölme**: Bileşenlerin tembel yüklenmesi
- **Görüntü Optimizasyonu**: Next.js görüntü optimizasyonu
- **API Önbelleğe Alma**: Analiz sonuçlarını önbelleğe al
- **Yoklama Optimizasyonu**: Verimli durum kontrolü

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **API Bağlantısı Başarısız**
   ```bash
   # API sunucusunun çalışıp çalışmadığını kontrol et
   curl http://127.0.0.1:7887/health
   
   # CORS yapılandırmasını kontrol et
   # Next.js'in port 3000'de çalıştığını doğrula
   ```

2. **Analiz Başarısız**
   ```bash
   # Veri dizinini kontrol et
   ls -la 1c__Hatay_Enkaz_Bina_Etiketleme/
   
   # Python bağımlılıklarını kontrol et
   pip list | grep rasterio
   
   # API loglarını görüntüle
   python api_server.py --log-level debug
   ```

3. **Resimler Yüklenmiyor**
   ```javascript
   // Resim URL'lerini kontrol et
   console.log(apiService.getImageUrl('hatay_comparison.png'));
   
   // Tarayıcı ağ sekmesinde doğrula
   // Dosya izinlerini kontrol et
   ```

### Geliştirme İpuçları

1. **API Dokümantasyonunu Kullan**: http://127.0.0.1:7887/docs
2. **Tarayıcı Konsolunu İzle**: JavaScript hatalarını kontrol et
3. **Ağ Sekmesini Kontrol Et**: API isteklerini doğrula
4. **React DevTools Kullan**: Bileşen durumunu incele
5. **API Loglarını Kontrol Et**: Backend işlemeyi izle

## 🔒 Güvenlik Hususları

### Geliştirme
- CORS yalnızca localhost için yapılandırılmış
- Kimlik doğrulama gerekli değil
- Belirli dizinlerden dosya sunma

### Üretim
```python
# Üretim için CORS'u güncelle
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# API kimlik doğrulaması ekle
# Oran sınırlandırma uygula
# HTTPS kullan
```

## 📚 Sonraki Adımlar

### Sistemi Genişletme

1. **Kimlik Doğrulama Ekle**: JWT tokenları, kullanıcı yönetimi
2. **Veritabanı Entegrasyonu**: PostgreSQL, kullanıcı veri depolama
3. **Gerçek Zamanlı Özellikler**: WebSocket bildirimleri
4. **Dosya Yükleme**: Kullanıcıların görüntü yüklemesine izin ver
5. **Dışa Aktarma Özellikleri**: PDF raporlar, veri indirmeleri
6. **Toplu İşlem**: Çoklu alan analizi
7. **Geçmiş Takip**: Analiz versiyon geçmişi

### Diğer Sistemlerle Entegrasyon

1. **GIS Entegrasyonu**: ArcGIS, QGIS eklentileri
2. **Acil Durum Müdahalesi**: Alarm sistemleri
3. **Sigorta Sistemleri**: Hasar değerlendirme API'leri
4. **Devlet Portalları**: Kamu veri paylaşımı
5. **Mobil Uygulamalar**: React Native versiyonu

---

Bu entegrasyon, web tabanlı arayüz ve kapsamlı API erişimi ile tam, üretime hazır deprem hasar değerlendirme sistemi sağlar. Sistem ölçeklenebilirlik, güvenilirlik ve kullanım kolaylığı için tasarlanmıştır.
