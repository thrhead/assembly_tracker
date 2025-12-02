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

### 👥 Ekip ve Rol Yönetimi

  * **Gelişmiş Yetkilendirme:** 5 farklı rol desteği (Admin, Manager, Team Lead, Worker, Customer).
  * **Dinamik Ekipler:** Ekip oluşturma, üye atama ve performans grafikleri.
  * **Müşteri Paneli:** Müşterilerin kendi iş durumlarını takip edebileceği özel arayüz.

### 💰 Maliyet ve Finans

  * **Masraf Takibi:** Malzeme, ulaşım, işçilik gibi kategorilerde masraf girişi (₺ desteği).
  * **Onay Mekanizması:** Personel masrafları için Admin/Manager onay akışı.

### 📱 Mobil ve Saha Operasyonları

  * **Cross-Platform Mobil Uygulama:** React Native (Expo) ile iOS ve Android uyumlu.
  * **Saha Odaklı Arayüz:** Worker rolü için optimize edilmiş, kolay kullanımlı mobil ekranlar.
  * **Medya Yönetimi:** Cloudinary entegrasyonu ile iş adımlarına fotoğraf yükleme ve otomatik temizlik.
  * **Lokasyon:** Harita entegrasyonu ve navigasyon özellikleri.

### 🔔 Bildirim ve Raporlama

  * **Real-time Bildirimler:** Socket.IO ile anlık iş ve onay bildirimleri.
  * **Email Bildirimleri:** Resend ile tamamlanan işler ve maliyet onayları için e-posta gönderimi.
  * **PDF Raporlama:** İş detaylarının ve maliyet tablolarının PDF olarak çıktısının alınması.

-----

## 🛠️ Teknoloji Yığını (Tech Stack)

### Frontend (Web)

  * **Framework:** Next.js 16 (App Router, Turbopack)
  * **Language:** TypeScript
  * **Styling:** TailwindCSS, Radix UI, Lucide React
  * **State & Forms:** React Hook Form, Zod, Sonner (Toast)
  * **Visualization:** Recharts, Leaflet (Maps)

### Mobile (App)

  * **Framework:** React Native, Expo
  * **Navigation:** React Navigation
  * **Storage:** AsyncStorage

### Backend & Database

  * **API:** Next.js API Routes (Serverless)
  * **Database:** PostgreSQL (Neon Serverless önerilir)
  * **ORM:** Prisma ORM
  * **Auth:** NextAuth.js v4
  * **Real-time:** Socket.IO (Custom Server)

### DevOps & Services

  * **Media:** Cloudinary (Image Hosting)
  * **Email:** Resend & React Email
  * **PDF:** jsPDF

-----

## 📦 Kurulum ve Başlangıç

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler

  * Node.js 18+
  * PostgreSQL (Local veya Neon/Supabase gibi hosted çözümler)
  * npm veya pnpm

### 1\. Web Uygulaması Kurulumu

```bash
# Repository'yi klonlayın
git clone [repository-url]
cd assembly_tracker

# Bağımlılıkları yükleyin
npm install

# Environment variables dosyasını oluşturun
cp .env.example .env

# Veritabanı şemasını oluşturun ve seed verilerini yükleyin
npx prisma generate
npx prisma db push
npx prisma db seed

# Development sunucusunu başlatın
npm run dev
```

### 2\. Mobil Uygulama Kurulumu

```bash
cd mobile
npm install
npx expo start
```

### ⚙️ Environment Variables (.env)

Aşağıdaki değişkenleri `.env` dosyanıza ekleyin:

```env
# Database
DATABASE_URL="postgresql://user:pass@host/db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key" # Oluşturmak için: openssl rand -base64 32

# Cloudinary (Fotoğraf Yükleme için)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend (Email Bildirimleri için)
RESEND_API_KEY="re_your_key"
FROM_EMAIL="noreply@yourdomain.com"
```

-----

## 👥 Test Kullanıcıları (Seed Data)

Veritabanı seed işlemi (`npm run db:seed`) sonrası aşağıdaki hesaplarla giriş yapabilirsiniz:

