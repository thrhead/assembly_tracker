# Plan: Admin İş Yönetimi, Numaralandırma ve Lider Atama

## 1. Hata Düzeltmeleri
- [x] **Alan Temizleme:** Boş bırakılan alanların (açıklama, konum) veritabanında güncellenmemesi sorunu düzeltildi.
- [x] **Tarih İşleme:** `scheduledDate` gibi alanlarda boş dize hataları (Invalid Date) giderildi.
- [x] **TypeError:** `JobDialog` içinde adımlar filtrelenirken oluşan `trim()` hatası çözüldü.
- [x] **Veri Kaybı Önleme (Checklist):** İş güncelleme sırasında kontrol listesi (checklist), alt adımlar ve fotoğrafların silinmesi sorunu, `id` takibi ve `deleteMany` işlemlerinin kısıtlanmasıyla çözüldü.

## 2. UI/UX İyileştirmeleri
- [x] **Detay İçi Düzenleme:** `JobEditView` statik metinden düzenlenebilir tarih/saat seçicilere dönüştürüldü.
- [x] **Ekip Gösterimi:** İş detaylarında "Ekip Lideri" ve "Çalışanlar" bölümleri ayrıştırılarak daha net bir hiyerarşi sağlandı.

## 3. Numaralandırma Sistemi
- [x] **Proje Numaraları:** `JOB-YYYY-XXXX` (Örn: JOB-2026-0001) formatında benzersiz numaralandırma altyapısı kuruldu.
- [x] **Hiyerarşik Kodlama:** İş emirleri (`JOB-XXX-01`) ve alt iş emirleri (`JOB-XXX-01-01`) için dinamik kod türetme eklendi.

## 4. Lider Atama Özelliği
- [x] **İş Özelinde Lider:** Her iş için (ekipten bağımsız veya ekip içinden) özel bir "İş Lideri / Sorumlusu" seçebilme özelliği eklendi.
- [x] **Mobil Entegrasyon:** Mobil uygulamada iş sorumlusu en üstte, diğer üyeler aşağıda olacak şekilde detay ekranı güncellendi.
