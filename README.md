# Assembly Tracker (Montaj Takip Sistemi)

Assembly Tracker, montaj ve saha operasyonlarını yönetmek, iş süreçlerini takip etmek ve maliyetleri kontrol altına almak için geliştirilmiş kapsamlı bir **Saha Yönetim Sistemi**dir.

Modern web teknolojileri (Next.js 16) ve mobil uygulama (React Native/Expo 54) ile güçlendirilmiş bu proje; yöneticiler, takım liderleri, saha çalışanları ve müşteriler için özelleştirilmiş deneyimler sunar.

---

## 🚀 Özellikler

### 📋 İş ve Süreç Yönetimi
*   **Detaylı İş Takibi:** Adımlar (Checklist), alt adımlar ve fotoğraf kanıtlı ilerleme takibi.
*   **Zaman Yönetimi:** İş başlangıç/bitiş süreleri ve alt görev bazlı hassas zaman raporlama (`StartedAt` / `CompletedAt`).
*   **Otomasyon:** Alt görevler tamamlandığında ana görevin durumunun otomatik güncellenmesi.
*   **Engel Bildirimi:** Sorunlu adımları bloklama, neden belirtme ve not ekleme.

### 👥 Ekip ve Rol Yönetimi
*   **Gelişmiş Yetkilendirme:** 5 farklı rol desteği (**Admin**, **Manager**, **Team Lead**, **Worker**, **Customer**).
*   **Dinamik Ekipler:** Ekip oluşturma, üye atama ve performans grafikleri.
*   **Müşteri Paneli:** Müşterilerin kendi iş durumlarını takip edebileceği özel arayüz.

### 💰 Maliyet ve Finans
*   **Masraf Takibi:** Malzeme, ulaşım, yemek vb. kategorilerde kanıtlı (fiş/fatura) masraf girişi.
*   **Onay Mekanizması:** Personel masrafları için Admin/Manager onay akışı.
*   **Raporlama:** Proje bazlı maliyet analizleri.

### 📱 Mobil ve Saha Operasyonları
*   **Cross-Platform:** React Native (Expo SDK 54) ile iOS ve Android tam uyumluluk.
*   **Saha Odaklı Arayüz:** Worker rolü için optimize edilmiş, büyük butonlar ve kolay navigasyon.
*   **Medya Yönetimi:** İş adımlarına fotoğraf yükleme (Kamera veya Galeri).
*   **Lokasyon:** Harita entegrasyonu ve navigasyon özellikleri.

### 🔔 Bildirim ve Raporlama
*   **Real-time Bildirimler:** Socket.IO ile anlık iş atama, onay ve durum bildirimleri.
*   **Görsel Geri Bildirim:** İşlem başarılarında animasyonlu modal ve uyarılar.
*   **PDF Raporlama:** İş detaylarının ve maliyet tablolarının PDF çıktısı.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

### Frontend (Web)
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **Core:** React 19
*   **Styling:** TailwindCSS v4, Radix UI, Lucide React
*   **State & Forms:** React Hook Form, Zod, Sonner
*   **Visualization:** Recharts, Leaflet

### Mobile (App)
*   **Framework:** React Native 0.81+, Expo SDK 54
*   **Navigation:** React Navigation 7
*   **Networking:** Axios, Socket.IO Client
*   **Storage:** AsyncStorage

### Backend & Database
*   **API:** Next.js API Routes (Serverless Functions)
*   **Server:** Custom Server (Socket.IO entegrasyonu için)
*   **Database:** PostgreSQL (Neon Serverless uyumlu)
*   **ORM:** Prisma ORM 5.x
*   **Auth:** NextAuth.js v5 (Beta)
*   **Real-time:** Socket.IO v4

---

## 📚 Dokümantasyon ve İlerleme

Projenin gelişim süreci ve planları için aşağıdaki belgeleri inceleyebilirsiniz:

*   **[CHANGELOG.md](CHANGELOG.md):** Sürüm notları, yapılan güncellemeler ve düzeltmeler.
*   **[ROADMAP.md](ROADMAP.md):** Gelecek planları, hedeflenen özellikler ve yol haritası.
*   **memory-bank/:** Projenin teknik mimarisi, tasarım kararları ve aktif geliştirme notları için kapsamlı "Hafıza Bankası" klasörü.

---

## 📦 Kurulum ve Başlangıç

### Gereksinimler
*   Node.js 18+ (20+ önerilir)
*   PostgreSQL Veritabanı
*   npm veya pnpm

### 1. Web Uygulaması Kurulumu

```bash
# Repository'yi klonlayın
git clone [repository-url]
cd assembly_tracker

# Bağımlılıkları yükleyin
npm install

# Environment variables dosyasını oluşturun
cp .env.example .env
# .env dosyasındaki veritabanı bağlantı bilgilerini güncelleyin

# Veritabanı şemasını oluşturun ve seed verilerini yükleyin
npx prisma generate
npx prisma db push
npm run db:seed

# Development sunucusunu başlatın (Socket.IO destekli custom server)
npm run dev
```

### 2. Mobil Uygulama Kurulumu

```bash
cd mobile

# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npx expo start
```
*Mobil uygulama için `mobile/src/services/api.js` veya `.env` dosyasındaki API URL'inin bilgisayarınızın yerel IP adresi olduğundan emin olun.*

---

## ⚙️ Environment Variables (.env)

Aşağıdaki değişkenler `.env` dosyasında tanımlanmalıdır:

```env
# Database
DATABASE_URL="postgresql://user:pass@host/db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# Cloudinary (Opsiyonel - Varsayılan: Yerel Depolama)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend (Email Bildirimleri - Opsiyonel)
RESEND_API_KEY="re_your_key"
FROM_EMAIL="noreply@yourdomain.com"
```

---

## 👥 Test Kullanıcıları (Seed Data)

`npm run db:seed` komutu ile oluşturulan varsayılan kullanıcılar:

| Rol | E-posta | Şifre | Yetki |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@montaj.com` | `admin123` | Tam yetki, sistem yönetimi |
| **Manager** | `manager@montaj.com` | `manager123` | Ekip ve iş yönetimi |
| **Team Lead** | `teamlead@montaj.com` | `teamlead123` | Ekip takibi |
| **Worker** | `worker1@montaj.com` | `worker123` | Saha işlemleri |
| **Customer** | `customer@sirket.com` | `customer123` | İş durumu görüntüleme |

---

## 📁 Proje Yapısı

```
assembly_tracker/
├── app/                      # Next.js App Router (Sayfalar ve API)
│   ├── (auth)/               # Login/Register
│   ├── admin/                # Admin Paneli
│   ├── worker/               # Worker Paneli
│   └── api/                  # Backend API Endpointleri
├── components/               # React Bileşenleri (UI, Forms, Charts)
├── lib/                      # Yardımcı Fonksiyonlar ve Konfigürasyonlar
├── mobile/                   # React Native (Expo) Mobil Projesi
├── prisma/                   # Veritabanı Şeması ve Seed
├── public/                   # Statik Dosyalar (Uploads vb.)
└── memory-bank/              # Proje Dokümantasyonu (Technical Context)
```

---

## 📄 Lisans

Bu proje özel kullanım içindir. Ticari kullanım ve dağıtım hakları saklıdır.

**Son Güncelleme:** Bugün (Aralık 2024)
