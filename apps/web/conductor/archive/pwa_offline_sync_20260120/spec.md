# Specification: PWA Offline Sync & Queue System

## 1. Executive Summary
Web uygulamasının (PWA), internet bağlantısının olmadığı durumlarda da veri girişi (iş tamamlama, masraf ekleme vb.) yapabilmesini ve bağlantı sağlandığında bu verilerin otomatik olarak sunucuyla senkronize edilmesini sağlar. Bu yapı, mobil uygulamada (React Native) halihazırda çalışan `SyncManager` ve `QueueService` mimarisinin Web teknolojilerine (`IndexedDB`, `Service Worker`) uyarlanmasıdır.

## 2. Problem Statement
Saha personeli tablet veya laptop kullanarak arazide çalışırken internet bağlantısı kesilebilir. Şu anki PWA yapısı sadece sayfaları görüntüler (cache), ancak veri girişine izin vermez veya hata verir. Bu durum veri kaybına ve iş akışının durmasına neden olur.

## 3. Proposed Solution
*   **Depolama:** Tarayıcı tabanlı `IndexedDB` (Dexie.js kütüphanesi önerilir) kullanılarak çevrimdışı veriler güvenli bir şekilde saklanacak.
*   **Kuyruk (Queue) Mekanizması:** İnternet yokken yapılan API istekleri (POST, PUT, DELETE) yakalanıp bir kuyruğa eklenecek.
*   **Senkronizasyon (Sync):** `window.online` olayı veya Service Worker Background Sync API kullanılarak bağlantı geldiğinde kuyruk işlenecek.
*   **UI Geri Bildirimi:** Kullanıcıya "Çevrimdışı Moddasınız" ve "Senkronizasyon Tamamlandı" gibi bildirimler (Toast) gösterilecek.

## 4. User Stories
*   **User:** İnternetim kesildiğinde "İşi Tamamla" butonuna basabilmeli ve verimin kaybolmadığını bilmeliyim.
*   **User:** İnternetim geldiğinde hiçbir şey yapmama gerek kalmadan verilerim sisteme yüklenmeli.
*   **Admin:** Sahadan gelen verilerin (çevrimdışı da olsa) tutarlı ve eksiksiz olduğunu görmeliyim.

## 5. Technical Requirements
*   **Libraries:** `idb` veya `dexie` (IndexedDB wrapper), `@ducanh2912/next-pwa` (Mevcut).
*   **Browser Support:** Modern tarayıcılar (Chrome, Safari, Firefox, Edge).
*   **Conflict Resolution:** Basit "Son Gelen Kazanır" veya sunucu taraflı validasyon. Mobil ile aynı mantık.

## 6. Risklers & Mitigations
*   **Risk:** Tarayıcı önbelleğinin temizlenmesi.
    *   *Mitigation:* Kullanıcıyı uyarmak ve veriler sync olmadan çıkış yapmayı (logout) engellemek.
*   **Risk:** Token süresinin dolması (Auth).
    *   *Mitigation:* Sync sırasında token yenileme mekanizmasının çalışması.
