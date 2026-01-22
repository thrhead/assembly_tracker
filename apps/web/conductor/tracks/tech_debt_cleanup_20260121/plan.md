# Plan: Infrastructure Hardening & Tech Debt Cleanup

Bu track, Explorer Agent tarafından tespit edilen güvenlik risklerini ve teknik borçları gidermeyi hedefler.

## Phase 1: Güvenlik Sıkılaştırma
- [ ] Task: CORS Yapılandırması
  - [ ] Subtask: `next.config.js` dosyasındaki `Access-Control-Allow-Origin: *` ayarını kaldır.
  - [ ] Subtask: Sadece `*.vercel.app` ve `localhost` domainlerine izin veren bir whitelist mekanizması kur.

## Phase 2: Proje Temizliği
- [ ] Task: Git Ignore Güncellemesi
  - [ ] Subtask: `apps/web_sync_repo` ve `apps/mobile_sync_repo` klasörlerini kök dizindeki `.gitignore` dosyasına ekle.
- [ ] Task: Gereksiz Dosya Kontrolü
  - [ ] Subtask: `apps/mobile` içinde kullanılmayan eski bileşenleri (varsa) tespit et ve temizle.

## Phase 3: Senkronizasyon İyileştirmeleri
- [ ] Task: Web SyncManager Retry Logic
  - [ ] Subtask: `apps/web/lib/sync-manager.ts` dosyasına `retryCount` mantığı ekle.
  - [ ] Subtask: 3 başarısız denemeden sonra isteği "FAILED" olarak işaretle veya kuyruğun en sonuna at (Exponential Backoff).

## Phase 4: Son Kontrol
- [ ] Task: Conductor - User Manual Verification 'Infrastructure Hardening' (Protocol in workflow.md)
