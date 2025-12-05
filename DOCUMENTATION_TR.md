# Assembly Tracker - Proje Dokümantasyonu

Bu belge, Assembly Tracker projesinin kaynak kodunun analizi temel alınarak oluşturulmuş kapsamlı teknik dokümantasyondur.

## İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Teknoloji Yığını](#teknoloji-yığını)
3. [Proje Yapısı](#proje-yapısı)
4. [Veritabanı Şeması](#veritabanı-şeması)
5. [Arka Uç (Backend) ve API](#arka-uç-backend-ve-api)
6. [Web Uygulaması](#web-uygulaması)
7. [Mobil Uygulama](#mobil-uygulama)
8. [Geliştirme Rehberi](#geliştirme-rehberi)
9. [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)

---

## Genel Bakış

Assembly Tracker, saha montaj ve servis ekiplerini takip etmek, iş süreçlerini yönetmek ve maliyet kontrolü sağlamak amacıyla geliştirilmiş kapsamlı bir platformdur. Sistem, Next.js tabanlı bir web paneli ve React Native tabanlı bir mobil uygulamadan oluşmaktadır.

**Temel Özellikler:**
*   **Rol Tabanlı Erişim:** Admin, Yönetici (Manager), Takım Lideri (Team Lead), Çalışan (Worker) ve Müşteri (Customer) rolleri.
*   **İş Takibi:** Adım adım ilerleme takibi, fotoğraf yükleme ve onay mekanizmaları.
*   **Maliyet Yönetimi:** Gider girişi ve onay süreçleri.
*   **Mobil Uygulama:** Saha çalışanları için optimize edilmiş arayüz, konum takibi ve fotoğraf yükleme.

---

## Teknoloji Yığını

### Web Platformu
*   **Framework:** Next.js 16 (App Router)
*   **Dil:** TypeScript
*   **UI Kütüphanesi:** React 19, TailwindCSS v4, Shadcn UI
*   **Validasyon:** Zod (`lib/validations.ts`)
*   **Veritabanı ORM:** Prisma
*   **Kimlik Doğrulama:** NextAuth.js v5 (Beta)
*   **Gerçek Zamanlı İletişim:** Socket.IO

### Mobil Platform
*   **Framework:** React Native 0.81+
*   **Platform:** Expo SDK 54
*   **Navigasyon:** React Navigation (Stack)
*   **HTTP İstemcisi:** Axios
*   **Harita:** react-native-maps
*   **Bildirimler:** Socket.IO Client

---

## Proje Yapısı

Proje, monorepo benzeri bir yapıda organize edilmiştir:

```
assembly_tracker/
├── app/                  # Next.js App Router (Web Frontend & API)
│   ├── (auth)/           # Kimlik doğrulama sayfaları (login, register)
│   ├── (dashboard)/      # Yönetim paneli sayfaları (admin, manager, worker)
│   ├── api/              # Backend API uç noktaları
│   └── layout.tsx        # Kök yerleşim dosyası
├── components/           # Yeniden kullanılabilir React bileşenleri
│   ├── ui/               # Temel UI bileşenleri (Button, Input, vb.)
│   ├── forms/            # Form bileşenleri
│   └── [role]/           # Role özgü bileşenler (örn. worker/job-card.tsx)
├── lib/                  # Yardımcı fonksiyonlar ve kütüphane yapılandırmaları
│   ├── auth.ts           # NextAuth yapılandırması
│   ├── db.ts             # Prisma istemcisi (Singleton)
│   ├── socket.ts         # Socket.IO yapılandırması
│   └── validations.ts    # Zod şemaları
├── mobile/               # React Native mobil uygulaması
│   ├── src/
│   │   ├── screens/      # Mobil ekranlar
│   │   ├── components/   # Mobil bileşenler
│   │   ├── context/      # React Context (Auth, Socket)
│   │   └── services/     # API servis fonksiyonları
│   └── App.js            # Mobil giriş noktası ve navigasyon
├── prisma/               # Veritabanı şeması ve migrasyonlar
│   └── schema.prisma     # Veri modeli tanımları
├── server.ts             # Özel Next.js sunucusu (Socket.IO entegrasyonu için)
└── public/               # Statik dosyalar
```

---

## Veritabanı Şeması

Veri tabanı ilişkisel bir model üzerine kurulmuştur (PostgreSQL). Ana modeller `prisma/schema.prisma` dosyasında tanımlıdır:

### Temel Modeller
*   **User (Kullanıcı):** `role` alanı (ADMIN, MANAGER, WORKER, vb.) ile yetkilendirme yapılır.
*   **Customer (Müşteri):** Müşteri firmaları ve bilgilerini tutar.
*   **Team (Takım):** Çalışanların gruplandığı ekiplerdir.

### İş ve Süreç Modelleri
*   **Job (İş):** Ana iş kaydı. Durum (PENDING, IN_PROGRESS, vb.), öncelik, konum ve atama bilgilerini içerir.
*   **JobStep (İş Adımı):** Bir işin alt adımlarıdır. `isCompleted` ve `approvalStatus` alanları vardır.
*   **JobSubStep (Alt Adım):** Adımların daha detaylı parçalarıdır.
*   **StepPhoto:** İş adımlarına yüklenen fotoğrafları tutar. Cloudinary veya yerel URL tutulabilir.

### Yönetim Modelleri
*   **CostTracking (Maliyet Takibi):** İşle ilgili yapılan harcamalar. `receiptUrl` ile fiş görseli tutulur.
*   **Approval (Onay):** İş tamamlanma veya maliyet onayları için kullanılan kayıtlar.
*   **Notification (Bildirim):** Kullanıcı bildirimleri.

---

## Arka Uç (Backend) ve API

API, Next.js API Routes (`app/api`) üzerinden sunulur ve RESTful prensiplerini takip eder.

### Kimlik Doğrulama
`NextAuth.js` kullanılarak yönetilir. JWT stratejisi kullanılır.
*   `lib/auth.ts`: Auth konfigürasyonu.
*   `auth()` fonksiyonu ile sunucu tarafında oturum kontrolü yapılır.

### Önemli API Dizinleri
*   `/api/auth/*`: NextAuth işlemleri.
*   `/api/admin/*`: Yönetici işlemleri (Kullanıcı/Müşteri CRUD).
*   `/api/worker/*`: Çalışanlara özel işlemler (İş listesi, adım tamamlama).
*   `/api/mobile/*`: Mobil uygulama için özel formatlanmış veriler döndüren uç noktalar.
*   `/api/socket`: Web socket bağlantısı için handshake noktası.

### Veri Doğrulama
Gelen istekler `lib/validations.ts` içindeki Zod şemaları ile doğrulanır (örn. `jobSchema`, `loginSchema`).

---

## Web Uygulaması

Next.js App Router yapısı kullanılarak geliştirilmiştir.

### Sayfa Yapısı
*   `app/(auth)/login`: Giriş sayfası.
*   `app/(dashboard)/admin`: Admin paneli.
*   `app/(dashboard)/manager`: Yönetici paneli.
*   `app/(dashboard)/worker`: Çalışan paneli (Web üzerinden erişim gerekirse).

### Bileşen Mimarisi
*   **Server Components:** Veri çekme işlemleri (Prisma ile doğrudan DB erişimi) burada yapılır.
*   **Client Components:** İnteraktif öğeler (Formlar, Butonlar) `use client` direktifi ile işaretlenir.
*   **UI:** Shadcn UI bileşenleri `components/ui` altında bulunur ve TailwindCSS ile stillendirilir.

---

## Mobil Uygulama

React Native ve Expo kullanılarak geliştirilmiştir.

### Navigasyon (App.js)
`React Navigation` Stack Navigator kullanılır. Kullanıcı rolüne göre (`getInitialRoute`) başlangıç ekranı dinamik olarak belirlenir:
*   **Admin:** `AdminDashboardScreen`
*   **Manager:** `ManagerDashboardScreen`
*   **Worker:** `WorkerDashboardScreen`

### Servis Katmanı (`mobile/src/services`)
API çağrıları `axios` kullanılarak yapılır.
*   `auth.service.js`: Login işlemleri.
*   `job.service.js`: İş listesi ve detayları.
*   `api.js`: Axios instance ve interceptor'lar (Token ekleme).

### Durum Yönetimi
*   **AuthContext:** Kullanıcı oturum durumunu (user, token) yönetir.
*   **SocketContext:** Gerçek zamanlı bildirimler için Socket.IO bağlantısını yönetir.

---

## Geliştirme Rehberi

### Yeni Bir API Uç Noktası Ekleme
1.  `app/api/` altında ilgili klasörü oluşturun (örn. `app/api/products/route.ts`).
2.  `GET`, `POST` vb. metotları export edin.
3.  `auth()` ile oturum kontrolü yapın.
4.  `prisma` ile veritabanı işlemi yapın.
5.  `NextResponse.json()` ile yanıt dönün.

### Yeni Bir Mobil Ekran Ekleme
1.  `mobile/src/screens/` altında yeni ekran bileşenini oluşturun.
2.  `mobile/App.js` dosyasında `Stack.Screen` olarak ekleyin.
3.  İlgili dashboard ekranından bu yeni ekrana navigasyon verin (`navigation.navigate('EkranAdi')`).

---

## Kurulum ve Çalıştırma

### Gereksinimler
*   Node.js 18+
*   PostgreSQL Veritabanı
*   Expo Go (Mobil test için)

### Web Uygulamasını Başlatma
```bash
# Bağımlılıkları yükle
npm install

# Veritabanını hazırla
npx prisma generate
npx prisma db push (veya migrate dev)

# Sunucusu başlat (Custom Server)
npm run dev
# Sunucu http://localhost:3000 adresinde çalışacaktır.
```

### Mobil Uygulamayı Başlatma
```bash
cd mobile
npm install

# Expo'yu başlat
npx expo start
```
*Not: Mobil uygulamanın API'ye erişebilmesi için `mobile/src/services/api.js` içindeki BASE_URL'in bilgisayarınızın yerel IP adresi olduğundan emin olun.*

### Ortam Değişkenleri (.env)
Proje kök dizininde `.env` dosyası oluşturulmalı ve aşağıdaki değişkenler tanımlanmalıdır:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="gizli-bir-anahtar"
NEXTAUTH_URL="http://localhost:3000"
```
