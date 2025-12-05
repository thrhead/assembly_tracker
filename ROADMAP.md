# 🗺️ Proje Yol Haritası (Roadmap)

Bu belge, projenin kısa, orta ve uzun vadeli gelişim hedeflerini içerir.

## 🚀 Kısa Vadeli Hedefler (Önümüzdeki Sprintler)

### Mobil Uygulama İyileştirmeleri
- [ ] **Push Notifications:** Expo Push API kullanarak cihaz bildirimlerinin (uygulama kapalıyken bile) gönderilmesi.
- [ ] **UI/UX Polish:** Mobil animasyonların (LayoutAnimation, Reanimated) zenginleştirilmesi.
- [ ] **Hata Yönetimi:** Sentry veya benzeri bir araçla mobil crash raporlamasının entegrasyonu.

### Web ve Backend
- [ ] **E-posta Servisi:** Geliştirme ortamında devre dışı bırakılan e-posta bildirimlerinin (Resend) tekrar aktif edilmesi ve kuyruk yapısına (Queue) alınması.
- [ ] **Performans:** Veritabanı sorgularının (Prisma) optimizasyonu ve indeksleme stratejilerinin gözden geçirilmesi.

---

## 🛠️ Orta Vadeli Hedefler (Q1 2025)

### Çevrimdışı Çalışma (Offline Mode)
- [ ] **Mobil Cache:** İnternet bağlantısı koptuğunda verilerin cihazda (AsyncStorage/SQLite) saklanması.
- [ ] **Sync Mekanizması:** Bağlantı geldiğinde yerel verilerin sunucu ile senkronize edilmesi (Conflict resolution).

### Gelişmiş Raporlama
- [ ] **PDF Export:** Mobilden doğrudan iş emri ve maliyet raporu PDF'i oluşturma.
- [ ] **Excel/CSV:** Admin paneli için toplu veri dışa aktarma özellikleri.

### Medya Yönetimi
- [ ] **Bulut Depolama:** Yerel dosya sistemi yerine AWS S3 veya Cloudinary'ye tam geçiş (Production için).
- [ ] **Video Desteği:** İş adımlarına kısa video ekleme özelliği.

---

## 🔮 Uzun Vadeli Hedefler (Q2 2025 ve Sonrası)

- **AI Destekli Analiz:** İş tamamlama sürelerini analiz ederek tahmini bitiş süresi öneren yapay zeka modülü.
- **Canlı Konum Takibi:** Worker'ların anlık konumlarının harita üzerinde canlı izlenmesi (Opsiyonel/İzne bağlı).
- **Çoklu Dil Desteği (i18n):** Uygulamanın farklı dillerde kullanılabilmesi için altyapı hazırlığı.
- **Entegrasyonlar:** Muhasebe programları (Logo, Mikro vb.) ile API entegrasyonları.
