# Plan: Infrastructure Hardening & Tech Debt Cleanup

Bu track, Explorer Agent tarafından tespit edilen güvenlik risklerini ve teknik borçları gidermeyi hedefler.

## Phase 1: Güvenlik Sıkılaştırma
- [x] Task: CORS Yapılandırması
  - [x] Subtask: `next.config.js` dosyasındaki `Access-Control-Allow-Origin: *` ayarını kaldır.
  - [x] Subtask: Sadece `*.vercel.app` ve `localhost` domainlerine izin veren bir whitelist mekanizması kur.

## Phase 2: Proje Temizliği
- [x] Task: Git Ignore Güncellemesi
  - [x] Subtask: `apps/web_sync_repo` ve `apps/mobile_sync_repo` klasörlerini kök dizindeki `.gitignore` dosyasına ekle.
- [x] Task: Gereksiz Dosya Kontrolü
  - [x] Subtask: `apps/mobile` içinde kullanılmayan eski bileşenleri (varsa) tespit et ve temizle.
    - *Aksiyon:* `ngrok.exe` ve `HomeScreen.js` kaldırıldı.

## Phase 3: Senkronizasyon İyileştirmeleri
- [x] Task: Web SyncManager Retry Logic
  - [x] Subtask: `apps/web/lib/sync-manager.ts` dosyasına `retryCount` mantığı ekle.
  - [x] Subtask: 3 başarısız denemeden sonra isteği "FAILED" olarak işaretle veya kuyruğun en sonuna at (Exponential Backoff).

## Phase 4: Son Kontrol
- [x] Task: Conductor - User Manual Verification 'Infrastructure Hardening' (Protocol in workflow.md)
