# Specification: Lint & Kod Kalitesi İyileştirmesi

## Kapsam
Monorepo içindeki Web ve Mobil projelerin kod standartlarının iyileştirilmesi ve teknik borçların azaltılması.

## Hibrit Standartlar (Hybrid APK & PWA)
- **TypeScript:** Her iki platformda da ortak tip tanımları ve kuralları (Strict: false -> kademeli olarak true).
- **React Hooks:** `useEffect` ve `useCallback` bağımlılık takibi.
- **Dosya Yapısı:** `.next`, `dist`, `.expo` gibi build çıktıları kesinlikle taranmayacaktır.

## Teknik Kararlar
- **Auto-fix:** Sadece `stylistic` ve `import` kuralları için aktiftir.
- **Linter:** ESLint 9+ (Flat Config).
- **Formatlama:** Prettier entegrasyonu.

## Kalite Kapıları (Quality Gates)
- Hiçbir dosyada "Error" seviyesinde lint hatası kalmayacaktır (Warning kabul edilebilir).
- Build sırasında lint aşaması "Success" dönmelidir.
