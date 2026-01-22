# Plan: UI/UX & Performance Refactor

## Phase 1: Web Accessibility & Styling
- [x] Task: Popover Focus Fix
  - [x] Subtask: `apps/web/components/ui/popover.tsx` dosyasındaki `outline-none` yerine erişilebilir focus sınıflarını ekle.
- [x] Task: Sidebar Z-Index Standardization
  - [x] Subtask: `apps/web/components/admin/sidebar.tsx` dosyasındaki keyfi z-index değerlerini Tailwind standartlarına (z-50) çek.

## Phase 2: Web Performance (Images)
- [x] Task: Image Component Migration
  - [x] Subtask: `apps/web/components/worker/cost-dialog.tsx` içindeki `<img>` etiketini `next/image` ile değiştir.
- [x] Task: Image Component Migration (Gallery)
  - [x] Subtask: `apps/web/components/photo-gallery.tsx` içindeki `<img>` etiketini `next/image` ile değiştir.

## Phase 3: Mobile Modernization
- [x] Task: Button Component Refactor
  - [x] Subtask: `apps/mobile/src/components/CustomButton.js` dosyasını `TouchableOpacity` yerine `Pressable` kullanacak şekilde güncelle.

## Phase 4: Code Quality & Safety
- [x] Task: Web Linting Onarımı
- [x] Task: Type Safety İyileştirmeleri
- [x] Task: Mobil Linting Kurulumu

## Phase 5: Web Responsiveness & Profile Navigation
- [x] Task: Sidebar Mobile Visibility Fix
  - [x] Subtask: Hamburger menü ve overlay mantığının Admin, Manager ve Customer için eklenmesi.
- [x] Task: Profile Pages Implementation
  - [x] Subtask: Tüm roller için `/profile` sayfalarının ve API'lerinin oluşturulması.

## Phase 6: Project-wide Theme Consistency (Anti-Dark Spots)
- [x] Task: Bottom Nav Theme Fix
  - [x] Subtask: `DashboardBottomNav.js` açık temada beyaz/kart rengi yapıldı.
- [x] Task: Job Detail Status & Modal Fix
  - [x] Subtask: `JobDetailScreen.js` içindeki durum çubuğu ve red modalları temaya duyarlı hale getirildi.
- [x] Task: Comprehensive Hardcoded Color Audit (Global)
  - [x] Subtask: Mobil: `TeamCard`, `MemberCard`, `DashboardAction`, `CustomDrawer`, `SelectionModal`, `ExpenseList`, `CustomButton` ve `UserList` bileşenlerindeki sabit `COLORS.cardDark/black` tanımları temizlendi.
  - [x] Subtask: Web: `DialogContent`, `PhotoGallery`, `JobTimeline` ve tüm Sidebar overlay'lerindeki sabit `bg-black/50` gibi Tailwind sınıfları temaya duyarlı (`bg-background/80`, `backdrop-blur`) hale getirildi.

## Phase 7: Enhanced Mobile Navigation
- [/] Task: Bottom Nav Modernization
  - [x] Subtask: "Hızlı Ekle" (+) butonunun eklenmesi ve tasarımın yenilenmesi.
  - [ ] Subtask: Aktif sekme animasyonları ve Lucide ikon geçişi.

## Phase 8: Verification
- [ ] Task: Final Manual Review
  - [ ] Subtask: Tüm cihazlarda ve temalarda (Açık/Koyu) navigasyonu test et.