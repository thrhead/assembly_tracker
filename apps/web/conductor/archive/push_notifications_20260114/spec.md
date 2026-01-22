# Specification: Expo Push Notifications Integration

## 1. Overview
Bu modül, Assembly Tracker mobil uygulaması için Expo Push Notification sistemini entegre eder. Saha personelinin (Worker) ve yöneticilerin (Manager/Admin) kritik iş süreçlerinden (iş atamaları, durum değişiklikleri, masraf onayları) anlık olarak haberdar olmasını sağlar. Sistem, kullanıcının birden fazla cihazını destekleyecek ve bildirimlere tıklandığında ilgili detay sayfasına yönlendirme yapacaktır.

## 2. Goals
- **Anlık Bilgilendirme:** Kritik işlemler gerçekleştiğinde kullanıcıya saniyeler içinde ulaşmak.
- **Operasyonel Hız:** Deep linking sayesinde kullanıcıyı doğrudan ilgili işleme yönlendirerek zaman kaybını önlemek.
- **Çoklu Cihaz Desteği:** Kullanıcının tüm aktif cihazlarına (telefon, tablet vb.) bildirim iletmek.

## 3. Functional Requirements
### 3.1. Token Yönetimi
- Mobil uygulama açıldığında veya login olunduğunda Expo Push Token alınacak.
- Backend'de `User` modeli ile ilişkili yeni bir `PushToken` tablosu oluşturulacak (One-to-Many).
- Kullanıcı logout olduğunda ilgili cihazın token'ı sistemden silinecek.

### 3.2. Bildirim Tetikleyicileri
Aşağıdaki olaylar gerçekleştiğinde otomatik push bildirim gönderilecek:
- **İş Atama:** Bir iş bir çalışana atandığında.
- **İş Durumu:** İşin durumu "Başladı" veya "Tamamlandı" olarak güncellendiğinde (yöneticilere).
- **Masraf Girişi:** Yeni bir masraf onaya gönderildiğinde (yöneticilere).
- **Masraf Kararı:** Masraf onaylandığında veya reddedildiğinde (çalışana).

### 3.3. Bildirim İçeriği
- Bildirimler detaylı bilgi içerecek (Örn: "Müşteri X için yeni montaj işi atandı", "Y masrafı onaylandı: 150 TL").
- Bildirim payload'u içinde yönlendirme için gerekli ID'ler (jobId, costId) bulunacak.

### 3.4. Deep Linking & UI
- Bildirim tıklandığında uygulama açılacak ve ilgili iş veya masraf detay sayfasına otomatik yönlendirme yapılacak.
- Profil sayfasında genel bir "Bildirimleri İzin Ver/Engelle" toggle (anahtar) seçeneği bulunacak.

## 4. Technical Architecture
- **Client Side:** `expo-notifications` kütüphanesi kullanılacak.
- **Server Side:** `expo-server-sdk-node` kütüphanesi ile push bildirimleri Expo servislerine iletilecek.
- **Database:** Prisma şemasına `PushToken` modeli eklenecek.

## 5. Acceptance Criteria
- Uygulama ilk açılışta bildirim izni istemeli.
- Kullanıcıya bir iş atandığında telefonuna anlık bildirim gelmeli.
- Bildirime tıklandığında uygulama ilgili işin detay sayfasını açmalı.
- Kullanıcı bildirimleri kapattığında artık push almamalı.
- Kullanıcı farklı bir cihazdan giriş yaparsa, her iki cihazına da bildirim gitmeli.

## 6. Out of Scope
- Bildirim geçmişi (Notification History) sayfası (Bu aşamada sadece anlık bildirimler).
- SMS veya Email bildirimleri (Mevcut Email sistemi ile entegre edilebilir ancak bu track'in ana odağı değil).
