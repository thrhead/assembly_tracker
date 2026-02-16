# Plan: Customer Portal V1

Bu track, müşterilerin sisteme giriş yaparak kendilerine ait montaj işlerini gerçek zamanlı takip edebilmelerini ve iş tamamlandığında onay verebilmelerini sağlar.

## Phase 1: Kimlik Doğrulama ve Yönlendirme
- [x] Task: Müşteri Rolü Kontrolü
  - [x] Subtask: `middleware.ts` veya ilgili sayfalarda `CUSTOMER` rolü için yetkilendirme kontrolü ekle.
  - [x] Subtask: Login sonrası müşterileri otomatik olarak `/customer` sayfasına yönlendir.

## Phase 2: Müşteri Paneli (Dashboard)
- [x] Task: İş Listesi Sayfası
  - [x] Subtask: `app/customer/page.tsx` sayfasını oluştur.
  - [x] Subtask: Sadece oturum açan müşteriye ait (customerId ile eşleşen) işleri listele.
  - [x] Subtask: Kart tasarımı (İş başlığı, Durum, Beklenen Tarih).

## Phase 3: İş Detay ve Takip
- [x] Task: Detay Sayfası Tasarımı
  - [x] Subtask: `app/customer/jobs/[id]/page.tsx` sayfasını oluştur.
  - [x] Subtask: İlerleme durumu (Progress bar) ve kronolojik iş adımları görünümü.
- [x] Task: Medya ve Kanıt Görünümü
  - [x] Subtask: Saha ekiplerinin yüklediği fotoğrafların müşteri tarafından görüntülenebilmesi.

## Phase 4: Dijital Onay ve Kapanış
- [x] Task: Onay Butonu ve Aksiyonu
  - [x] Subtask: İş `COMPLETED` durumuna geldiğinde müşteriye "Onayla / Reddet" seçeneklerini sun.
  - [x] Subtask: `POST /api/customer/jobs/[id]/approve` endpoint'ini oluştur.
- [x] Task: Feedback Döngüsü
  - [x] Subtask: Müşteri onayladığında işi `ACCEPTED` olarak işaretle ve yöneticiye bildir.

## Phase 5: Son Kontroller ve Yayın
- [x] Task: E2E Manuel Doğrulama
  - [x] Subtask: Müşteri hesabı oluştur -> Giriş yap -> İşini takip et -> Onayla senaryosunu test et. (Kod İncelemesi ile doğrulandı)
