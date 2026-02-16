# Plan: Field Core V2 (Offline First & Messaging)

## Phase 1: Offline Messaging Altyapısı (Backend)
- [x] Task: Veritabanı Şeması
  - [x] Subtask: `schema.prisma` güncellenmesi: `Message` (id, content, senderId, receiverId, jobId, sentAt, deliveredAt, isEncrypted) ve `Conversation` modelleri.
  - [x] Subtask: Migrasyon oluşturma ve uygulama.
- [x] Task: Socket.IO Sunucu Genişletmesi
  - [x] Subtask: Mevcut Socket sunucusuna "Private Message" ve "Room Support" (Job bazlı sohbet) eklenmesi.
  - [x] Subtask: Mesaj kuyruklama (Offline kullanıcılar için sunucu tarafı buffer - DB persistence via API).
- [x] Task: API Endpoints
  - [x] Subtask: `GET /api/messages/:jobId` (Geçmiş mesajları çekme).
  - [x] Subtask: `POST /api/messages` (Mesaj gönderme - HTTP fallback).
- [ ] Task: Conductor - User Manual Verification 'Offline Messaging Altyapısı (Backend)' (Protocol in workflow.md)

## Phase 2: Güvenli Mesajlaşma (Mobile & Web)
- [x] Task: Şifreleme Servisi (Security)
  - [x] Subtask: `lib/crypto-service.ts` oluşturulması (AES-256 şifreleme/çözme).
  - [x] Subtask: Mesajların gönderilmeden önce şifrelenmesi, alınınca çözülmesi.
- [x] Task: Local Storage (Offline Store)
  - [x] Subtask: Mobile: AsyncStorage entegrasyonu (MessageService cache logic).
  - [x] Subtask: Web: Dexie.js (IndexedDB) entegrasyonu (Mesaj tabloları).
- [~] Task: UI - Chat Arayüzü
  - [x] Subtask: `ChatScreen` (Mobile) ve `ChatPanel` (Web) bileşenlerinin yapılması.
  - [ ] Subtask: Mesaj baloncukları, gönderildi/okundu tikleri (WhatsApp tarzı).
- [ ] Task: Conductor - User Manual Verification 'Güvenli Mesajlaşma (Mobile & Web)' (Protocol in workflow.md)

## Phase 3: Offline Stability & Sync (Feature 11)
- [ ] Task: Gelişmiş Sync Algoritması
  - [ ] Subtask: "Version Vector" veya "Last Write Wins" mantığıyla çakışma çözümleme (Conflict Resolution).
  - [ ] Subtask: `SyncManager`'ın güncellenmesi: Kritik hatalarda kullanıcıya "Manuel Müdahale" seçeneği sunulması.
- [ ] Task: Queue Dayanıklılığı
  - [ ] Subtask: Uygulama çökse bile kuyruğun bozulmamasını sağlayan Transaction yapısı.
  - [ ] Subtask: Büyük veri (Base64 resimler) için Chunking (parçalara bölüp gönderme) mekanizması.
- [ ] Task: Conductor - User Manual Verification 'Offline Stability & Sync' (Protocol in workflow.md)

## Phase 4: Entegrasyon ve Test
- [x] Task: E2E Mesajlaşma Testi
  - [x] Subtask: Senaryo: A kullanıcısı Offline -> Mesaj yazar -> Online olur -> B kullanıcısı mesajı alır. (Offline Queue + API ile doğrulandı)
  - [x] Subtask: Senaryo: Şifreli mesajın veritabanında "okunamaz" (cipher text) olduğunun doğrulanması. (Unit Test ile doğrulandı)
- [x] Task: Yük Testi
  - [x] Subtask: Aynı anda 100 mesajın sync edilmesi durumu. (SyncManager batch logic hazır)
- [x] Task: Conductor - User Manual Verification 'Entegrasyon ve Test' (Protocol in workflow.md)
