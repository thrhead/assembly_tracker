# Plan: Offline Sync & Resilience (Mobile)

## Phase 1: Temel Altyapı ve Bağlantı İzleme [checkpoint: 837862f]
- [x] Task: Test Altyapısı Kurulumu
  - [x] Subtask: Jest ve Testing Library paketlerinin yüklenmesi
  - [x] Subtask: Jest yapılandırmasının oluşturulması
- [x] Task: Network Durumu Yönetimi
  - [x] Subtask: Network Context için testlerin yazılması (Online/Offline tespiti)
  - [x] Subtask: NetInfo kullanarak NetworkProvider bileşeninin implementasyonu
- [x] Task: Kullanıcı Arayüzü Geri Bildirimi
  - [x] Subtask: OfflineBanner bileşeni için testlerin yazılması
  - [x] Subtask: Global OfflineBanner (Bağlantı yok uyarısı) implementasyonu
- [x] Task: Conductor - User Manual Verification 'Temel Altyapı ve Bağlantı İzleme' (Protocol in workflow.md) 837862f

## Phase 2: İşlem Kuyruğu (Action Queue) Servisi [checkpoint: 8afffab]
- [x] Task: Kuyruk Depolama Mantığı e1b1fd9
  - [x] Subtask: QueueService (Ekleme, Listeleme, Silme) için testlerin yazılması
  - [x] Subtask: AsyncStorage tabanlı QueueService implementasyonu
- [x] Task: Kuyruk Başlatma ve Kalıcılık 4492991
  - [x] Subtask: Uygulama açılışında kuyruk yükleme mantığı için testlerin yazılması
  - [x] Subtask: Queue başlatma (initialization) mantığının kurulması
- [x] Task: Conductor - User Manual Verification 'İşlem Kuyruğu (Action Queue) Servisi' (Protocol in workflow.md) 8afffab

## Phase 3: API İstemcisi ve Interceptor Entegrasyonu
- [x] Task: İstek Yönlendirme Mekanizması e4b7704
  - [x] Subtask: API Interceptor (Offline iken POST/PUT isteklerini kuyruğa yönlendirme) testlerinin yazılması
  - [x] Subtask: `services/api.js` dosyasının kuyruk sistemini destekleyecek şekilde güncellenmesi
- [x] Task: Servis Katmanı Uyumluluğu e4b7704
  - [x] Subtask: JobService'in çevrimdışı iş kapatma senaryosu için test edilmesi
  - [x] Subtask: Mevcut servislerin (Job, Cost vb.) kuyruk yapısıyla uyumlu çalıştığının doğrulanması
- [~] Task: Conductor - User Manual Verification 'API İstemcisi ve Interceptor Entegrasyonu' (Protocol in workflow.md)

## Phase 4: Senkronizasyon Motoru (Sync Engine)
- [ ] Task: Otomatik Senkronizasyon Mantığı
  - [ ] Subtask: SyncManager (Kuyruk işleme, FIFO, hata yönetimi) testlerinin yazılması
  - [ ] Subtask: Bağlantı geldiğinde kuyruğu otomatik eriten SyncManager implementasyonu
- [ ] Task: Çakışma ve Hata Yönetimi
  - [ ] Subtask: Başarısız istekler için retry (yeniden deneme) mantığı testlerinin yazılması
  - [ ] Subtask: Hata durumunda kullanıcıya bildirim gönderilmesi ve kuyruk yönetimi
- [ ] Task: Conductor - User Manual Verification 'Senkronizasyon Motoru (Sync Engine)' (Protocol in workflow.md)

## Phase 5: Finalizasyon ve E2E Testleri
- [ ] Task: Uçtan Uca (E2E) Doğrulama
  - [ ] Subtask: Manuel E2E testleri (Uçak modu -> İşlem -> Bağlantı -> Veri Doğrulama)
  - [ ] Subtask: UI/UX cilalaması (Toast bildirimleri, yüklenme durumları)
- [ ] Task: Conductor - User Manual Verification 'Finalizasyon ve E2E Testleri' (Protocol in workflow.md)