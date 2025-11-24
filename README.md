# Montaj ve Servis Ekipleri Takip Uygulaması

Fabrika dışında çalışan montaj ve servis ekiplerinin takip edilmesi, maliyet kontrolü ve yönetim süreçlerinin kolaylaştırılması için Next.js tabanlı modern web uygulaması.

## 🚀 Özellikler

### Core Features
- ✅ **User Authentication** - NextAuth.js v4 ile güvenli giriş sistemi
- ✅ **Rol Tabanlı Yetkilendirme** - Admin, Manager, Team Lead, Worker, Customer
- ✅ **Modern Dashboard** - Green theme (#16A34A), dark mode desteği
- ✅ **Responsive Design** - Mobile-first, tüm cihazlara uyumlu
- ✅ **Türkçe Interface** - Tam Türkçe lokalizasyon

### Job Management
- ✅ **İş Takip Sistemi** - Montaj süreçlerini adım adım takip
- ✅ **Alt Görevler** - Checklist adımlarının altında detaylı alt görevler
- ✅ **Zaman Takibi** - Alt görevler için başlama/bitiş zamanı seçimi
- ✅ **Otomatik Tamamlama** - Tüm alt görevler bitince ana görev otomatik tamamlanır
- ✅ **Görev Bloklama** - Sorunlu adımları işaretleme ve açıklama ekleme
- ✅ **İş Planlama** - Başlangıç ve bitiş tarih/saat belirleme

### Team & Reporting
- ✅ **Ekip Yönetimi** - Ekipleri yönetin, görevleri atayın
- ✅ **Ekip Performans Grafikleri** - Detaylı ekip istatistikleri ve görselleştirmeler
- ✅ **Raporlama** - İş durumları, aşama ilerlemesi, maliyet raporları
- ✅ **Dashboard KPIs** - Tamamlanan/Bekleyen görevler, toplam maliyetler

### Additional Features
- ✅ **Bildirim Sistemi** - Gerçek zamanlı bildirimler
- ✅ **Onay Mekanizması** - İş onay akışları
- ✅ **Maliyet Takibi** - Masraf girişi, onay ve raporlama (₺ formatı)
- ✅ **Fotoğraf Yükleme** - Cloudinary entegrasyonu (in progress)
- ✅ **Modern UX** - Toast notifications (Sonner), loading skeletons, error boundaries

## 📦 Teknoloji Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **UI**: TailwindCSS v3, Custom Components, Dark Mode
- **Database**: PostgreSQL (Neon Serverless) with Prisma ORM
- **Authentication**: NextAuth.js v4
- **Validation**: Zod
- **Forms**: React Hook Form + @hookform/resolvers
- **Charts**: Recharts
- **Maps**: Leaflet, React-Leaflet
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)
- **State Management**: React Hooks, Server Components
- **Real-time**: Socket.IO (partial integration)
- **File Upload**: Cloudinary (in progress)

## 🛠️ Kurulum

### Gereksinimler

- Node.js 18+
- PostgreSQL (local veya hosted - Neon, Supabase, Railway)
- npm veya pnpm

### Adımlar

1. **Dependencies'i kurun:**

```bash
npm install
```

2. **Environment variables'ı ayarlayın:**

```bash
cp .env.example .env
```

`.env` dosyasında aşağıdaki değerleri güncelleyin:

