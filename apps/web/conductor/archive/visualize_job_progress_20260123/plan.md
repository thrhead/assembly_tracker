# Plan: İş İlerlemesi Görselleştirme (Detaylı)

Bu plan, montaj işlerinin tamamlanma yüzdesini modern ve dinamik görsellerle hem web hem mobil platformlarda göstermeyi hedefler.

## Aşama 1: Web Geliştirmeleri (`apps/web`)
- [x] **TDD - Test Hazırlığı:** `components/__tests__/job-progress.test.tsx` oluşturularak hesaplama mantığının testi (0 adım, tam tamamlama, kısmi tamamlama).
- [x] `JobDetailsView.tsx` bileşeninde ilerleme hesaplama mantığının kurulması.
    - Mantık: `const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0`
- [x] Shadcn UI `Progress` bileşeninin entegrasyonu.
- [x] **Tasarım:** İş başlığının hemen altına, durumu yansıtan dinamik renkli (Sarı -> Mavi -> Yeşil) bir yatay bar eklenmesi.
- [x] Yüzde miktarının ve "X/Y Adım Tamamlandı" bilgisinin estetik bir fontla barın üzerine/yanına eklenmesi.

## Aşama 2: Mobil Geliştirmeleri (`apps/mobile`)
- [x] **TDD - Test Hazırlığı:** `src/__tests__/JobProgress.test.js` ile progress hesaplama ve prop geçişlerinin test edilmesi.
- [x] `JobInfoCard.js` veya `JobDetailScreen.js` üzerinde ilerleme hesaplamasının yapılması.
- [x] **Tasarım:** Sağ üst köşeye veya ana kartın merkezine yakın, modern bir dairesel (Circular) Progress göstergesi eklenmesi.
    - Not: `react-native-svg` veya `react-native-circular-progress-indicator` kullanılabilir.
- [x] React Native `Animated` kütüphanesi ile ilerleme değişimlerine yumuşak geçiş efektleri verilmesi.
- [x] Karanlık ve Aydınlık modlara uyumlu renk paletinin belirlenmesi.

## Aşama 3: Ortak İyileştirmeler ve Doğrulama
- [x] Hiç adım tanımlanmamış işler için "Hazırlanıyor" durumu gösterilmesi.
- [x] İş tamamlandığında (%100) görsel bir "Başarı" (Success) vurgusu eklenmesi.
- [x] `security_scan.py` ve `lint_runner.py` betikleri ile kalite kontrolü.

## Görev Dağılımı
- **frontend-specialist:** Web UI ve bileşen entegrasyonu.
- **mobile-developer:** Mobil dairesel gösterge ve animasyonlar.
- **test-engineer:** TDD akışı ve test kapsamı doğrulaması.