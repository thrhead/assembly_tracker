# Plan: UI/UX Accessibility & Touch Standardization

## Phase 1: Web Accessibility & Typography
- [ ] Task: Update Mobile Font Size
  - [ ] Subtask: `apps/web/app/globals.css` dosyasında 640px altı için font-size'ı 14px'den 16px'e yükselt.
- [ ] Task: Enable User Scalability
  - [ ] Subtask: `apps/web/app/[locale]/layout.tsx` dosyasında `userScalable: false` ayarını kaldır veya `true` yap.

## Phase 2: Mobile Touch Targets & Feedback
- [ ] Task: Standardize Icon Button Sizes
  - [ ] Subtask: `apps/mobile/src/screens/worker/WorkerDashboardScreen.js` ve diğer ekranlardaki 40x40px ikon butonlarını 44x44px boyutuna çıkar.
- [ ] Task: Improve Interaction Feedback
  - [ ] Subtask: Mobil bileşenlerdeki `activeOpacity` değerini daha belirgin bir geri bildirim için 0.9'dan 0.7'ye çek.

## Phase 3: Brand Consistency & Interactivity
- [ ] Task: Align Theme Primary Colors
  - [ ] Subtask: `apps/mobile/src/constants/theme.js` dosyasında Light (Mavi) ve Dark (Yeşil) mod arasındaki ana renk farkını marka bütünlüğü için uyumlu hale getir.
- [ ] Task: Add Cursor Pointer Cues
  - [ ] Subtask: `apps/web/app/[locale]/admin/page.tsx` ve diğer dashboard sayfalarındaki tıklanabilir kartlara `cursor-pointer` sınıfını ekle.

## Phase 4: Verification
- [ ] Task: Accessibility Audit Pass
- [ ] Task: Cross-device Touch Testing