```env
# Database (Neon PostgreSQL önerilir)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth v4
NEXTAUTH_SECRET="your-secret-key-here"  # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (Optional, fotoğraf yüklemesi için)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

3. **Veritabanını oluşturun ve migrate edin:**

```bash
npx prisma generate
npx prisma db push
```

4. **Seed data ekleyin (test kullanıcıları):**

```bash
npx prisma db seed
```

5. **Development server'ı başlatın:**

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 👥 Test Kullanıcıları

Seed script çalıştırıldıktan sonra aşağıdaki kullanıcılarla giriş yapabilirsiniz:

| Rol       | E-posta              | Şifre       | Açıklama          |
| --------- | -------------------- | ----------- | ----------------- |
| Admin     | admin@example.com    | admin123    | Sistem yöneticisi |
| Manager   | manager@example.com  | manager123  | Yönetici          |
| Worker    | ali@example.com      | worker123   | Montaj elemanı    |
| Worker    | mehmet@example.com   | worker123   | Montaj elemanı    |
| Customer  | musteri@example.com  | customer123 | Müşteri           |

## 📁 Proje Yapısı

```
assembly_tracker/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication sayfaları (Login)
│   ├── admin/             # Admin paneli
│   │   ├── jobs/         # İş yönetimi
│   │   ├── users/        # Kullanıcı yönetimi
│   │   ├── customers/    # Müşteri yönetimi
│   │   └── reports/      # Raporlar (YENİ)
│   ├── manager/           # Manager paneli
│   ├── worker/            # Worker paneli
│   ├── customer/          # Customer paneli
│   └── api/               # API routes
│       ├── auth/         # NextAuth endpoints
│       ├── admin/        # Admin APIs
│       ├── worker/       # Worker APIs
│       └── ...
├── components/            # React komponentleri
│   ├── ui/               # Base UI components (Radix UI)
│   ├── forms/            # Form components
│   ├── worker/           # Worker-specific components
│   │   ├── substep-time-dialog.tsx  # Zaman seçici (YENİ)
│   │   └── ...
│   └── admin/            # Admin components
├── lib/                   # Utility fonksiyonlar
│   ├── db.ts             # Prisma client
│   ├── auth.ts           # NextAuth v4 config
│   ├── utils.ts          # Utilities
│   └── validations.ts    # Zod schemas
├── prisma/                # Database
│   ├── schema.prisma     # DB schema
│   └── seed.ts           # Seed data
├── types/                 # TypeScript types
├── memory-bank/           # Proje dokümantasyonu
└── public/                # Static assets
```

## 🗄️ Database Schema

### Ana Tablolar

- **users** - Kullanıcı bilgileri ve authentication
- **customers** - Müşteri profilleri
- **teams** - Ekip bilgileri
- **team_members** - Ekip üyelikleri
- **jobs** - Montaj işleri
- **job_steps** - İş adımları (checklist)
- **job_sub_steps** - Alt görevler (substeps) - **startedAt**, **completedAt** alanları ile
- **job_assignments** - İş atamaları
- **notifications** - Bildirimler
- **approvals** - Onay talepleri
- **cost_tracking** - Maliyet takibi (₺ formatı)
- **step_photos** - Adım fotoğrafları (Cloudinary)

## 🎯 Roller ve Yetkiler

### Admin

- Tüm sistem yönetimi
- Kullanıcı ekleme/silme/düzenleme
- Tüm verilere erişim
- Raporlama ve istatistikler
- Maliyet onaylama

### Manager

- Ekip yönetimi
- İş oluşturma ve atama
- Raporlama
- Onay verme
- Maliyet görüntüleme

### Team Lead

- Kendi ekibini yönetme
- İş takibi
- Günlük raporlama
- Ekip performansı

### Worker

- Kendi işlerini görüntüleme
- Checklist güncelleme (alt görev zamanları ile)
- İlerleme bildirimi
- Maliyet girişi
- Fotoğraf yükleme

### Customer

- Kendi işlerini takip etme
- Durum görüntüleme
- Bildirimler

## 📜 Available Scripts

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed database with test data
npx prisma studio    # Prisma Studio GUI
```

## 🔧 Geliştirme

### Yeni Model Ekleme

1. `prisma/schema.prisma`'yı güncelleyin
2. `npx prisma generate` ve `npx prisma db push` çalıştırın
3. TypeScript tiplerini güncelleyin

### Yeni API Route

1. `app/api/` altında route oluşturun
2. Zod validation ekleyin (`lib/validations.ts`)
3. `getServerSession(authOptions)` ile auth kontrol edin

### Yeni Page

1. `app/[role]/` altında page.tsx oluşturun
2. Server component olarak authentication ekleyin
3. Responsive tasarım ve dark mode desteği ekleyin

