# Plan: UI/UX & Performance Refactor

## Phase 1: Web Accessibility & Styling
- [ ] Task: Popover Focus Fix
  - [ ] Subtask: `apps/web/components/ui/popover.tsx` dosyasındaki `outline-none` yerine erişilebilir focus sınıflarını ekle.
- [ ] Task: Sidebar Z-Index Standardization
  - [ ] Subtask: `apps/web/components/admin/sidebar.tsx` dosyasındaki keyfi z-index değerlerini Tailwind standartlarına (z-50) çek.

## Phase 2: Web Performance (Images)
- [ ] Task: Image Component Migration
  - [ ] Subtask: `apps/web/components/worker/cost-dialog.tsx` içindeki `<img>` etiketini `next/image` ile değiştir.
  - [ ] Subtask: `apps/web/components/photo-gallery.tsx` içindeki `<img>` etiketini `next/image` ile değiştir.

## Phase 3: Mobile Modernization
- [ ] Task: Button Component Refactor
  - [ ] Subtask: `apps/mobile/src/components/CustomButton.js` dosyasını `TouchableOpacity` yerine `Pressable` kullanacak şekilde güncelle.
  - [ ] Subtask: Butonun mevcut prop'larını koruyarak geriye dönük uyumluluğu sağla.

## Phase 4: Code Quality & Safety
- [ ] Task: Web Linting Onarımı
  - [ ] Subtask: `eslint-config-next` bağımlılığını kur ve `npm run lint` komutunun hatasız çalıştığını doğrula.
- [ ] Task: Type Safety İyileştirmeleri
  - [ ] Subtask: Web projesindeki kritik `any` kullanımlarını (özellikle API yanıtları ve Context'ler) azalt.
- [ ] Task: Mobil Linting Kurulumu
  - [ ] Subtask: Mobil projeye temel `eslint` ve `prettier` yapılandırmasını ekle.

## Phase 5: Verification
- [ ] Task: Manual Review
  - [ ] Subtask: Web tarafında klavye ile navigasyonu test et.
  - [ ] Subtask: Mobil tarafında butonların çalışırlığını test et.

## Phase 6: Web Responsiveness & Profile Navigation
- [ ] Task: Sidebar Mobile Visibility Fix
  - [ ] Subtask: `AdminHeader` ve `ManagerHeader` bileşenlerine mobil menü tetikleyici (hamburger button) ekle.
  - [ ] Subtask: `CustomerSidebar` bileşenini mobil uyumlu hale getir (Drawer/Overlay mantığı ekle).
  - [ ] Subtask: `AdminSidebar` mobil butonunun Header altında kalma sorununu z-index ile çöz.
- [ ] Task: Profile Pages Implementation
  - [ ] Subtask: Admin, Manager ve Customer için temel profil sayfalarını (`/profile`) oluştur.
  - [ ] Subtask: Tüm Header bileşenlerindeki "Profil" linklerini aktif hale getir ve doğru rotalara yönlendir.
