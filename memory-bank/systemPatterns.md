# Sistem Desenleri

## Mimari Genel Bakış

### Genel Mimari

```
┌─────────────────────────────────────────────────┐
│              Frontend (Next.js)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Admin   │  │ Manager  │  │   Team   │      │
│  │Dashboard │  │Dashboard │  │Dashboard │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│             API Layer (Next.js)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   Auth   │  │   Jobs   │  │  Reports │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
                      ▲
                      │
┌─────────────────────────────────────────────────┐
│           Mobile App (React Native)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Worker  │  │ Manager  │  │  Admin   │      │
│  │    UI    │  │    UI    │  │    UI    │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│         Database (PostgreSQL/Prisma)             │
└─────────────────────────────────────────────────┘
```

## Katman Yapısı

### 1. Presentation Layer (UI)

#### Web (Next.js)
- **Sorumluluk**: Web tabanlı yönetim arayüzü
- **Teknoloji**: React Components, TailwindCSS, shadcn/ui
- **Desenler**: Server/Client Components, Layouts

#### Mobile (React Native)
- **Sorumluluk**: Saha operasyonları ve mobil yönetim
- **Teknoloji**: Expo, React Native, React Navigation
- **Desenler**: Screen-based navigation, Native Components

### 2. Application Layer (Business Logic)

- **Sorumluluk**: İş mantığı ve veri akışı
- **Teknoloji**: Custom hooks, utilities, Service Layer
- **Desenler**:
  - Service pattern for API calls (Web & Mobile)
  - Context API for global state (Auth, Theme)
  - Form validation with Zod

### 3. API Layer

- **Sorumluluk**: Backend endpoints
- **Teknoloji**: Next.js API Routes
- **Desenler**:
  - RESTful API design
  - Middleware pattern (auth, logging)
  - Role-based access control

### 4. Data Layer

- **Sorumluluk**: Veritabanı işlemleri
- **Teknoloji**: Prisma ORM
- **Desenler**:
  - Repository pattern (Prisma ile)
  - Transaction management

## Temel Tasarım Desenleri

### 1. Authentication Flow

```
User Input → Form Validation → API Call → NextAuth
                                              ↓
                        JWT Token ← Session Creation
                              ↓
                    Store in Cookie (Web) / AsyncStorage (Mobile)
                              ↓
                    Protected Route Access
```

### 2. Job Management Flow

```
Manager Creates Job → API validates → Save to DB
                                          ↓
                              Assign to Team/User
                                          ↓
                              Send Notification
                                          ↓
                    Worker receives → Updates checklist
                                          ↓
                            Real-time status update
                                          ↓
                        Manager/Customer see update
```

### 3. Photo Upload Flow
```
Worker Selects Photo → Mobile App creates FormData
                              ↓
                    POST /api/.../photos (Multipart)
                              ↓
                    Save to Local FS (public/uploads)
                              ↓
                    Create DB Record (StepPhoto linked to SubStep)
                              ↓
                    Return URL to Mobile
```

### 3. Mobile Architecture Patterns

#### Navigation Structure
```
RootNavigator
├── AuthStack (Login)
└── AppStack (Drawer/Tabs)
    ├── WorkerNavigator
    ├── ManagerNavigator
    └── AdminNavigator
```

#### Service Layer Pattern (Mobile)
```javascript
// services/api.js
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

#### Offline Capability Strategy (Implemented v2.6)
- **Local Storage**: `AsyncStorage` for caching GET requests and persisting action queue.
- **Sync Queue**: `QueueService` stores mutation requests (POST/PUT/DELETE) when offline.
- **Sync Engine**: `SyncManager` monitors connection state (`NetInfo`) and processes the queue (FIFO) when online.
- **Retry Logic**: Failed sync items are retried up to 3 times before alerting the user.

#### Local File Upload Strategy (Implemented)
- **Storage**: Local filesystem (`public/uploads`) instead of Cloudinary (for local dev/on-prem).
- **Process**:
  1. Mobile sends `FormData` with file.
  2. API saves file to `public/uploads/jobs/[id]`.
  3. API saves metadata to DB (`StepPhoto` table).
  4. URL stored as relative path (`/uploads/...`).

## Component Yapısı

### Web Components
```
components/
├── ui/                    # Base UI components (shadcn)
├── forms/                 # Form components
├── layout/                # Layout components
└── features/              # Feature-specific components
```

### Mobile Components
```
mobile/src/
├── components/            # Shared UI components
│   ├── Card.js
│   ├── Button.js
│   └── Input.js
├── screens/               # Screen components
│   ├── worker/
│   ├── manager/
│   └── admin/
└── navigation/            # Navigation configuration
```

## Data Flow Patterns

### Server Components (Web)
- Veri çekme server-side
- SEO friendly
- Daha az JavaScript

### Client Components (Web & Mobile)
- Interaktif özellikler
- State management gerekli
- Event handlers

## API Design Patterns

### Endpoint Structure
```
/api/auth/[...nextauth]    # Authentication
/api/jobs                  # Job management
/api/users                 # User management
/api/admin/users           # Admin user management
/api/admin/customers       # Admin customer management
/api/worker/jobs           # Worker job list
```

## Security Patterns

### Input Validation
- Zod schema validation on both Client and Server

### Authorization
- Role-based middleware protection
- Token verification for API requests

## Error Handling Pattern

### API Error Handling
```typescript
try {
  // operation
} catch (error) {
  return NextResponse.json({ error: 'Message' }, { status: 500 })
}
```

### Client Error Handling
- Toast notifications for user feedback
- Error boundaries for component crashes
- Graceful degradation
