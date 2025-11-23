# Teknik Bağlam

## Teknoloji Yığını

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **UI Kütüphanesi**: React 18+
- **Stil**: TailwindCSS + shadcn/ui komponentleri
- **Grafik**: Recharts veya Chart.js
- **Form Yönetimi**: React Hook Form + Zod validation
- **Durum Yönetimi**: Zustand veya React Context
- **HTTP Client**: Axios veya Fetch API

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes (başlangıç)
- **Alternatif**: Express.js (ileride gerekirse)

### Veritabanı

- **Ana Veritabanı**: PostgreSQL (Neon Serverless)
- **ORM**: Prisma
- **Özellikler**: Serverless, Branching, Auto-scaling
- **Alternatif**: Supabase (hızlı başlangıç için)

### Authentication

- **Kütüphane**: NextAuth.js veya Supabase Auth
- **Strateji**: JWT token based
- **Roller**: Admin, Manager, Team Lead, Worker, Customer

### Deployment

- **Platform**: Vercel (Next.js için optimize)
- **Alternatif**: DigitalOcean, Railway, Netlify
- **Database Hosting**: Supabase, Neon, Railway

### DevOps

- **Version Control**: Git
- **Package Manager**: npm veya pnpm
- **Linting**: ESLint + Prettier
- **TypeScript**: Tip güvenliği için

## Proje Yapısı

```
assembly_tracker/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth layouts
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Dashboard layouts
│   │   ├── admin/           # Admin panel
│   │   ├── manager/         # Manager panel
│   │   ├── team/            # Team panel
│   │   └── customer/        # Customer panel
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── notifications/
│   │   └── reports/
│   └── layout.tsx           # Root layout
├── components/              # React komponentleri
│   ├── ui/                  # shadcn/ui komponentleri
│   ├── forms/               # Form komponentleri
│   ├── charts/              # Grafik komponentleri
│   └── layout/              # Layout komponentleri
├── lib/                     # Utility fonksiyonlar
│   ├── db.ts                # Database client
│   ├── auth.ts              # Auth utilities
│   └── validations.ts       # Zod schemas
├── prisma/                  # Prisma schema
│   └── schema.prisma
├── public/                  # Statik dosyalar
├── styles/                  # Global stiller
└── types/                   # TypeScript tipleri
```

## Veritabanı Şeması (Taslak)

### Tablolar

1. **users**

   - id, email, password_hash, name, role, created_at, updated_at

2. **jobs** (montaj işleri)

   - id, title, description, customer_id, status, assigned_team_id, created_by, created_at, updated_at

3. **job_steps** (montaj aşamaları)

   - id, job_id, step_order, title, description, is_completed, completed_at, notes

4. **teams**

   - id, name, team_lead_id, created_at

5. **team_members**

   - id, team_id, user_id, joined_at

6. **notifications**

   - id, user_id, title, message, is_read, created_at

7. **approvals**

   - id, job_id, requested_by, approver_id, status, notes, created_at, approved_at

8. **customers**

   - id, name, email, phone, company, created_at

9. **cost_tracking**
   - id, job_id, team_id, hours_worked, cost, date

## Development Setup

### Gereksinimler

- Node.js 18+
- npm veya pnpm
- PostgreSQL veya Supabase hesabı

### Kurulum Adımları

```bash
# Proje klonlama veya oluşturma
npx create-next-app@latest assembly_tracker --typescript --tailwind --app

# Bağımlılıklar
npm install prisma @prisma/client
npm install next-auth
npm install react-hook-form zod @hookform/resolvers
npm install recharts
npm install zustand
npm install lucide-react # ikonlar için

# shadcn/ui kurulumu
npx shadcn-ui@latest init

# Prisma kurulumu
npx prisma init
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

## Mobil Uyumluluk

### Responsive Design

- Mobile-first approach
- Tailwind breakpoints kullanımı
- Touch-friendly UI elementleri
- Minimum dokunma alanı: 44x44px

### PWA (İleride)

- Service worker
- Offline capability
- App-like experience
- Push notifications

## Güvenlik

### Best Practices

- Password hashing (bcrypt)
- JWT token güvenliği
- CSRF protection
- XSS prevention
- SQL injection prevention (Prisma ORM)
- Rate limiting
- Input validation (Zod)

## Performans

### Optimizasyon

- Server Components kullanımı
- Image optimization (Next.js Image)
- Code splitting
- Lazy loading
- Caching stratejileri
- Database indexing

## Testing (İleride)

### Test Araçları

- Unit tests: Jest + React Testing Library
- E2E tests: Playwright veya Cypress
- API tests: Supertest

## İleride Eklenebilecekler

- React Native mobil uygulama
- Real-time updates (WebSocket veya Supabase Realtime)
- File upload (fotoğraf ekleme)
- Advanced reporting
- Export to PDF/Excel
- Email notifications
- SMS notifications
- Multi-language support
