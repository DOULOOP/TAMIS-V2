# Hatay Deprem Analiz Sistemi - Kuyruk ve İlerleme Takip Uygulaması

## 🚀 Uygulanan Yeni Özellikler

### 1. **FIFO Analiz Kuyruk Sistemi**
- **Arka Plan İşleme**: Tüm analizler artık özel bir çalışan iş parçacığında çalışır
- **Kuyruk Yönetimi**: Birden fazla analiz isteği otomatik olarak kuyruğa alınır ve FIFO sırasında işlenir
- **Bloklama Yok**: Kullanıcılar öncekiler tamamlanmayı beklemeden birden fazla analiz gönderebilir
- **Kuyruk Durumu**: Gerçek zamanlı kuyruk uzunluğu ve pozisyon takibi

### 2. **Gelişmiş Gerçek Zamanlı İlerleme Takibi**
- **Detaylı İlerleme Güncellemeleri**: Mevcut görev, ilerleme yüzdesi ve detaylı durum mesajlarını gösterir
- **Zaman Tabanlı İlerleme**: Analiz türü ve geçen süreye dayalı akıllı ilerleme tahmini
- **Aşama Tabanlı Güncellemeler**: Açıklayıcı mesajlarla farklı ilerleme aşamaları
- **Tamamlanma Tahminleri**: Analiz türüne dayalı tahmini tamamlanma süresi

### 3. **Geliştirilmiş Kullanıcı Arayüzü**
- **Dinamik Durum Gösterimi**: Hem çalışan analiz hem de kuyruk durumunu gösterir
- **Kuyruk Görselleştirmesi**: Bireysel analiz detayları ile genişletilebilir kuyruk görünümü
- **İptal İşlevi**: Kullanıcılar başlamadan önce kuyrukta bekleyen analizleri iptal edebilir
- **Akıllı Yoklama**: Aktifken daha hızlı güncellemeler (2s), boştayken daha yavaş (10s)
- **Daha İyi Hata İşleme**: Daha bilgilendirici hata mesajları ve yeniden deneme mekanizmaları

### 4. **Yeni API Uç Noktaları**

#### Kuyruk Yönetimi
- `GET /analysis/queue` - Detaylı analiz listesi ile mevcut kuyruk durumunu al
- `DELETE /analysis/queue/{id}` - Belirli bir kuyrukta bekleyen analizi iptal et
- `GET /analysis/history` - Tamamlanmış analiz geçmişini görüntüle

#### Gelişmiş Durum
- Gelişmiş `GET /analysis/status` - Artık kuyruk uzunluğu, mevcut analiz ID'si, tamamlanma tahminleri dahil
- Gelişmiş `POST /analysis/run` - Kuyruk pozisyonu ve analiz ID'si döndürür

## 🏗️ Teknik Uygulama

### Backend Değişiklikleri (`api_server.py`)

#### Kuyruk Sistemi Bileşenleri:
```python
# Global kuyruk ve durum takibi
analysis_queue = queue.Queue()  # Analiz istekleri için FIFO kuyruk
analysis_history = {}           # Tamamlanmış analiz geçmişi
analysis_worker_running = True  # Çalışan iş parçacığı kontrolü
```

#### Arka Plan Çalışan İş Parçacığı:
```python
def analysis_worker():
    """Analiz kuyruğunu işlemek için arka plan çalışanı"""
    # FIFO sırasında kuyruk öğelerini sürekli işler
    # Analiz sırasında gerçek zamanlı ilerlemeyi günceller
    # Tamamlanma geçmişini depolar
```

#### İlerleme Takibi:
```python
def update_progress(task_name: str, progress: int, details: str = ""):
    """Global analiz ilerlemesini detaylı bilgilerle güncelle"""
    # Durumu hemen günceller
    # Konsol günlüğü sağlar
    # Zaman damgalarını depolar
```

#### Gelişmiş Analiz Yürütme:
```python
def run_analysis_with_progress(script_name: str, task_name: str, analysis_id: str):
    """Detaylı ilerleme güncellemeleri ile analiz çalıştır"""
    # Aşama tabanlı ilerleme güncellemeleri
    # Zaman tabanlı ilerleme tahmini
    # Detaylı hata işleme ve raporlama
```

### Frontend Değişiklikleri

#### Gelişmiş API Servisi (`api.ts`):
```typescript
// Kuyruk ve geçmiş için yeni arayüzler
interface AnalysisQueueStatus { ... }
interface AnalysisHistory { ... }

// Yeni API metotları
async getAnalysisQueue(): Promise<AnalysisQueueStatus>
async getAnalysisHistory(limit: number): Promise<AnalysisHistory>
async cancelQueuedAnalysis(analysisId: string)
```

#### Gelişmiş Analiz Kontrolleri (`AnalysisControls.tsx`):
- **Kuyruk Görselleştirmesi**: İptal seçenekleri ile kuyrukta bekleyen analizleri gösterir
- **Gerçek Zamanlı Güncellemeler**: Aktifken her 3 saniyede kuyruk durumunu getirir
- **Gelişmiş İlerleme Gösterimi**: Zaman güncellemeleri ile detaylı ilerleme gösterir
- **Kullanıcı Dostu Arayüz**: Net durum göstergeleri ve eyleme dönüştürülebilir düğmeler

