# Specification: Offline Sync & Resilience (Mobile)

## 1. Overview
Bu modül, saha personelinin internet bağlantısı olmayan ortamlarda (bodrum katlar, şantiyeler vb.) mobil uygulamayı kesintisiz kullanabilmesini sağlar. Çevrimdışı yapılan kritik işlemler (iş tamamlama, fotoğraf yükleme, not alma) yerel bir kuyrukta saklanacak ve bağlantı sağlandığında otomatik olarak sunucuya iletilecektir.

## 2. Goals
- **Sıfır Veri Kaybı:** Bağlantı koptuğunda girilen hiçbir veri kaybolmamalıdır.
- **Şeffaflık:** Kullanıcı çevrimdışı olduğunu ve verilerin ne zaman senkronize edileceğini bilmelidir.
- **Otomasyon:** Senkronizasyon işlemi kullanıcı müdahalesi gerektirmeden arka planda gerçekleşmelidir.

## 3. User Stories
- **Çalışan olarak**, internet olmayan bir bodrum katında montajı tamamlayıp "İşi Kapat" dediğimde uygulamanın hata vermemesini, işlemi kaydetmesini istiyorum.
- **Çalışan olarak**, internete bağlandığımda "5 işlem senkronize edildi" gibi bir bildirim görmek istiyorum.
- **Çalışan olarak**, uygulamanın üst kısmında "Çevrimdışı Mod" uyarısını görerek durumumun farkında olmak istiyorum.

## 4. Technical Architecture
### 4.1. Network Provider & Listener
- `NetInfo` kütüphanesi kullanılarak anlık bağlantı durumu (Online/Offline) takip edilecek.
- Bu durum `NetworkContext` üzerinden tüm uygulamaya dağıtılacak.

### 4.2. Action Queue (İşlem Kuyruğu)
- `AsyncStorage` üzerinde `OFFLINE_QUEUE` anahtarı altında bir JSON dizisi tutulacak.
- Kuyruk Elemanı Yapısı:
  ```json
  {
    "id": "uuid",
    "type": "COMPLETE_JOB",
    "payload": { "jobId": "123", "notes": "..." },
    "createdAt": "timestamp",
    "retryCount": 0
  }
  ```

### 4.3. Sync Engine (Senkronizasyon Motoru)
- Bağlantı "Offline" -> "Online" durumuna geçtiğinde tetiklenecek.
- Kuyruktaki işlemleri `createdAt` sırasına göre tek tek işleyecek (FIFO).
- Başarılı işlem kuyruktan silinecek, başarısız işlem için `retryCount` artırılacak (3 deneme sonrası "Hatalı" olarak işaretlenecek).

### 4.4. UI Components
- **Offline Banner:** Ekranın üst kısmında turuncu renkte "Bağlantı Yok - Veriler Cihazda Saklanıyor" uyarısı.
- **Sync Toast:** Senkronizasyon başladığında ve bittiğinde kullanıcıya bilgi veren bildirimler.

## 5. Functional Requirements
1.  **GET İstekleri:** Mevcut `api.js` içindeki önbellekleme yapısı korunacak ve iyileştirilecek.
2.  **POST/PUT İstekleri:**
    - Eğer Online ise: Doğrudan API'ye gönder.
    - Eğer Offline ise: `QueueService.add()` ile kuyruğa ekle ve kullanıcıya "Başarılı (Çevrimdışı Kaydedildi)" mesajı dön.
3.  **Fotoğraf Yükleme:** (Kapsam Dışı / Faz 2) Fotoğraflar şu an için sadece Online iken yüklenebilir olacak veya Base64 olarak kuyruğa eklenecek (boyut sınırı ile). *Not: İlk fazda sadece metin verileri (text data) senkronize edilecek.*

## 6. Acceptance Criteria
- İnternet kapalıyken bir işin durumu "Tamamlandı" olarak işaretlenebilmeli.
- Uygulama kapatılıp açılsa bile kuyruk korunmalı.
- İnternet açıldığında işlem otomatik olarak sunucuya gönderilmeli ve veritabanında güncellenmeli.