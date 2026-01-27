# Plan: Lint & Kod Kalitesi İyileştirmesi

Bu plan, projedeki lint hatalarını temizlemeyi, Web ve Mobil platformları için tutarlı bir kod kalitesi altyapısı kurmayı hedefler.

## Aşama 1: Yapılandırma Onarımı (Web)
- [ ] `apps/web/eslint.config.mjs` dosyasının `.next`, `dist` ve `coverage` klasörlerini görmezden gelecek şekilde güncellenmesi (34.000+ hatanın çözümü).
- [ ] `any` kullanımı ve `require` importları gibi katı kuralların "warn" seviyesine çekilmesi (Kademeli geçiş için).

## Aşama 2: Mobil Altyapı Kurulumu (Mobile)
- [ ] `apps/mobile` için `expo` ve `typescript` bazlı ESLint yapılandırmasının kurulması.
- [ ] `package.json` içine `npm run lint` script'inin eklenmesi.
- [ ] Hibrit (APK/PWA) yapısına uygun olarak mobil ve web kurallarının hizalanması.

## Aşama 3: Seçici Otomatik Onarım (Selective Fix)
- [ ] `eslint --fix` ile sadece güvenli alanların (stil, basit importlar, kullanılmayan değişkenler) otomatik temizlenmesi.
- [ ] Kritik mantıksal hataların (Missing hook dependencies vb.) manuel olarak incelenmesi ve düzeltilmesi.

## Aşama 4: CI/CD Hazırlığı ve Doğrulama
- [ ] Proje kök dizininden tüm çalışma alanlarını tarayan bir `lint:all` komutunun oluşturulması.
- [ ] `security_scan.py` ile son bir kod güvenliği kontrolü yapılması.
