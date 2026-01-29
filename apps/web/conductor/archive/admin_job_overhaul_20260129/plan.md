# Plan: Admin İş Yönetimi ve Numaralandırma

## 1. Hata Düzeltmeleri
- [x] **Alan Temizleme:** Boş bırakılan alanların (açıklama, konum) veritabanında güncellenmemesi sorunu düzeltildi.
- [x] **Tarih İşleme:** `scheduledDate` gibi alanlarda boş dize hataları (Invalid Date) giderildi.
- [x] **TypeError:** `JobDialog` içinde adımlar filtrelenirken oluşan `trim()` hatası çözüldü.
- [x] **Veri Kaybı Önleme:** Güncelleme sırasında kontrol listesi ID'leri korunarak mevcut ilerlemenin (tamamlanma durumu) sıfırlanması engellendi.

## 2. UI/UX İyileştirmeleri
- [x] **Detay İçi Düzenleme:** `JobEditView` statik metinden düzenlenebilir tarih/saat seçicilere dönüştürüldü.
- [x] **Sync:** `assembly_web` deposundaki en son refactor edilmiş kodlar ana depoya çekildi.

## 3. Numaralandırma Sistemi
- [x] **Proje Numaraları:** `JOB-YYYY-XXXX` (Örn: JOB-2026-0001) formatında benzersiz numaralandırma altyapısı kuruldu.
- [x] **Hiyerarşik Kodlama:** İş emirleri (`JOB-XXX-01`) ve alt iş emirleri (`JOB-XXX-01-01`) için dinamik kod türetme eklendi.
- [x] **Görselleştirme:** İş listesi ve detay sayfalarında proje numaraları gösterildi.
