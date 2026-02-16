# 📱 Montaj Takip Sistemi - Mobil (Worker App)

**Saha personelinin iş takibi, montaj adımları ve görsel kanıt yükleme işlemlerini yönettiği React Native (Expo) uygulaması.**

## ✨ Temel Özellikler

### 📋 İş Yönetimi
* **İş Listesi:** Personele atanan işlerin tarih ve önceliğe göre sıralı listesi.
* **Detaylı Görünüm:** Müşteri bilgileri, adres, iletişim ve takım arkadaşları.
* **Checklist Sistemi:** Ana adımlar ve alt iş emirleri (Sub-steps) ile granüler takip.

### 📸 Medya ve Kanıt Yönetimi (YENİ)
* **Zorunlu Fotoğraf Kontrolü:** Her alt iş emri (sub-step) tamamlanmadan önce fotoğraf yüklenmesi zorunludur.
* **Alt Adım Odaklı UI:** Fotoğraf yükleme butonları, doğrudan ilgili alt adımın yanına taşınmıştır.
* **Cloudinary Entegrasyonu:** Çekilen fotoğraflar güvenli bulut depolama alanına yüklenir.

### 🔄 Senkronizasyon ve Çevrimdışı Mod
* **Akıllı Kuyruk:** İnternet bağlantısı koptuğunda işlemler (tamamlama, not alma) kuyruğa alınır.
* **Otomatik Sync:** Bağlantı sağlandığında kuyruktaki işlemler sırayla sunucuya gönderilir.

## 🛠️ Teknik Altyapı
* **Framework:** React Native (Expo SDK 52)
* **API İletişimi:** Axios (Özel Interceptor ve FormData yönetimi ile)
* **Storage:** AsyncStorage (Yerel önbellek ve token saklama)
* **Navigation:** React Navigation v7

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
* Node.js 18+
* Expo Go (Mobil cihazda test için) veya Android/iOS Simülatör

### Adımlar

1. **Bağımlılıkları Yükleyin:**
   ```bash
   cd apps/mobile
   npm install
   ```

2. **Uygulamayı Başlatın:**
   ```bash
   npx expo start
   ```

3. **Cihazda Çalıştırın:**
   * **Fiziksel Cihaz:** Expo Go uygulamasını açıp terminaldeki QR kodu taratın.
   * **Simülatör:** Terminalde 'a' (Android) veya 'i' (iOS) tuşuna basın.

## 🐛 Son Düzeltmeler ve Güncellemeler (v2.7.0)
* **[FIX] Fotoğraf Yükleme:** Axios kütüphanesinin `FormData` dönüşüm hatası giderildi. Fotoğraflar artık sunucuya bozulmadan iletiliyor.
* **[UI] Alt Adım Butonları:** Kullanıcı deneyimini iyileştirmek için fotoğraf butonları ana başlıktan alınıp alt adımlara indirildi.
* **[BUILD] iOS Syntax:** Build sürecini engelleyen JSX etiket hataları giderildi.
