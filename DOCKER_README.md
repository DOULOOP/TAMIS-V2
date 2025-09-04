# TAMIS Docker Kurulum Kılavuzu

Bu kılavuz, TAMIS uygulaması için detaylı Docker özel talimatları sağlar. Manuel kurulum dahil kapsamlı bir genel bakış için ana [README_TR.md](README_TR.md) dosyasına bakın.

## Ön Gereksinimler

- [Docker](https://docs.docker.com/get-docker/) ve [Docker Compose](https://docs.docker.com/compose/install/) kurulu
- Git (depoyu klonlamak için)
- Tam analiz yetenekleri için 8GB+ RAM önerilir

## Hızlı Başlangıç

### Üretim Kurulumu

1. **Depoyu klonlayın** (henüz yapmadıysanız):
   ```bash
   git clone <repository-url>
   cd TAMIS-V2
   ```

2. **Ortam dosyası oluşturun** (opsiyonel - Docker yerleşik varsayılanları kullanır):
   ```bash
   # Gerekirse özel değerlerle tamis/.env oluşturun
   cat > tamis/.env << EOF
   DATABASE_URL="postgresql://tamis_user:tamis_password@postgres:5432/tamis"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-here"
   JWT_SECRET="tamis-super-secret-jwt-key-2025-change-in-production"
   NEXT_PUBLIC_API_SERVER_URL="http://localhost:7887/api"
   EOF
   ```

3. **Uygulamayı build edin ve çalıştırın**:
   ```bash
   docker-compose up --build
   ```

4. **Uygulamaya erişin**:
   - **Web Uygulaması**: http://localhost:3000
   - **API Dokümantasyonu**: http://localhost:7887/docs
   - **API Sağlık**: http://localhost:7887/api/health
   - **Veritabanı**: localhost:5432 (kullanıcı: tamis_user, şifre: tamis_password)

### Geliştirme Kurulumu

Hot reloading ile geliştirme için:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## Servisler

Docker kurulumu üç ana servisi içerir:

### 1. PostgreSQL Veritabanı (`postgres`)
- **Port**: 5432
- **Veritabanı**: tamis
- **Kullanıcı**: tamis_user
- **Şifre**: tamis_password
- **Veri**: Docker volume `postgres_data`'da kalıcı

### 2. Next.js Web Uygulaması (`tamis-web`)
- **Port**: 3000
- **Framework**: React 19 ile Next.js 15
- **Paket Yöneticisi**: Bun
- **Özellikler**: 
  - Optimize edilmiş Docker build'leri için standalone çıktı
  - Otomatik migrasyonlarla Prisma ORM
  - NextAuth.js ile kimlik doğrulama

### 3. Python API Sunucusu (`tamis-api`)
- **Port**: 8000
- **Framework**: Python 3.11 ile FastAPI
- **Özellikler**: 
  - Uydu görüntüleri kullanılarak deprem hasar analizi
  - GDAL, GeoPandas ile jeouzamsal veri işleme
  - Makine öğrenmesi tabanlı hasar değerlendirmesi
  - Folium ile etkileşimli harita oluşturma
  - Gerçek zamanlı analiz kuyruk sistemi
  - Otomatik dokümantasyonlu RESTful API

## En Son İyileştirmeler

Docker kurulumu şu geliştirmelerle optimize edilmiştir:

### Next.js Container İyileştirmeleri
- **tsx Desteği**: Veritabanı seed'i için global tsx kurulumu
- **Gelişmiş Node.js Runtime**: Üretimde tam Node.js ortamı
- **Yerleşik Ortam Değişkenleri**: Docker ortamı için önceden yapılandırılmış
- **Tam Kaynak Haritalama**: Tam işlevsellik için src/ dizinini içerir
- **Prisma Desteği**: Tam Prisma client ve migrasyon desteği

### Container Özellikleri
- **Çok Aşamalı Build'ler**: Ayrı build/runtime aşamalarıyla üretim için optimize
- **Güvenlik**: Root olmayan kullanıcı yürütme (nextjs:nodejs)
- **Sağlık Kontrolleri**: Otomatik servis izleme
- **Verimli Önbellekleme**: Daha hızlı yeniden build'ler için katman optimizasyonu

### Yerleşik Yapılandırma
Container'lar artık bu önceden yapılandırılmış ortam değişkenlerini içeriyor:
```env
NODE_ENV="production"
NEXT_PUBLIC_API_SERVER_URL="http://localhost:7887/api"
JWT_SECRET="tamis-super-secret-jwt-key-2025-change-in-production"
DATABASE_URL="postgresql://tamis_user:tamis_password@postgres:5432/tamis"
```

## Ortam Değişkenleri

Next.js uygulaması için ana ortam değişkenleri (.env dosyası ile özelleştirilebilir):

```env
# Veritabanı bağlantısı
DATABASE_URL="postgresql://tamis_user:tamis_password@postgres:5432/tamis"

# NextAuth.js yapılandırması
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Ortam
NODE_ENV="production"
```

## Docker Komutları

### Temel İşlemler
```bash
# Tüm servisleri build et ve başlat
docker-compose up --build

# Servisleri arka planda başlat
docker-compose up -d

# Tüm servisleri durdur
docker-compose down

# Logları görüntüle
docker-compose logs -f tamis-web

# Belirli bir servisi yeniden build et
docker-compose build tamis-web
```

### Veritabanı İşlemleri
```bash
# Prisma migrasyonlarını çalıştır
docker-compose exec tamis-web bunx prisma migrate deploy

# Veritabanını seed et
docker-compose exec tamis-web npm run db:seed

# Veritabanına erişim
docker-compose exec postgres psql -U tamis_user -d tamis

# Veritabanı loglarını görüntüle
docker-compose logs postgres

# Veritabanını sıfırla (dikkat: tüm veriyi siler)
docker-compose exec tamis-web bunx prisma migrate reset
```

### Geliştirme Komutları
```bash
# Geliştirme ortamını başlat
docker-compose -f docker-compose.dev.yml up --build

# Yeni bağımlılık kur
docker-compose exec tamis-web-dev bun add <package-name>

# Testleri çalıştır
docker-compose exec tamis-web-dev bun test
```

### Veri Yönetimi

Python API belirli bir dizin yapısında uydu görüntüleri verisi bekler:

```bash
# Veri volume'unu kontrol et
docker volume inspect tamis-v2_tamis_data

# Volume'a uydu görüntüsü verisi ekle
# Seçenek 1: Çalışan container'a veri kopyala
docker cp path/to/satellite-data/ tamis-api:/app/1c__Hatay_Enkaz_Bina_Etiketleme/

# Seçenek 2: Yerel dizini mount et (docker-compose.yml'i değiştir)
# Volume mapping'i şununla değiştir:
# - ./your-data-directory:/app/1c__Hatay_Enkaz_Bina_Etiketleme

# API veri durumunu kontrol et
curl http://localhost:7887/api/data/status
```

Beklenen veri yapısı:
```
1c__Hatay_Enkaz_Bina_Etiketleme/
├── HATAY MERKEZ-2 2015.tif     # Deprem öncesi uydu görüntüsü
├── HATAY MERKEZ-2 2023.tif     # Deprem sonrası uydu görüntüsü
├── HATAY MERKEZ-2 SINIR.shp    # Sınır shapefile'ı
├── HATAY MERKEZ-2 SINIR.dbf    # Shapefile veritabanı
├── HATAY MERKEZ-2 SINIR.shx    # Shapefile indeksi
└── HATAY MERKEZ-2 SINIR.prj    # Shapefile projeksiyonu
```

## Sorun Giderme

### Yaygın Sorunlar

1. **Port çakışmaları**: 3000, 5432 ve 8000 portlarının kullanımda olmadığından emin olun
2. **İzin sorunları**: Docker'ın uygun izinlere sahip olduğundan emin olun
3. **Veritabanı bağlantısı**: Web uygulaması başlamadan önce PostgreSQL'in hazır olmasını bekleyin

### Loglar ve Hata Ayıklama
```bash
# Tüm logları görüntüle
docker-compose logs

# Belirli servis loglarını görüntüle
docker-compose logs tamis-web
docker-compose logs postgres

# Logları gerçek zamanlı takip et
docker-compose logs -f
```

### Temiz Sıfırlama
```bash
# Tüm container'ları, ağları ve volume'ları durdur ve kaldır
docker-compose down -v

# Tüm image'ları kaldır
docker-compose down --rmi all

# Her şeyi sıfırdan yeniden build et
docker-compose up --build --force-recreate
```

## Dosya Yapısı

```
TAMIS-V2/
├── docker-compose.yml          # Üretim yapılandırması
├── docker-compose.dev.yml      # Geliştirme yapılandırması
├── tamis/
│   ├── Dockerfile              # Next.js app Dockerfile
│   ├── .dockerignore           # Docker ignore kalıpları
│   └── ...                     # Next.js uygulama dosyaları
├── tamis-api/
│   ├── Dockerfile              # Python API Dockerfile
│   └── ...                     # Python API dosyaları
└── DOCKER_README_TR.md         # Bu dosya
```

## Performans Optimizasyonu

Docker kurulumu çeşitli optimizasyonlar içerir:

1. **Çok aşamalı build'ler**: Ayrı build ve runtime aşamaları
2. **Standalone çıktı**: Daha küçük image'lar için Next.js standalone modu
3. **Katman önbellekleme**: Daha hızlı yeniden build'ler için optimize edilmiş katman sıralaması
4. **Root olmayan kullanıcı**: Güvenlik en iyi uygulamaları
5. **Sağlık kontrolleri**: Otomatik servis sağlık izleme

Bu kılavuz, TAMIS uygulamasının Docker ile dağıtımı ve yönetimi için kapsamlı talimatlar sağlar. Docker yaklaşımı, tutarlılığı ve kolay yönetimi nedeniyle üretim ortamları için önerilir.
