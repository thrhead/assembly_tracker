# Technology Stack: Assembly Tracker

## 1. Core Frameworks & Languages
- **Language:** TypeScript (Strict Mode)
- **Web Framework:** Next.js 16 (App Router)
- **Mobile Framework:** React Native (Expo SDK 52+)
- **Runtime:** Node.js 18+

## 2. Frontend (Web)
- **UI Library:** React 19
- **Styling:** TailwindCSS v4, Radix UI Primitives, Lucide Icons
- **Components:** ShadCN/UI (Customized)
- **State Management:** Zustand, React Context
- **Forms:** React Hook Form, Zod Validation
- **Visualization:** Recharts (Charts), Leaflet (Maps)
- **Offline Storage:** Dexie.js (IndexedDB wrapper)
- **Security:** Crypto-js (Client-side Encryption)
- **Offline Sync:** Global API Interceptor (Fetch wrapper) & Dexie Sync Queue

## 3. Mobile (App)
- **Navigation:** React Navigation v7
- **Local Storage:** AsyncStorage (Offline Cache)
- **Networking:** Axios, Socket.IO Client, @react-native-community/netinfo
- **UI:** React Native SVG, Expo Linear Gradient
- **Security:** Crypto-js (E2E Encryption)

## 4. Backend & Database
- **API:** Next.js Server Actions & API Routes
- **Database:** PostgreSQL (Neon Serverless / Local)
- **ORM:** Prisma ORM
- **Authentication:** NextAuth.js v5 (Beta)
- **Real-time:** Socket.IO (Custom Server setup)

## 5. DevOps & Infrastructure
- **Media Storage:** Local Filesystem (`public/uploads`) - *Cloudinary installed but currently inactive*
- **Email Service:** Resend & React Email
- **PDF Generation:** jsPDF & jspdf-autotable
- **Package Manager:** npm
- **Testing:** Vitest, @testing-library/react
