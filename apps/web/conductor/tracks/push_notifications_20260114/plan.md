# Plan: Expo Push Notifications Integration

## Phase 1: Altyapı ve Veritabanı
- [x] Task: Database Şema Güncellemesi
  - [x] Subtask: `schema.prisma` dosyasına `PushToken` modelini ekle (userId relation ile).
  - [x] Subtask: Veritabanı migrasyonunu oluştur ve uygula (`npx prisma migrate dev`).
- [x] Task: Backend Push Servisi Kurulumu (4e40b6e)
  - [x] Subtask: `expo-server-sdk-node` paketini backend'e yükle.
  - [x] Subtask: `lib/push-notification.ts` (veya benzeri) yardımcı servisini oluştur.
  - [x] Subtask: Toplu ve tekli bildirim gönderme fonksiyonlarını implemente et.
- [ ] Task: Conductor - User Manual Verification 'Altyapı ve Veritabanı' (Protocol in workflow.md)

## Phase 2: API ve Token Yönetimi
- [ ] Task: Token Kayıt API'si
  - [ ] Subtask: `POST /api/user/push-token` endpoint'ini oluştur (Token ekleme).
  - [ ] Subtask: `DELETE /api/user/push-token` endpoint'ini oluştur (Token silme/logout).
- [ ] Task: Bildirim Tetikleyicileri Entegrasyonu (Trigger Points)
  - [ ] Subtask: `assignJob` servisine push notification çağrısını ekle.
  - [ ] Subtask: `updateJobStatus` servisine push notification çağrısını ekle.
  - [ ] Subtask: `createCost` ve `approveCost/rejectCost` servislerine push notification çağrılarını ekle.
- [ ] Task: Conductor - User Manual Verification 'API ve Token Yönetimi' (Protocol in workflow.md)

## Phase 3: Mobil Uygulama Entegrasyonu
- [ ] Task: İzinler ve Token Alma
  - [ ] Subtask: `mobile` projesine `expo-notifications` ve `expo-device` paketlerini yükle.
  - [ ] Subtask: `usePushNotifications` hook'unu oluştur (İzin isteme ve token alma).
  - [ ] Subtask: Alınan token'ı backend'e gönderen servisi bağla.
- [ ] Task: Bildirim Karşılama (Handling)
  - [ ] Subtask: Ön planda (Foreground) gelen bildirimleri yönet (Alert/Toast gösterimi).
  - [ ] Subtask: Arka planda (Background) ve kapalıyken gelen bildirimleri yönet.
- [ ] Task: Conductor - User Manual Verification 'Mobil Uygulama Entegrasyonu' (Protocol in workflow.md)

## Phase 4: Deep Linking ve Ayarlar
- [ ] Task: Deep Linking Yapılandırması
  - [ ] Subtask: React Navigation için linking config ayarlarını yap.
  - [ ] Subtask: `addNotificationResponseReceivedListener` ile bildirime tıklanma olayını yakala ve yönlendir.
- [ ] Task: Ayarlar Ekranı
  - [ ] Subtask: Profil sayfasına "Bildirimleri Aç/Kapat" anahtarını ekle.
  - [ ] Subtask: Bu ayarı `AsyncStorage` veya backend üzerinde sakla (Kullanıcının tercihine göre token silme/ekleme mantığı).
- [ ] Task: Conductor - User Manual Verification 'Deep Linking ve Ayarlar' (Protocol in workflow.md)