## 📝 Son Güncellemeler (v1.0)

### Tamamlanan
- ✅ Login page modernizasyonu (teal theme, password toggle)
- ✅ Dashboard yenileme (green theme, dark mode, KPI cards)
- ✅ NextAuth v4 migration (50+ dosya)
- ✅ Raporlar sayfası eklendi
- ✅ Alt görev zaman takibi (datetime picker)
- ✅ Otomatik parent step completion
- ✅ Responsive improvements (max-w-7xl)
- ✅ Türk Lirası (₺) formatı
- ✅ Eksik paketlerin yüklenmesi

### Devam Eden
- [ ] Real-time notifications (Socket.IO tam entegrasyonu)
- [ ] Fotoğraf yüklemesi test ve iyileştirme
- [ ] PDF rapor oluşturma
- [ ] Email notifications
- [ ] Advanced filtering

## 📚 Dokümantasyon

Detaylı proje dokümantasyonu `memory-bank/` klasöründe bulunabilir:

- **projectbrief.md** - Proje özeti ve hedefler
- **productContext.md** - Ürün bağlamı ve kullanıcı deneyimi
- **techContext.md** - Teknik stack ve setup
- **systemPatterns.md** - Sistem mimarisi ve patterns
- **activeContext.md** - Aktif geliştirme notları ve son değişiklikler
- **progress.md** - İlerleme durumu ve metrikler

## 🎨 Design System

### Renk Paleti
- **Primary**: #16A34A (Green-600)
- **Teal Accent**: #008080 (Login page)
- **Background Light**: #F8FAFC (Slate-50)
- **Background Dark**: #0D1117 (Custom Dark Gray)

### Components
- Radix UI primitives
- Custom Tailwind components
- Dark mode variants
- Responsive breakpoints

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje özel kullanım içindir. Lisans bilgileri için proje sahibi ile iletişime geçin.

## 📞 Destek

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.


---

##FIKIRLER
-montaj klavuz resimleri eklenebilir
-admin veya manager, yeni ve istediği checklist i kendisi sıfırdan yaratsın.
-başka survey ve maintanince app. lerine bakılacak.
-admin ve manager anasayfasında, pojelere ait ilerleme durumunu ve en çok çalışan ilk 10 çalışana ait çalışma saatini göstersin.
-worker lara ait arayüz cok basit olmalı.



https://www.pocketsurvey.org/reports/analytics-dashboard.htm

-Map View of Your Portfolio
Clear. See your entire portfolio on a clear, easy-to-read map. This visual approach makes it effortless to identify trends, high-activity areas, or locations requiring more attention.

Pinpoint. Whether you're managing a regional or national portfolio, the map helps you pinpoint issues and opportunities, so you can optimise your resources and plan smarter.

Bird's Eye View. It's an invaluable tool for making your data come to life and driving effective decision-making.

-pie chard
Pie Charts
Simple. Pie charts offer a simple way to understand the status of inspections, property conditions, building archetypes, and planned costs.

Insights. These clear visuals take complex data and turn it into easy-to-digest insights. Instead of sifting through rows of data, you can quickly identify areas needing attention or improvement.

Time Saver Save time and ensure you stay focused on what matters most, making data-driven decisions faster and easier.

-Short-Term Work Costs
Remedials. Our pivot chart focused on minor repairs gives you an instant overview of short-term remedial costs at a property level.

Identify. Perfect for identifying and addressing small tasks while keeping your overall strategy on track.

Balance. With this clear view of smaller projects, you can balance immediate needs with long-term goals, ensuring nothing falls through the cracks.

-Dive into Decent Homes Details
Detail. Drill down into each property to get a detailed view of the areas it meets the Decent Homes Standards.

Highlight. This functionality lets you see exactly which areas comply and which need attention, providing actionable insights at the property level.

Standards. By breaking down compliance into manageable steps, you can effectively plan improvements and maintain standards across your entire portfolio.

---------------

**Son Güncelleme:** 23 Kasım 2025
**Versiyon:** 0.0.4_beta
**Durum:** Production Ready (MVP)
