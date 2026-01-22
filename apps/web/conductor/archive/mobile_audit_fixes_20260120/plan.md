# Plan: Mobile UX & Performance Audit Fixes

Bu track, `mobile_audit.py` tarafından tespit edilen 52 kritik sorunu ve temel uyarıları gidermeyi hedefler.

## Phase 1: Kritik Performans Düzeltmeleri
- [x] Task: Liste Performansı (EventList.js)
  - [x] Subtask: `EventList.js` dosyasında `key={index}` kullanımını benzersiz ID (`item.id`) ile değiştir.
  - [x] Subtask: Eğer ID yoksa, veri kaynağına ID ekle veya kararlı bir key üret.
- [x] Task: Gereksiz Render Önleme
  - [x] Subtask: `App.js` ve ana listelerde `React.memo` veya `useCallback` eksikliklerini kontrol et ve ekle.

## Phase 2: Dokunma Hedefi (Touch Target) İyileştirmeleri
*Hedef: Tüm tıklanabilir alanlar en az 44x44 (iOS) / 48x48 (Android) olmalıdır.*
- [x] Task: Küçük Buton Düzeltmeleri
  - [x] Subtask: `NotificationBadge.js` (18px -> 44px hit area).
  - [x] Subtask: `TeamFormModal.js` (24px -> 48px hit area).
  - [x] Subtask: `JobListItem.js` (Küçük ikon butonları için `hitSlop` ekle).
  - [x] Subtask: `SuccessModal.js` ve `ConfirmationModal.js` kapatma butonlarını genişlet.

## Phase 3: Navigasyon ve Platform Uyumluluğu
- [x] Task: Android Geri Tuşu Yönetimi
  - [x] Subtask: `App.js` veya ana navigasyon yığınına `BackHandler` dinleyicisi ekle (React Navigation ile uyumlu).
- [x] Task: Güvenli Alan (Safe Area) Kontrolü
  - [x] Subtask: `index.js` ve `App.js` seviyesinde `SafeAreaProvider` ve `SafeAreaView` kullanımını doğrula (Çentik/Home bar için).

## Phase 4: Tipografi ve Renk Sistemi
- [x] Task: Font Ölçekleme
  - [x] Subtask: Sabit `fontSize` değerlerini `context/ThemeContext` veya `utils` üzerinden ölçeklenebilir (sp) birimlere dönüştür.
- [x] Task: Karanlık Mod Desteği
  - [x] Subtask: `App.js` ve `index.js` içinde eksik olan `useColorScheme` entegrasyonunu tamamla.

## Phase 5: Son Kontrol
- [x] Task: Audit Script Tekrarı
  - [x] Subtask: `python scripts/mobile_audit.py apps/mobile` komutunu çalıştır ve sorun sayısının düştüğünü doğrula.
