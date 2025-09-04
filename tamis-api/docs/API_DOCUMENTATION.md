# Hatay Deprem Hasar Değerlendirme API

## 🌍 Genel Bakış

Bu FastAPI sunucusu, Hatay deprem hasar değerlendirme işlevselliğine erişim için REST API uç noktaları sağlar. Tüm analiz yeteneklerini HTTP uç noktaları aracılığıyla açığa çıkararak Next.js gibi web uygulamalarıyla entegrasyonu kolaylaştırır.

## 🚀 Hızlı Başlangıç

### Kurulum ve Ayar

1. **Bağımlılıkları yükle:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Sunucuyu başlat:**
   ```bash
   python start_api_server.py
   # veya
   python api_server.py
   # veya (Windows PowerShell)
   .\start_api_server.ps1
   ```

3. **API'ye erişim:**
   - API Dokümantasyonu: http://127.0.0.1:7887/docs
   - Alternatif Dokümanlar: http://127.0.0.1:7887/redoc
   - Sağlık Kontrolü: http://127.0.0.1:7887/health

## 📡 API Uç Noktaları

### 🔧 Sistem Uç Noktaları

#### `GET /`
- **Açıklama**: API bilgileri ve mevcut uç noktalar
- **Yanıt**: API meta verileri ve uç nokta listesi ile JSON

#### `GET /health`
- **Açıklama**: Sağlık kontrolü ve veri durumu
- **Yanıt**: 
  ```json
  {
    "status": "healthy|warning",
    "timestamp": "2025-08-28T...",
    "data_status": "Tüm gerekli dosyalar bulundu"
  }
  ```

#### `GET /data/status`
- **Açıklama**: Tüm veri dosyalarının detaylı durumu
- **Yanıt**: Dosya varlığı, boyutları ve değişiklik tarihleri ile JSON

### 📊 Veri Bilgileri

#### `GET /data/info`
- **Açıklama**: Kapsamlı veri kümesi bilgileri
- **Yanıt**: Görüntü meta verileri, dosya boyutları, koordinat sistemleri vb. ile JSON
- **Örnek Yanıt**:
  ```json
  {
    "timestamp": "2025-08-28T...",
    "data_directory": "1c__Hatay_Enkaz_Bina_Etiketleme",
    "files": {
      "image_2015": {
        "file": "HATAY MERKEZ-2 2015.tif",
        "size_gb": 0.66,
        "dimensions": [25063, 19956],
        "bands": 4,
        "crs": "EPSG:32636",
        "resolution_meters": [0.10, 0.10]
      },
      "image_2023": {
        "file": "HATAY MERKEZ-2 2023.tif", 
        "size_gb": 2.48,
        "dimensions": [45289, 36060],
        "bands": 4,
        "crs": "EPSG:32636", 
        "resolution_meters": [0.055, 0.055]
      }
    }
  }
  ```

### 🤖 Analiz Yürütme

#### `GET /analysis/status`
- **Açıklama**: Mevcut analiz durumu
- **Yanıt**:
  ```json
  {
    "running": false,
    "current_task": null,
    "progress": 0,
    "last_updated": "2025-08-28T..."
  }
  ```

#### `POST /analysis/run`
- **Açıklama**: Analiz sürecini başlat
- **İstek Gövdesi**:
  ```json
  {
    "analysis_type": "data_info|visualization|web_map|damage_labeling|all",
    "options": {}
  }
  ```
- **Analiz Türleri**:
  - `data_info`: Hızlı veri genel bakış
  - `visualization`: Statik karşılaştırma görüntüsü
  - `web_map`: Etkileşimli HTML haritası
  - `damage_labeling`: AI hasar sınıflandırması
  - `all`: Tam analiz ardışık düzeni

### 📈 Sonuçlar ve Raporlar

#### `GET /results/damage-report`
- **Açıklama**: AI hasar değerlendirme raporunu al
- **Yanıt**: İstatistiklerle tam hasar analizi
- **Örnek Yanıt**:
  ```json
  {
    "analysis_metadata": {
      "timestamp": "2025-08-28T...",
      "image_dimensions": "11323 x 9015",
      "total_area_km2": 5.002,
      "analysis_method": "Çok yöntemli değişiklik algılama"
    },
    "damage_assessment": {
      "minimal": {
        "region_count": 1,
        "total_area_km2": 0.032,
        "percentage_of_total_area": 0.64,
        "average_change_intensity": 0.077
      },
      "severe": {
        "region_count": 1,
        "total_area_km2": 1.779,
        "percentage_of_total_area": 35.58,
        "average_change_intensity": 0.45
      }
    }
  }
  ```

