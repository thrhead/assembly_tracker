# Teknik Bağlam

## Teknoloji Yığını

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **UI Kütüphanesi**: React 18+
- **Stil**: TailwindCSS + shadcn/ui komponentleri
- **Grafik**: Recharts
- **Form Yönetimi**: React Hook Form + Zod validation
- **Durum Yönetimi**: Zustand (Web) / Context API (Mobile)
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **Veritabanı**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (JWT Strategy)
- **Real-time**: Socket.IO

### Mobile (v2.5 - Stable)
- **Framework**: React Native 0.74+
- **Platform**: Expo SDK 51
- **Navigation**: React Navigation 6 (Stack & Bottom Tabs)
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Maps**: react-native-maps
- **Network**: @react-native-community/netinfo
- **UI**: StyleSheet API + Custom Components
- **Features**:
  - **Worker**: Job List, Detail, Checklist, Photo Upload, Map, Expenses
  - **Manager**: Team List, Job Assignment, Dashboard
  - **Admin**: User CRUD, Customer CRUD, Dashboard
  - **Shared**: Auth, Profile, Settings, Notifications, Offline Sync

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **TypeScript**: Strict Mode enabled

## Proje Yapısı

```
assembly_tracker/
├── app/                      # Next.js App Router (Web & API)
│   ├── (auth)/              # Auth layouts
│   ├── (dashboard)/         # Dashboard layouts
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── admin/           # Admin endpoints
│   │   ├── worker/          # Worker endpoints
│   │   └── ...
│   └── layout.tsx           # Root layout
├── mobile/                  # React Native App (Expo)
│   ├── src/
│   │   ├── screens/        # Screen components
│   │   │   ├── worker/
│   │   │   ├── manager/
│   │   │   └── admin/
│   │   ├── components/     # Shared components
│   │   ├── context/        # React Context (Auth)
│   │   └── services/       # API services
│   │       ├── api.js
│   │       ├── auth.service.js
│   │       ├── job.service.js
│   │       ├── user.service.js
│   │       ├── customer.service.js
│   │       └── team.service.js
│   ├── App.js
│   └── app.json
├── components/              # Shared React components (Web)
├── lib/                     # Utility functions
├── prisma/                  # Database schema
└── public/                  # Static assets
```

## Veritabanı Şeması (Özet)

1. **User**: Kullanıcılar ve roller (Admin, Manager, Worker, Customer)
2. **Job**: İş kayıtları, durum, öncelik
3. **JobStep**: İş adımları ve kontrol listesi
4. **JobSubStep**: Alt adımlar, zaman takibi ve fotoğraflar
5. **Team**: Ekipler ve üyeler
6. **Customer**: Müşteri firmalar
7. **CostTracking**: Maliyet takibi ve onay süreci
8. **Notification**: Sistem bildirimleri
9. **StepPhoto**: İş adımlarına ve alt adımlara yüklenen fotoğraflar (subStepId ile)

## Development Setup

### Gereksinimler

- Node.js 18+
- PostgreSQL veritabanı
- Expo Go (Mobil test için)

### Kurulum

```bash
# Web & API
npm install
npx prisma generate
npm run dev

# Mobile
cd mobile
npm install
npx expo start
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

## Mobil Uyumluluk

### Web
- Responsive Design (Mobile-first Tailwind)
- Touch-friendly UI elements

### Native App
- iOS ve Android desteği (Expo)
- Native navigasyon deneyimi
- Cihaz özelliklerine erişim (Kamera, Galeri, Konum)

## Güvenlik

- **Auth**: JWT tabanlı kimlik doğrulama
- **API**: Role-based middleware koruması
- **Input**: Zod validasyonu (Client & Server)
- **DB**: SQL injection koruması (Prisma)
