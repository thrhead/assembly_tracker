# Plan: Admin Dashboard Modernizasyonu ve Hata Düzeltmeleri

## Phase 1: Bug Fixing (Completed)
- [x] `apps/web/app/api/admin/jobs/route.ts` 500 hatası analizi.
- [x] `isomorphic-dompurify` bağımlılığının API rotasından temizlenmesi.
- [x] Validasyonların `validations-edge.ts` dosyasına taşınması.
- [x] Prisma nesnelerinin manuel olarak JSON'a serileştirilmesi.
- [x] Mobil uygulama için `team.name` ve `worker.name` format uyumluluğunun sağlanması.

## Phase 2: Backend Reports (Completed)
- [x] `lib/data/reports.ts` içine `getWeeklyCompletedSteps` fonksiyonunun eklenmesi.
- [x] API uç noktasının haftalık kategorize edilmiş veriyi dönecek şekilde güncellenmesi.

## Phase 3: Web Frontend (Completed)
- [x] `WeeklyStepsChart.tsx` bileşeninin Recharts ile oluşturulması.
- [x] Admin rapor sayfasına entegrasyon.
- [x] Tıklanan güne ait iş detaylarını gösterme özelliği.

## Phase 4: Mobile Frontend (Completed)
- [x] `react-native-gifted-charts` kurulumu.
- [x] `ReportsScreen.js` dosyasının tamamen yenilenmesi.
- [x] Modern kart tasarımı ve interaktif grafiklerin eklenmesi.

## Phase 5: Build & Deploy Fixes (Completed)
- [x] Web tarafındaki TypeScript tip hatalarının giderilmesi.
- [x] `react-is` bağımlılığının eklenmesi.
- [x] Mobil taraftaki çift stil tanımı hatasının giderilmesi.
- [x] Vercel build işlemleri için `.npmrc` yapılandırması.