#### `GET /results/field-analysis`
- **Açıklama**: Alan düzeyinde analiz verilerini al
- **Yanıt**: Bireysel alan istatistikleri ve hasar değerlendirmeleri

#### `GET /results/summary`
- **Açıklama**: Mevcut tüm analiz sonuçlarının özeti
- **Yanıt**: Oluşturulan çıktılar ve anahtar istatistiklerin genel bakışı

### 🎨 Görsel Çıktılar

#### `GET /images/{filename}`
- **Açıklama**: Oluşturulan resimleri sun
- **Parametreler**: 
  - `filename`: Resim dosya adı (örn. "hatay_comparison.png")
- **Yanıt**: Resim dosyası

#### `GET /maps/{filename}` 
- **Açıklama**: Oluşturulan HTML haritalarını sun
- **Parametreler**:
  - `filename`: Harita dosya adı (örn. "hatay_interactive_map.html")
- **Yanıt**: HTML dosyası

### 🔍 Gelişmiş Sorgular

#### `GET /damage/by-severity`
- **Açıklama**: Şiddete göre gruplandırılmış hasar istatistiklerini al
- **Yanıt**: 
  ```json
  {
    "minimal": {
      "area_km2": 0.032,
      "percentage": 0.64,
      "region_count": 1,
      "change_intensity": 0.077
    },
    "severe": {
      "area_km2": 1.779, 
      "percentage": 35.58,
      "region_count": 1,
      "change_intensity": 0.45
    }
  }
  ```

#### `GET /fields/search`
- **Açıklama**: Alan verilerini ara ve filtrele
- **Sorgu Parametreleri**:
  - `min_area`: m² cinsinden minimum alan boyutu
  - `max_area`: m² cinsinden maksimum alan boyutu
  - `damage_level`: Hasar seviyesine göre filtrele
  - `limit`: Maksimum sonuç (varsayılan: 100)
- **Örnek**: `/fields/search?damage_level=severe&min_area=1000&limit=50`

## 🔧 Next.js ile Entegrasyon

### Temel Kurulum

