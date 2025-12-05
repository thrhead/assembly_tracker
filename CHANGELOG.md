# 📋 Değişiklik Günlüğü (Changelog)

Bu dosya, projede yapılan önemli değişiklikleri, güncellemeleri ve düzeltmeleri tarih sırasına göre listeler.

## [v2.5.0] - 2024-12-02 (Mobile Stable & Real-time)

### 📱 Mobil Uygulama (React Native / Expo SDK 54)
- **Kararlılık:** Worker, Manager ve Admin modülleri tamamen test edildi ve kararlı sürüme geçti.
- **Dashboard Yenilemesi:** Worker dashboard için modern, neon-yeşil tema tasarımı uygulandı.
- **İş Akışı Geliştirmeleri:**
  - "İşi Başlat" ve "İşi Tamamla" butonları ile hassas zaman takibi (StartedAt, CompletedAt).
  - İş ve alt adımlar için zaman damgalarının arayüzde gösterimi.
- **Masraf Yönetimi:**
  - Gerçek veri entegrasyonu tamamlandı.
  - Tarih seçimi, kategorilendirme ve gruplama özellikleri eklendi.
- **Hata Düzeltmeleri:**
  - İş tamamlama servisindeki PUT/POST uyumsuzlukları giderildi.
  - Login ekranı render sorunları ve veri senkronizasyonu düzeltildi.

### 🔔 Bildirim ve Gerçek Zamanlı İletişim
- **Socket.IO:** Mobil uygulama için tam entegrasyon sağlandı.
- **Anlık Bildirimler:** İş atama, tamamlama ve onay süreçlerinde anlık uyarılar.
- **UX:** Başarılı işlemler için animasyonlu "Success Modal" bileşeni eklendi.

### 🔧 Backend & API
- **Güvenlik:** Mobil API uç noktaları için `verifyAuth` (Bearer Token) standardizasyonu.
- **Veri Bütünlüğü:** İş onayı ve tamamlama süreçlerindeki tutarsızlıklar giderildi.
- **Altyapı:** Next.js 16 ve React 19 ile uyumluluk güncellemeleri yapıldı.

---

## [v2.4.0] - 2024-11 (Bildirimler ve UI İyileştirmeleri)

- **Bildirim Rozetleri:** Admin ve Worker panellerinde okunmamış bildirim sayısı gösterimi.
- **Akıllı Yönetim:** Bildirimlere tıklandığında otomatik "okundu" işaretleme.
- **API Düzeltmeleri:** Next.js 16 `params` (Promise) yapısına geçiş.
- **UI:** Türkçe karakter sorunları ve Dashboard layout hataları giderildi.

---

## [v2.3.0] - 2024-11 (Fotoğraf ve Medya Yönetimi)

- **Alt Görev Fotoğrafları:** Checklist maddeleri için spesifik fotoğraf yükleme.
- **Kısıtlamalar:** Min/Max fotoğraf sayısı kuralları.
- **Yerel Depolama:** Cloudinary bağımlılığı opsiyonel hale getirildi, yerel dosya sistemi (Local FS) desteği eklendi.

---

## [v2.0.0] - 2024-10 (Web Production Ready)

- **Web Uygulaması:** Tüm temel modüller (Admin, Manager, Worker, Customer) tamamlandı.
- **Maliyet Takibi:** Masraf giriş, onay ve raporlama modülü.
- **Performans Grafikleri:** Ekip ve personel bazlı verimlilik grafikleri (Recharts).
- **Alt Görevler:** İşlerin daha küçük parçalara bölünerek takibi.

---

## [v1.0.0] - 2024-09 (Initial Release)

- Temel proje yapısı (Next.js, Prisma, PostgreSQL).
- Kimlik doğrulama (NextAuth.js).
- Temel CRUD işlemleri.
