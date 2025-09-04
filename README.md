# TAMIS - Türkiye Deprem Analiz ve İzleme Sistemi

TAMIS, uydu görüntülerinin işlenmesi ve hasar değerlendirmesi için Python tabanlı jeouzamsal analiz ile Next.js frontend'ini birleştiren kapsamlı bir deprem hasar değerlendirme sistemidir.

## 🚀 Hızlı Başlangıç Seçenekleri

Tercih ettiğiniz kurulum yöntemini seçin:

- **🐳 [Docker Kurulumu](#-docker-kurulumu)** - Kolay kurulum için önerilir
- **⚙️ [Manuel Kurulum](#️-manuel-kurulum)** - Geliştirme veya özel kurulumlar için

---

## 🐳 Docker Kurulumu

### Ön Gereksinimler

- [Docker](https://docs.docker.com/get-docker/) ve [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### Hızlı Kurulum

1. **Depoyu klonlayın**:
   ```bash
   git clone <repository-url>
   cd TAMIS-V2
   ```

2. **Uygulamayı başlatın**:
   ```bash
   # Üretim modu
   docker-compose up --build

   # Veya geliştirme modu (hot reloading ile)
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Servislere erişin**:
   - **Web Uygulaması**: http://localhost:3000
   - **API Dokümantasyonu**: http://localhost:7887/docs
   - **API Durum Kontrolü**: http://localhost:7887/api/health

### Docker Servisleri

Kurulum üç konteynerli servisi içerir:

#### 🌐 Next.js Web Uygulaması (`tamis-web`)
- **Port**: 3000
- **Framework**: React 19 ile Next.js 15
- **Paket Yöneticisi**: Bun
- **Özellikler**: Kimlik Doğrulama, Kontrol Paneli, Etkileşimli Haritalar
- **Veritabanı**: Prisma ORM ile PostgreSQL

#### 🐍 Python API Sunucusu (`tamis-api`)
- **Port**: 7887
- **Framework**: Python 3.11 ile FastAPI
- **Özellikler**: 
  - Uydu görüntüsü analizi
  - Makine öğrenmesi hasar değerlendirmesi
  - Jeouzamsal veri işleme (GDAL, GeoPandas)
  - Gerçek zamanlı analiz kuyruk sistemi

#### 🗄️ PostgreSQL Veritabanı (`postgres`)
- **Port**: 5432
- **Veritabanı**: tamis
- **Otomatik migrasyon**: Prisma şema güncellemelerini yönetir

### Docker Komutları

```bash
# Temel işlemler
docker-compose up -d              # Arka planda başlat
docker-compose down               # Tüm servisleri durdur
docker-compose logs -f            # Logları görüntüle
docker-compose ps                 # Servis durumunu kontrol et

# Geliştirme
docker-compose -f docker-compose.dev.yml up --build

# Veritabanı işlemleri
docker-compose exec tamis-web bunx prisma migrate deploy
docker-compose exec tamis-web bunx prisma db seed
docker-compose exec postgres psql -U tamis_user -d tamis

# Temiz sıfırlama
docker-compose down -v            # Volume'ları kaldır
docker-compose up --build --force-recreate
```

### Ortam Yapılandırması

`tamis/` dizininde bir `.env` dosyası oluşturun:

```env
# Veritabanı
DATABASE_URL="postgresql://tamis_user:tamis_password@postgres:5432/tamis"

# Kimlik Doğrulama
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"
JWT_SECRET="tamis-super-secret-jwt-key-2025-change-in-production"

# API Yapılandırması
NEXT_PUBLIC_API_SERVER_URL="http://localhost:7887/api"

# Geliştirme
NODE_ENV="development"
```

---

## ⚙️ Manuel Kurulum

### Ön Gereksinimler

#### Sistem Gereksinimleri
- **Node.js** 18+ (veya [Bun](https://bun.sh/) - önerilir)
- **Python** 3.11+
- **PostgreSQL** 15+
- **Git**

#### Jeouzamsal Bağımlılıklar (Python API için)
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install gdal-bin libgdal-dev libproj-dev libgeos-dev libspatialindex-dev

# macOS (Homebrew ile)
brew install gdal proj geos spatialindex

# Windows
# OSGeo4W kurun veya conda-forge kullanın
conda install -c conda-forge gdal geopandas
```

### Frontend Kurulumu (Next.js)

1. **Frontend dizinine gidin**:
   ```bash
   cd tamis
   ```

2. **Bağımlılıkları kurun**:
   ```bash
   # Bun kullanarak (önerilir)
   bun install

   # Veya npm kullanarak
   npm install
   ```

3. **Ortam değişkenlerini ayarlayın**:
   ```bash
   cp .env.example .env
   # .env dosyasını veritabanı URL'si ve diğer ayarlarla düzenleyin
   ```

4. **Veritabanını kurun**:
   ```bash
   # Prisma client oluştur
   bunx prisma generate

   # Migrasyonları çalıştır
   bunx prisma migrate deploy

   # Veritabanını seed et (opsiyonel)
   bunx prisma db seed
   ```

5. **Geliştirme sunucusunu başlatın**:
   ```bash
   # Geliştirme modu
   bun dev

   # Veya üretim build'i
   bun build
   bun start
   ```

### Backend Kurulumu (Python API)

1. **API dizinine gidin**:
   ```bash
   cd tamis-api
   ```

2. **Sanal ortam oluşturun**:
   ```bash
   python -m venv venv

   # Etkinleştirin
   # Windows'ta:
   venv\Scripts\activate
   # macOS/Linux'ta:
   source venv/bin/activate
   ```

3. **Python bağımlılıklarını kurun**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **API sunucusunu başlatın**:
   ```bash
   python api_server.py

   # Veya uvicorn'u doğrudan kullanarak
   uvicorn api_server:app --host 0.0.0.0 --port 7887 --reload
   ```

### Veritabanı Kurulumu (PostgreSQL)

1. **PostgreSQL kurun**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib

   # macOS
   brew install postgresql

   # Windows: postgresql.org'dan indirin
   ```

2. **Veritabanı ve kullanıcı oluşturun**:
   ```sql
   -- PostgreSQL'e bağlanın
   sudo -u postgres psql

   -- Veritabanı ve kullanıcı oluşturun
   CREATE DATABASE tamis;
   CREATE USER tamis_user WITH PASSWORD 'tamis_password';
   GRANT ALL PRIVILEGES ON DATABASE tamis TO tamis_user;
   \q
   ```

3. **Ortam değişkenlerinizi güncelleyin**:
   ```env
   DATABASE_URL="postgresql://tamis_user:tamis_password@localhost:5432/tamis"
   ```

### Geliştirme İş Akışı

1. **PostgreSQL'i başlatın** (servis olarak çalışmıyorsa)
2. **Python API'yi başlatın**:
   ```bash
   cd tamis-api
   python api_server.py
   ```
3. **Next.js uygulamasını başlatın** (başka bir terminalde):
   ```bash
   cd tamis
   bun dev
   ```

---

## 🏗️ Proje Yapısı

```
TAMIS-V2/
├── tamis/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/                    # App Router sayfaları
│   │   │   ├── dashboard/          # Kontrol paneli sayfaları
│   │   │   └── api/                # API rotaları
│   │   ├── components/             # React bileşenleri
│   │   │   ├── auth/               # Kimlik doğrulama bileşenleri
│   │   │   └── map/                # Harita bileşenleri
│   │   └── server/                 # Sunucu yardımcıları
│   ├── prisma/                     # Veritabanı şeması ve migrasyonları
│   ├── public/                     # Statik varlıklar
│   ├── Dockerfile                  # Docker yapılandırması
│   └── package.json               # Bağımlılıklar
│
├── tamis-api/                      # Python API Backend
│   ├── analyzers/                  # Analiz modülleri
│   │   ├── analyzer_manager.py     # Ana analiz orkestratörü
│   │   ├── disaster_labeling.py    # ML hasar değerlendirmesi
│   │   └── visualize_hatay_data.py # Veri görselleştirmesi
│   ├── output/                     # Oluşturulan analiz çıktıları
│   ├── static/                     # API için statik dosyalar
│   ├── api_server.py              # FastAPI ana sunucusu
│   ├── requirements.txt           # Python bağımlılıkları
│   └── Dockerfile                 # Docker yapılandırması
│
├── docker-compose.yml             # Üretim Docker kurulumu
├── docker-compose.dev.yml         # Geliştirme Docker kurulumu
└── README.md                      # Bu dosya
```

---

## 🔧 Yapılandırma

### Ortam Değişkenleri

#### Next.js Uygulaması (`tamis/.env`)
```env
# Veritabanı bağlantısı
DATABASE_URL="postgresql://tamis_user:tamis_password@localhost:5432/tamis"

# Kimlik Doğrulama
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"
JWT_SECRET="your-jwt-secret"

# API Yapılandırması
NEXT_PUBLIC_API_SERVER_URL="http://localhost:7887/api"

# Geliştirme ayarları
NODE_ENV="development"
SKIP_ENV_VALIDATION="false"
```

#### Python API (Ortam)
Python API ortam değişkenlerini kullanır veya FastAPI ayarları aracılığıyla yapılandırılabilir. Ana yapılandırmalar:

- **Host/Port**: Varsayılan `0.0.0.0:7887`
- **Veri Dizini**: `1c__Hatay_Enkaz_Bina_Etiketleme/` (uydu görüntüleri için)
- **Çıktı Dizini**: `output/` (oluşturulan analiz için)

---

## 📊 Temel Özellikler

### Frontend Özellikleri
- **🔐 Kimlik Doğrulama Sistemi**: Kullanıcı kaydı ve girişi
- **📊 Kontrol Paneli**: Gerçek zamanlı izleme ve analitik
- **🗺️ Etkileşimli Haritalar**: 
  - Hasar değerlendirme görselleştirmesi
  - Saha birimleri takibi
  - Güvenli alan haritalandırması
  - Rota optimizasyonu
- **📈 Analiz Araçları**:
  - Yardım rotası planlama
  - İletişim ağı analizi
  - Nüfus yoğunluğu haritalandırması
  - Uydu görüntüsü karşılaştırması

### Backend Özellikleri
- **🛰️ Uydu Görüntüsü Analizi**: Deprem öncesi/sonrası karşılaştırması
- **🤖 AI Hasar Değerlendirmesi**: Makine öğrenmesi tabanlı hasar sınıflandırması
- **🗺️ Jeouzamsal İşleme**: GDAL destekli coğrafi veri analizi
- **📊 İstatistiksel Raporlama**: Kapsamlı hasar istatistikleri
- **🔄 Gerçek Zamanlı İşleme**: Kuyruk tabanlı analiz sistemi
- **📡 RESTful API**: Tam OpenAPI/Swagger dokümantasyonu

---

## 📚 API Dokümantasyonu

API sunucusu çalıştığında şunlara erişebilirsiniz:

- **Swagger UI**: http://localhost:7887/docs
- **ReDoc**: http://localhost:7887/redoc
- **OpenAPI JSON**: http://localhost:7887/openapi.json

### Ana Endpoint'ler

- `GET /api/health` - Sistem durum kontrolü
- `POST /api/analysis/run` - Hasar analizini başlat
- `GET /api/analysis/status` - Analiz ilerlemesini kontrol et
- `GET /api/results/damage-report` - Hasar değerlendirme sonuçlarını al
- `GET /api/results/field-analysis` - Alan seviyesi analizi al

---