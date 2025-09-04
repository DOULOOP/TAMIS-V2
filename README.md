**TAMİS Raporu**

## 📋 İçindekiler

- [1. Proje Özeti 🚀](#1-proje-özeti-)
- [2. Çözüm Ürettiği Sorun / İhtiyaç ❗](#2-çözüm-ürettiği-sorun--ihtiyaç-)
- [3. Yerlilik ve Özgünlük Tarafı 🇹🇷](#3-yerlilik-ve-özgünlük-tarafı-)
- [4. Yöntem ve Hedef Kitle 🎯](#4-yöntem-ve-hedef-kitle-)
- [5. Yenilik ve Ticarileşme Potansiyeli 💡](#5-yenilik-ve-ticarileşme-potansiyeli-)
- [6. SWOT Analizi 📊](#6-swot-analizi-)
- [🚀 Hızlı Başlangıç Seçenekleri](#-hızlı-başlangıç-seçenekleri)
  - [🐳 Docker Kurulumu](#-docker-kurulumu)
    - [Ön Gereksinimler](#ön-gereksinimler)
    - [Hızlı Kurulum](#hızlı-kurulumu)
    - [Docker Servisleri](#docker-servisleri)
    - [Docker Komutları](#docker-komutları)
    - [Ortam Yapılandırması](#ortam-yapılandırması)
  - [⚙️ Manuel Kurulum](#️-manuel-kurulum)
    - [Ön Gereksinimler](#ön-gereksinimler-1)
    - [Frontend Kurulumu (Next.js)](#frontend-kurulumu-nextjs)
    - [Backend Kurulumu (Python API)](#backend-kurulumu-python-api)
    - [Veritabanı Kurulumu (PostgreSQL)](#veritabanı-kurulumu-postgresql)
    - [Geliştirme İş Akışı](#geliştirme-iş-akışı)
- [🏗️ Proje Yapısı](#️-proje-yapısı)
- [🛠️ Teknoloji Sürümleri](#️-teknoloji-sürümleri)
  - [Frontend (Next.js)](#frontend-nextjs)
  - [Backend (Python API)](#backend-python-api)
  - [Veritabanı ve Altyapı](#veritabanı-ve-altyapı)
  - [Geliştirme Araçları](#geliştirme-araçları)
- [🔧 Yapılandırma](#-yapılandırma)
- [📊 Temel Özellikler](#-temel-özellikler)
- [📚 API Dokümantasyonu](#-api-dokümantasyonu)

---

## 1. Proje Özeti 🚀

TAMİS (Tehlike Alanı Müdahale İzleme Sistemi), afet anlarında hızlı,
güvenilir ve sürdürülebilir karar desteği sağlamak amacıyla geliştirilen
web tabanlı bir kriz yönetim platformudur. Sistem; deprem, sel, yangın
ve diğer afetlerde yıkım yoğunluğu, yol durumu, nüfus dağılımı, güvenli
alan kapasitesi ve kaynak yönetimini entegre ederek gerçek zamanlı
olarak analiz eder. Yapay zekâ destekli görüntü işleme, resmi
kurum API'leri ile veri entegrasyonu ve AAIA modem tabanlı offline
iletişim desteği sayesinde hem kriz merkezlerine hem de saha ekiplerine
kesintisiz ve doğru bilgi akışı sağlar.

## 2. Çözüm Ürettiği Sorun / İhtiyaç ❗

Afet sonrası mevcut sistemlerde gözlenen en kritik sorunlar şunlardır:
- Farklı veri kaynaklarının dağınık olması ve ortak bir platformda
birleşmemesi.
- Yolların ve güvenli alanların anlık durumlarının izlenememesi.
- İnternet ve enerji kesintilerinde saha--merkez iletişiminin kopması.
- Yanlış veya gecikmeli kararlar nedeniyle kaynakların verimsiz
kullanılması.

TAMİS, bu sorunlara çözüm olarak; çok katmanlı verilerin (uydu, İHA,
AFAD, belediye, meteoroloji, saha bildirimi) tek sistemde birleşmesini,
offline senaryolarda dahi iletişimin sürdürülmesini ve akıllı
algoritmalarla en hızlı ve güvenli müdahalenin yapılmasını mümkün kılar.

## 3. Yerlilik ve Özgünlük Tarafı 🇹🇷

TAMİS, Türkiye'nin afet yönetimi ihtiyaçlarına özel geliştirilmiş, yerli
ve özgün bir sistemdir.

- AAIA modem entegrasyonu sayesinde, saha ekipleri internet bağlantısına
ihtiyaç duymadan ve düşük enerji tüketimiyle veri alışverişi yapabilir.
- **Yapay zekâ tabanlı görüntü işleme** ile bina hasarı, yol engelleri
ve kalabalık analizi otomatik yapılır.
- **Dijital şehir ikizi + MAKS + ATLAS entegrasyonu** ile bina bazında
nüfus yoğunluğu ve hasar durumu eşleştirilir.
- **Multi-afet uyumluluğu** sayesinde deprem, sel, yangın, heyelan gibi
farklı senaryolara modüler çözümler sunar.\
Bu özellikler sayesinde TAMİS, hem milli hem de sürdürülebilir bir afet
yönetim ekosistemi sunar.

## 4. Yöntem ve Hedef Kitle 🎯

**Yöntem:**

1. **Veri Toplama:** Uydu, İHA/drone görüntüleri, AAIA modem verileri,
resmi kurum API'leri, saha bildirimleri.
2. **Veri İşleme:** CNN ( Convolutional Neural Network) tabanlı yapay
zekâ ile hasar analizi, yol deformasyon tespiti, nüfus yoğunluğu
hesaplama.
3. **Entegrasyon:** PostgreSQL + PostGIS üzerinde mekânsal veri tabanı
ile tüm verilerin birleştirilmesi.
4. **Analiz ve Karar Destek:** Optimizasyon algoritmaları ile kaynak
tahsisi, rota hesaplama, güvenli alan yönlendirmesi.
5. **Görselleştirme ve Dağıtım:** Web tabanlı kriz merkezi paneli ve
mobil uygulamalar üzerinden çok katmanlı harita gösterimi; offline
senaryoda AAIA modem ağı üzerinden JSON veri paylaşımı.

**Hedef Kitle:**

- AFAD ve İçişleri Bakanlığı birimleri,
- Valilikler, belediyeler ve kriz yönetim merkezleri,
- Arama--kurtarma ekipleri, sağlık ekipleri ve lojistik birimler,
- Uzun vadede vatandaş uygulamaları ve sigorta sektörüne entegrasyon.

## 5. Yenilik ve Ticarileşme Potansiyeli 💡

**Yenilik:**

- Offline yerel saha iletişimi (AAIA modem entegrasyonu).
- Yapay zekâ tabanlı otomatik hasar ve yol analizi.
- Çok katmanlı (nüfus, yol, güvenli alan, kaynak) entegrasyonun tek
platformda sunulması.
- Dinamik rota hesaplama ve alternatif güzergâh önerileri.
- Kullanıcı dostu, harita tabanlı ve gerçek zamanlı dashboard.

**Ticarileşme Potansiyeli:**
- Türkiye'de afet riski yüksek tüm şehirlerde kullanılabilir, kamu
kurumlarına lisanslanabilir.
- Belediyeler, AFAD ve valilikler için entegre çözümler sunarak ulusal
ölçekte yaygınlaşabilir.
- Afet yönetimi alanında **uluslararası pazarlara
açılabilecek** rekabetçi bir ürün olma potansiyeline sahiptir.
- Sigorta, şehir planlama ve afet risk haritalaması sektörleri için
genişletilebilir modüller eklenerek sürdürülebilir gelir modeli
oluşturulabilir.



## 6. SWOT Analizi 📊

| **Strengths (Güçlü Yönler)** 💪 | **Weaknesses (Zayıf Yönler)** ⚠️ |
|---------------------------------|----------------------------------|
| Yerli ve özgün çözüm            | İlk yatırım maliyetleri yüksek   |
| AAIA modem entegrasyonu         | Eğitim ve adaptasyon süreci uzun |
| Yapay zekâ tabanlı analiz        | Offline kapasite sınırlı olabilir|

| **Opportunities (Fırsatlar)** 🌍 | **Threats (Tehditler)** 🔥 |
|---------------------------------|-----------------------------|
| Türkiye’de yüksek afet riski    | Yeni rakip çözümler          |
| Kamu kurumlarıyla entegrasyon   | Doğal afetlerin öngörülemezliği |
| Uluslararası pazara açılma      | Öngörülemeyen yıkımlar |

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
   - **API Dokümantasyonu**: http://localhost:8000/docs
   - **API Durum Kontrolü**: http://localhost:8000/api/health

### Docker Servisleri

Kurulum üç konteynerli servisi içerir:

#### 🌐 Next.js Web Uygulaması (`tamis-web`)
- **Port**: 3000
- **Framework**: React 19 ile Next.js 15
- **Paket Yöneticisi**: Bun
- **Özellikler**: Kimlik Doğrulama, Kontrol Paneli, Etkileşimli Haritalar
- **Veritabanı**: Prisma ORM ile PostgreSQL

#### 🐍 Python API Sunucusu (`tamis-api`)
- **Port**: 8000
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
NEXT_PUBLIC_API_SERVER_URL="http://localhost:8000/api"

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
   uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
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

## 🛠️ Teknoloji Sürümleri

### Frontend (Next.js)
- **Next.js**: 15.2.3
- **React**: 19.0.0
- **React DOM**: 19.0.0
- **Node.js**: 20.14.10
- **TypeScript**: 5.8.2
- **Bun**: 1.0 (Paket yöneticisi)
- **Prisma Client**: 6.5.0
- **Tailwind CSS**: 4.0.15
- **ESLint**: 9.23.0
- **Prettier**: 3.5.3
- **NextAuth.js**: 4.24.11
- **OpenLayers**: 10.6.1
- **Zod**: 3.24.2

### Backend (Python API)
- **Python**: 3.11
- **FastAPI**: 0.104.0+
- **Uvicorn**: 0.24.0+
- **Pydantic**: 2.0.0+

#### Veri İşleme ve Analiz Kütüphaneleri
- **GeoPandas**: 0.12.0+
- **Rasterio**: 1.3.0+
- **NumPy**: 1.21.0+
- **Pandas**: 1.3.0+
- **OpenCV**: 4.6.0+
- **Scikit-learn**: 1.1.0+
- **Scikit-image**: 0.19.0+
- **Matplotlib**: 3.5.0+
- **Pillow**: 8.3.0+
- **Folium**: 0.14.0+
- **Contextily**: 1.3.0+

### Veritabanı ve Altyapı
- **PostgreSQL**: 15 (Alpine)
- **Prisma ORM**: 6.5.0
- **PostGIS**: Jeouzamsal veri desteği için

### Geliştirme Araçları
- **Docker**: Konteynerleştirme
- **Docker Compose**: Çoklu servis orkestrasyonu
- **TypeScript ESLint**: 8.27.0
- **Prettier Plugin TailwindCSS**: 0.6.11
- **TSX**: 4.20.5

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
NEXT_PUBLIC_API_SERVER_URL="http://localhost:8000/api"

# Geliştirme ayarları
NODE_ENV="development"
SKIP_ENV_VALIDATION="false"
```

#### Python API (Ortam)
Python API ortam değişkenlerini kullanır veya FastAPI ayarları aracılığıyla yapılandırılabilir. Ana yapılandırmalar:

- **Host/Port**: Varsayılan `0.0.0.0:8000`
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

- **Swagger UI**: https://tamis-v2.onrender.com/docs
- **ReDoc**: https://tamis-v2.onrender.com/redoc
- **OpenAPI JSON**: https://tamis-v2.onrender.com/openapi.json

### Ana Endpoint'ler

- `GET /api/health` - Sistem durum kontrolü
- `POST /api/analysis/run` - Hasar analizini başlat
- `GET /api/analysis/status` - Analiz ilerlemesini kontrol et
- `GET /api/results/damage-report` - Hasar değerlendirme sonuçlarını al
- `GET /api/results/field-analysis` - Alan seviyesi analizi al

---