```javascript
// lib/api.js
const API_BASE_URL = 'http://127.0.0.1:7887';

export const api = {
  // Sistem sağlığını al
  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  // Veri kümesi bilgilerini al
  async getDataInfo() {
    const response = await fetch(`${API_BASE_URL}/data/info`);
    return response.json();
  },

  // Analizi başlat
  async startAnalysis(analysisType, options = {}) {
    const response = await fetch(`${API_BASE_URL}/analysis/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysis_type: analysisType,
        options: options
      })
    });
    return response.json();
  },

  // Analiz durumunu al
  async getAnalysisStatus() {
    const response = await fetch(`${API_BASE_URL}/analysis/status`);
    return response.json();
  },

  // Hasar raporunu al
  async getDamageReport() {
    const response = await fetch(`${API_BASE_URL}/results/damage-report`);
    return response.json();
  },

  // Şiddete göre hasarı al
  async getDamageBySeverity() {
    const response = await fetch(`${API_BASE_URL}/damage/by-severity`);
    return response.json();
  },

  // Alanları ara
  async searchFields(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/fields/search?${params}`);
    return response.json();
  }
};
```

### React Bileşen Örneği

```jsx
// components/DashboardComponent.jsx
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function DashboardComponent() {
  const [dataInfo, setDataInfo] = useState(null);
  const [damageReport, setDamageReport] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState(null);

  useEffect(() => {
    // Başlangıç verilerini yükle
    api.getDataInfo().then(setDataInfo);
    api.getDamageReport().then(setDamageReport).catch(() => {});
    
    // Analiz durumunu yokla
    const interval = setInterval(() => {
      api.getAnalysisStatus().then(setAnalysisStatus);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const startAnalysis = async (type) => {
    try {
      await api.startAnalysis(type);
      // Durum yoklama ile güncellenecek
    } catch (error) {
      console.error('Analiz başlatılamadı:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Hatay Deprem Hasar Değerlendirmesi</h1>
      
      {/* Veri Bilgi Bölümü */}
      {dataInfo && (
        <div className="data-info">
          <h2>Veri Kümesi Bilgileri</h2>
          <p>Toplam Alan: {dataInfo.files?.boundaries?.total_area_km2} km²</p>
          <p>2015 Görüntüsü: {dataInfo.files?.image_2015?.size_gb} GB</p>
          <p>2023 Görüntüsü: {dataInfo.files?.image_2023?.size_gb} GB</p>
        </div>
      )}

      {/* Analiz Kontrolleri */}
      <div className="analysis-controls">
        <h2>Analiz Araçları</h2>
        <button onClick={() => startAnalysis('visualization')}>
          Karşılaştırma Oluştur
        </button>
        <button onClick={() => startAnalysis('damage_labeling')}>
          AI Analizi Çalıştır
        </button>
        <button onClick={() => startAnalysis('web_map')}>
          Harita Oluştur
        </button>
      </div>

      {/* Analiz Durumu */}
      {analysisStatus?.running && (
        <div className="analysis-status">
          <h3>Analiz Çalışıyor...</h3>
          <p>Görev: {analysisStatus.current_task}</p>
          <p>İlerleme: {analysisStatus.progress}%</p>
        </div>
      )}

      {/* Hasar Raporu */}
      {damageReport && (
        <div className="damage-report">
          <h2>Hasar Değerlendirme Sonuçları</h2>
          <p>Analiz Edilen Toplam Alan: {damageReport.analysis_metadata.total_area_km2} km²</p>
          
          {Object.entries(damageReport.damage_assessment).map(([severity, stats]) => (
            <div key={severity} className={`damage-${severity}`}>
              <h3>{severity.charAt(0).toUpperCase() + severity.slice(1)} Hasar</h3>
              <p>Alan: {stats.total_area_km2} km² ({stats.percentage_of_total_area}%)</p>
              <p>Bölgeler: {stats.region_count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## ⚡ Performans Hususları

### Sunucu Optimizasyonu
- Analiz, bloklama yapmamak için arka plan görevlerinde çalışır
- Büyük görüntüler bellek verimli döşemelerde işlenir
- Uzun süren işlemler için ilerleme takibi
- Uygun hata işleme ve durum raporlama

### İstemci Entegrasyonu
- Analiz durumu güncellemeleri için yoklama kullan
- Analiz sırasında yükleniyor durumlarını uygula
- Tekrarlanan API çağrılarını önlemek için sonuçları önbelleğe al
- Kullanıcı geri bildirimi ile hataları zarif bir şekilde işle

## 🔒 CORS Yapılandırması

API yerel geliştirme için CORS ile yapılandırılmıştır:
- İzin verilen kaynaklar: `http://localhost:3000`, `http://127.0.0.1:3000`
- Tüm HTTP yöntemleri ve başlıkları izin verilir
- Kimlik bilgileri desteklenir

Üretim için `api_server.py` içindeki CORS ayarlarını güncelle:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # Üretim için güncelle
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **Port 7887 zaten kullanımda**
   - `api_server.py` içinde portu değiştir: `uvicorn.run(..., port=8001)`

2. **Eksik bağımlılıklar**
   - Çalıştır: `pip install -r requirements.txt`

3. **Veri dosyaları bulunamadı**
   - Veri dizininin var olduğundan emin ol: `1c__Hatay_Enkaz_Bina_Etiketleme/`
   - API yanıtlarında dosya yollarını kontrol et

4. **Tarayıcıda CORS hataları**
   - Next.js'in izin verilen portlarda (3000) çalıştığını doğrula
   - Belirli CORS mesajları için tarayıcı konsolunu kontrol et

5. **Analiz başarısız**
   - Belirli hatalar için sunucu loglarını kontrol et
   - Tüm giriş dosyalarının erişilebilir olduğunu doğrula
   - Yeterli disk alanı ve bellek olduğundan emin ol

### API Testi

Dahili dokümantasyonu kullan:
- Etkileşimli API dokümanları: http://127.0.0.1:7887/docs
- Uç noktaları doğrudan tarayıcıda dene
- Test için curl veya Postman kullan:

```bash
# Sağlık kontrolü
curl http://127.0.0.1:7887/health

# Veri bilgilerini al
curl http://127.0.0.1:7887/data/info

# Analizi başlat
curl -X POST http://127.0.0.1:7887/analysis/run \
  -H "Content-Type: application/json" \
  -d '{"analysis_type": "visualization"}'
```

## 📚 Sonraki Adımlar

1. **Next.js ile entegre et**: Sağlanan kod örneklerini kullan
2. **Kimlik doğrulama ekle**: Gerekirse API anahtarları veya JWT tokenları uygula
3. **Üretime dağıt**: Docker konteynerleştirmesi düşün
4. **Oran sınırlandırma ekle**: API kötüye kullanımını önle
5. **Önbelleğe alma uygula**: Sık erişilen veriler için Redis
6. **İzleme ekle**: Log toplama ve metrik koleksiyonu

---

*API sunucusu, etkileşimli web uygulamaları oluşturmayı kolaylaştıran tüm deprem hasar değerlendirme yeteneklerine tam REST arayüzü sağlar.*
