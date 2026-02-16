# 🛠️ Montaj Takip Sistemi (Assembly Tracker)

**Fabrika dışında çalışan montaj ve servis ekiplerinin gerçek zamanlı takibi, maliyet kontrolü ve iş yönetim süreçlerini dijitalleştiren modern web ve mobil uygulaması.**

Bu proje; Next.js 16, React Native ve modern web teknolojileri kullanılarak geliştirilmiş kapsamlı bir kurumsal çözümdür.

-----

## ✨ Temel Özellikler

### 📋 İş ve Süreç Yönetimi
* **Detaylı İş Takibi:** Montaj süreçleri için checklist sistemi, alt görevler (sub-steps) ve ilerleme takibi.
* **Zaman Yönetimi:** İş başlangıç/bitiş süreleri ve alt görev bazlı hassas zaman raporlama.
* **Otomasyon:** Alt görevler tamamlandığında ana görevin otomatik kapanması.
* **Görev Bloklama:** Sorunlu adımları işaretleme, bloklama nedeni ve not ekleme.

### 📊 Gelişmiş Raporlama Sistemi (Güncel)
* **Dinamik Dashboard:** KPI kartları ve "Haftalık Tamamlanan Adımlar" (Step-based) trend grafiği.
* **Zaman Bazlı Analiz:** Toplam harcama trendleri ve kategori bazlı (Yol, Yemek, Malzeme vb.) harcama grafikleri.
* **Otomatik Filtreleme:** Tarih aralığı, iş durumu, montaj seçimi ve kategoriye göre anlık güncellenen raporlar.
* **Dışa Aktarma:** Raporların Excel (.xlsx) ve PDF formatlarında tek tıkla indirilmesi.
* **Onay Yönetimi:** Rapor üzerinden bekleyen onaylara doğrudan erişim.

### 🛡️ Güvenlik ve Validasyon
* **Zorunlu Fotoğraf Kontrolü (API):** Alt iş adımları tamamlanırken backend tarafında fotoğraf kontrolü yapılır.
* **Rol Bazlı Erişim:** API rotaları ve sayfa erişimleri rol bazlı (RBAC) korunur.

### 👥 Ekip ve Rol Yönetimi
* **Gelişmiş Yetkilendirme:** 5 farklı rol desteği (Admin, Manager, Team Lead, Worker, Customer).
* **Dinamik Ekipler:** Ekip oluşturma, üye atama ve performans grafikleri.
* **Müşteri Paneli:** Müşterilerin kendi iş durumlarını takip edebileceği özel arayüz.

### 💰 Maliyet ve Finans
* **Masraf Takibi:** Malzeme, ulaşım, işçilik gibi kategorilerde masraf girişi (₺ desteği).
* **Onay Mekanizması:** Personel masrafları için Admin/Manager onay akışı.

### 📱 Mobil ve Saha Operasyonları
* **Cross-Platform Mobil Uygulama:** React Native (Expo) ile iOS ve Android uyumlu.
* **Çevrimdışı Mod (POC):** Saha şartlarına uygun, bağlantısız çalışma altyapısı.
* **Medya Yönetimi:** Yerel dosya sistemi entegrasyonu ile iş adımlarına fotoğraf kanıtı ekleme.
* **Lokasyon:** Harita entegrasyonu ve navigasyon özellikleri.

-----

## 🛠️ Teknoloji Yığını (Tech Stack)

### Frontend (Web)
* **Framework:** Next.js 16 (App Router, Turbopack)
* **Language:** TypeScript (Strict Mode)
* **Styling:** TailwindCSS v4, Radix UI, Lucide React
* **Components:** ShadCN/UI
* **Visualization:** Recharts

### Mobile (App)
* **Framework:** React Native, Expo (SDK 52+)
* **Navigation:** React Navigation v7
* **Storage:** AsyncStorage

### Backend & Database
### Backend & Database
* **API:** Next.js API Routes & Server Actions
* **Storage:** Cloudinary (Stream Uploads - Vercel Uyumlu)
* **Database:** PostgreSQL (Neon Serverless)
* **ORM:** Prisma ORM (Optimize edilmiş indeksler ile)
* **Auth:** NextAuth.js v5 (Beta)
* **Real-time:** Socket.IO

### 🚀 Vercel Deployment (Önemli)
Vercel üzerinde sorunsuz çalışması için aşağıdaki Çevre Değişkenlerinin (Environment Variables) tanımlanması zorunludur:
* `CLOUDINARY_CLOUD_NAME`
* `CLOUDINARY_API_KEY`
* `CLOUDINARY_API_SECRET`

*Not: Fotoğraf yükleme işlemleri yerel dosya sistemi yerine doğrudan Cloudinary stream üzerinden yapılır.*

### Kalite ve Test
* **Testing:** Vitest, @testing-library/react
* **Metodoloji:** TDD (Test-Driven Development) & Conductor Framework

-----

## 📦 Kurulum ve Başlangıç

### Gereksinimler
* Node.js 18+
* PostgreSQL (Local veya Neon/Supabase)
* npm

### 1. Web Uygulaması Kurulumu
```bash
# Repository'yi klonlayın
git clone [repository-url]
cd assembly_tracker

# Bağımlılıkları yükleyin
npm install

# Environment variables dosyasını oluşturun
cp .env.example .env

# Veritabanı şemasını oluşturun ve senkronize edin
npx prisma db push
npx prisma db seed

# Testleri çalıştırın
npm test

# Development sunucusunu başlatın
npm run dev
```

### 2. Mobil Uygulama Kurulumu
```bash
cd mobile
npm install
npx expo start
```

-----

## 📄 Lisans
Bu proje özel kullanım içindir. Ticari kullanım ve dağıtım hakları saklıdır.

**Son Güncelleme:** 07 Şubat 2026
**Versiyon:** 2.7.0 (Enterprise Features: Audit, API Docs, Webhooks)

<!-- Trigger Vercel Build: 2026-02-07 13:50 -->