#### Akıllı Yoklama (`page.tsx`):
- **Dinamik Aralıklar**: Aktifken 2 saniyelik güncellemeler, boştayken 10 saniye
- **Durum Tabanlı Mantık**: Mevcut duruma dayalı farklı yoklama stratejileri
- **Verimli Kaynak Kullanımı**: Gereksiz API çağrılarını azaltır

## 📊 Analiz Akışı

### Öncesi (Tek Analiz):
1. Kullanıcı analiz düğmesine tıklar
2. Analiz çalışıyorsa → Hata mesajı
3. Müsaitse → Analizi başlat
4. Kullanıcı tamamlanmayı bekler
5. Sonuçlar gösterilir

### Sonrası (Kuyruk Sistemi):
1. Kullanıcı analiz düğmesine tıklar
2. Analiz FIFO kuyruğuna eklenir
3. Kullanıcı kuyruk pozisyonu ve analiz ID'si alır
4. Analiz hazır olduğunda arka planda işlenir
5. Gerçek zamanlı ilerleme güncellemeleri
6. Kullanıcı daha fazla analiz gönderebilir (otomatik kuyruğa alınır)
7. Kullanıcı kuyrukta bekleyen analizleri iptal edebilir
8. Tamamlandığında sonuçlar gösterilir
9. Analiz geçmişi korunur

## 🎯 Kullanıcı Deneyimi İyileştirmeleri

### 1. **Artık Bekleme Yok**
- Kullanıcılar hemen birden fazla analiz gönderebilir
- Önceki analizin tamamlanmasını beklemeye gerek yok
- Kuyruk sistemi her şeyi otomatik olarak halleder

### 2. **Gerçek Zamanlı Geri Bildirim**
- Her 2 saniyede detaylı ilerleme güncellemeleri
- Mevcut görev ve tamamlanma yüzdesi
- Tahmini tamamlanma süreleri
- Kuyruk pozisyonu ve uzunluğu

### 3. **Daha İyi Kontrol**
- Kuyrukta bekleyen tüm analizleri görüntüle
- Başlamadan önce kuyrukta bekleyen analizleri iptal et
- Analiz geçmişini izle
- Net durum göstergeleri

### 4. **Gelişmiş Hata İşleme**
- Detaylı hata mesajları
- Yeniden deneme mekanizmaları
- Bağlantı durumu izleme
- Zarif bozulma

## 🧪 Test

### Kuyruk Sistemi Test Betiği (`test_queue_system.py`)
- FIFO davranışını test etmek için birden fazla analiz gönderir
- Gerçek zamanlı ilerleme güncellemelerini izler
- Kuyruk durumu ve tamamlanma geçmişini gösterir
- Uygun hata işlemeyi doğrular

### Kullanım:
```bash
python test_queue_system.py
```

## 📈 Performans Optimizasyonları

### 1. **Verimli Yoklama**
- Aktiviteye dayalı akıllı yoklama aralıkları
- Boş dönemlerde azaltılmış API çağrıları
- Optimize edilmiş kuyruk durumu kontrolleri

### 2. **Arka Plan İşleme**
- Bloklama yapmayan analiz yürütme
- Kuyruk işleme için özel çalışan iş parçacığı
- Uygun kaynak yönetimi

### 3. **Bellek Yönetimi**
- Kuyruk boyutu izleme
- Analiz geçmişi temizleme
- Verimli veri yapıları

## 🔧 Yapılandırma

### Ortam Değişkenleri
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:7887
```

### API Sunucu Yapılandırması
- Kuyruk çalışan iş parçacığı sürekli çalışır
- Analiz sırasında her 2 saniyede ilerleme güncellemeleri
- Geçmiş son 100 tamamlanmış analizi tutar
- Eski kuyruk öğelerinin otomatik temizlenmesi

## 🚦 Durum Göstergeleri

### API Bağlantı Durumu:
- 🟢 **Bağlı**: API sağlıklı ve yanıt veriyor
- 🟡 **Kontrol Ediliyor**: Sağlık kontrolü devam ediyor
- 🔴 **Bağlantı Kesildi**: API kullanılamıyor

### Analiz Durumu:
- 🔄 **Çalışıyor**: Analiz şu anda ilerleme % ile yürütülüyor
- ⏳ **Kuyrukta**: Analiz pozisyonla birlikte kuyrukta bekliyor
- ✅ **Tamamlandı**: Analiz başarıyla tamamlandı
- ❌ **Başarısız**: Analiz bir hatayla karşılaştı

### Kuyruk Durumu:
- 📊 **Kuyruk Uzunluğu**: Bekleyen analiz sayısı
- 📍 **Pozisyon**: Kullanıcının kuyruktaki pozisyonu
- ⏱️ **Tahmini Süre**: Kuyruk durumuna dayalı tahmini başlama süresi

## 🎉 Sonuç

Sistem artık şunları sağlayan kusursuz, profesyonel bir deneyim sunuyor:
1. **Birden fazla analiz aynı anda gönderilebilir**
2. **Gerçek zamanlı ilerleme takibi detaylı durumu gösterir**
3. **FIFO kuyruk adil işleme sırası sağlar**
4. **Kullanıcılar analizleri üzerinde tam görünürlük ve kontrole sahip**
5. **Arayüz duyarlı ve kullanıcı dostu**
6. **Hata işleme sağlam ve bilgilendirici**

Bu uygulama, tek analizli sistemi profesyonel kuyruk yönetimi ve gerçek zamanlı izleme yetenekleri ile üretime hazır, çok kullanıcılı bir platforma dönüştürür.
