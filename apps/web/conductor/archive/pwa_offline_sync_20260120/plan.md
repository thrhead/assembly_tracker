# Plan: PWA Offline Sync & Queue System (Completed)

## Phase 1: Altyapı Kurulumu (Tamamlandı)
- [x] Task: Paket Kurulumu
  - [x] Subtask: `dexie` paketi yüklendi.
- [x] Task: Database Yapılandırması
  - [x] Subtask: `lib/offline-db.ts` oluşturuldu ve şema tanımlandı.
- [x] Task: Queue Mantığı
  - [x] Subtask: `SyncManager` (Web) ile kuyruk işleme mantığı kuruldu.

## Phase 2: Network Tespiti ve Provider (Tamamlandı)
- [x] Task: Network Hook & Provider
  - [x] Subtask: `hooks/use-network.ts` hook'unu oluştur.
  - [x] Subtask: `components/providers/sync-provider.tsx` oluştur ve `layout.tsx`'e ekle.
  - [x] Subtask: Bağlantı geri geldiğinde `SyncManager.processQueue()` tetiklenmesini sağla.

## Phase 3: Global API Interception (Tamamlandı)
- [x] Task: Global API Client
  - [x] Subtask: `lib/api-client.ts` oluştur (Standard fetch wrapper).
  - [x] Subtask: İstek hatası (Network Error) durumunda POST/PUT/PATCH/DELETE isteklerini otomatik olarak `offlineDB.syncQueue`'ya ekle.
- [x] Task: Uygulama Genelinde Yaygınlaştırma
  - [x] Subtask: Mevcut formlardaki (Job Complete, Cost Dialog vb.) fetch çağrılarını yeni `apiClient` ile değiştir.

## Phase 4: UI İyileştirmeleri ve Doğrulama (Tamamlandı)
- [x] Task: Durum Göstergeleri
  - [x] Subtask: Navbar'da "Çevrimdışı Mod" uyarısı ve Sync indikatörü.
  - [x] Subtask: Kuyrukta bekleyen işlem sayısını gösteren bir rozet (badge).
- [x] Task: Senaryo Testleri
  - [x] Subtask: Çevrimdışı iş tamamlama ve masraf girişi testi (Kod seviyesinde hazırlandı).
