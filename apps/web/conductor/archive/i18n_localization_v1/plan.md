# Plan: i18n & Localization Infrastructure

## Phase 1: Altyapı Kurulumu
- [ ] Task: `next-intl` kütüphanesinin kurulumu ve yapılandırılması.
- [ ] Task: Dil dosyaları (`messages/en.json`, `messages/tr.json`) yapısının oluşturulması.
- [ ] Task: `middleware.ts` güncellemesi ile dil yönlendirmesinin (locale detection) sağlanması.

## Phase 2: İçerik Çevirisi
- [ ] Task: Statik metinlerin (Butonlar, Başlıklar, Menüler) çeviri dosyalarına taşınması.
- [ ] Task: Dinamik içeriklerin (Tarih, Para Birimi) `Intl` API ile formatlanması.

## Phase 3: Kullanıcı Tercihi
- [ ] Task: Dil değiştirme butonu (Language Switcher) bileşeninin eklenmesi.
- [ ] Task: Kullanıcı dil tercihinin veritabanında/çerezde saklanması.