| Rol | E-posta | Şifre | Yetki Özeti |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@montaj.com` | `admin123` | Tam yetki, sistem yönetimi, tüm raporlar |
| **Manager** | `manager@montaj.com` | `manager123` | Ekip yönetimi, iş atama, onay verme |
| **Team Lead** | `teamlead@montaj.com` | `teamlead123` | Ekip içi yönetim, iş takibi |
| **Worker** | `worker1@montaj.com` | `worker123` | İş görüntüleme, checklist, fotoğraf yükleme |
| **Customer** | `customer@sirket.com` | `customer123` | Sadece kendi işlerini görüntüleme |

-----

## 📁 Proje Yapısı

```
assembly_tracker/
├── app/                      # Next.js App Router (Sayfalar ve API)
│   ├── (auth)/               # Login/Register işlemleri
│   ├── admin/                # Admin paneli sayfaları
│   ├── manager/              # Manager paneli sayfaları
│   ├── worker/               # Worker paneli sayfaları
│   └── api/                  # Backend API uçları
├── components/               # React Bileşenleri
│   ├── ui/                   # Temel UI elemanları (Button, Input vb.)
│   ├── forms/                # Form yapıları
│   └── charts/               # Grafik bileşenleri
├── lib/                      # Yardımcı fonksiyonlar (Auth, DB, Utils)
├── mobile/                   # React Native Mobil Projesi
├── prisma/                   # Veritabanı şeması ve seed dosyaları
└── memory-bank/              # Proje dokümantasyonu ve mimari notlar
```

-----

## 🎯 Roller ve Yetkiler

1.  **🔴 Admin:** Sistemdeki tüm verilere (Kullanıcılar, Ekipler, Müşteriler) tam erişim. Maliyet onaylama ve PDF rapor indirme yetkisi.
2.  **🟠 Manager:** Operasyonel yönetim. İş oluşturma, ekiplere iş atama ve maliyetleri inceleme/onaylama.
3.  **🟡 Team Lead:** Kendi ekibinin performansını ve işlerini takip etme.
4.  **🟢 Worker:** Sahadaki personel. İşleri görüntüler, adımları tamamlar, fotoğraf yükler ve masraf girişi yapar.
5.  **🔵 Customer:** Sadece kendisiyle ilgili işlerin durumunu (Bekliyor, Tamamlandı vb.) görüntüler.

-----

## 📚 Dokümantasyon

Projenin detaylı teknik dokümantasyonu `memory-bank/` klasöründe yer almaktadır:

  * `projectbrief.md`: Proje özeti ve hedefler.
  * `techContext.md`: Teknik altyapı detayları.
  * `systemPatterns.md`: Mimari desenler ve veritabanı yapısı.
  * `activeContext.md`: Aktif geliştirme notları.

-----

## 📄 Lisans

Bu proje özel kullanım içindir. Ticari kullanım ve dağıtım hakları saklıdır. Detaylar için proje sahibi ile iletişime geçin.

**Son Güncelleme:** 02 Aralık 2024
**Versiyon:** 2.5.0 (Mobile Stable & Real-time Features)

## 🚀 Son Güncellemeler (v2.5.0)

### 📱 Mobil Uygulama (React Native / Expo)
*   **Tam Kararlılık:** Worker, Manager ve Admin modülleri test edildi ve kararlı sürüme geçti.
*   **Yenilenen Dashboard:** Worker dashboard'u modern, neon-yeşil tema ile yeniden tasarlandı.
*   **İş Akışı İyileştirmeleri:**
    *   **İş Başlatma/Bitirme:** "İşi Başlat" ve "İşi Tamamla" butonları ile hassas zaman takibi.
    *   **Zaman Damgaları:** İş, adım ve alt adımlar için başlangıç ve bitiş zamanlarının (StartedAt, CompletedAt) gösterimi.
    *   **Hata Düzeltmeleri:** İş tamamlama (PUT/POST fix), login sorunları ve veri senkronizasyonu giderildi.
*   **Masraf Yönetimi:**
    *   Gerçek veri entegrasyonu tamamlandı.
    *   Tarih seçimi ve gruplama özelliği eklendi.
    *   Yeni kategoriler (Yol vb.) eklendi.

### 🔔 Bildirim ve Gerçek Zamanlı İletişim
*   **Socket.IO Entegrasyonu:** Mobil uygulama için tam Socket.IO desteği.
*   **Anlık Bildirimler:** İş atama, tamamlama ve fotoğraf yükleme olaylarında anlık bildirimler.
*   **Görsel Geri Bildirim:** İşlem başarılarında modern, animasyonlu "Success Modal" kullanımı.

### 🔧 Backend & API
*   **Auth Fixes:** Mobil API endpoint'leri için `verifyAuth` (Bearer Token) standardizasyonu tamamlandı.
*   **Data Integrity:** İş tamamlama ve onay süreçlerindeki veri tutarsızlıkları giderildi.
*   **Admin Tools:** Veritabanı kontrolü ve kullanıcı yönetimi için iyileştirmeler.

### ⚠️ Önemli Notlar
*   **E-posta Bildirimleri:** Yerel geliştirme ortamında timeout sorununu önlemek için geçici olarak devre dışı bırakıldı.
*   **Fotoğraf Yükleme:** Cloudinary yerine yerel dosya sistemi kullanılıyor.

