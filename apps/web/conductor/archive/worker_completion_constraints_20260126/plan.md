# Plan: Worker İş Tamamlama Kısıtlamaları

## Genel Bakış
İşçilerin (Worker) operasyonel süreçlerini daha güvenli ve denetlenebilir hale getirmek için iki temel kısıtlama eklenmesi:
1. Tüm alt iş emirleri (sub-steps) tamamlanmadan işin (Job) bitirilmesinin engellenmesi.
2. Alt iş emirleri tamamlanırken en az 1 fotoğraf yüklenmiş olmasının zorunlu tutulması.

## Başarı Kriterleri
- [ ] İşçi, tamamlanmamış alt iş emri varken işi bitirmeye çalıştığında "bu montajı tamamlayarak kapatmak için tüm alt iş emirlerini tamamlamanız gerekiyor" uyarısını görmeli.
- [ ] İşçi, fotoğraf yüklemeden alt iş emrini kapatmaya çalıştığında "bu iş emrini kapatabilmeniz için öncelikle en az 1 adet fotoğraf yüklemeniz gerekmektedir" uyarısını görmeli.
- [ ] Bu kurallar hem Mobil hem de Web (eğer işçi web kullanıyorsa) platformlarında geçerli olmalı.
- [ ] Backend tarafında API düzeyinde bu kontroller yapılarak veri bütünlüğü korunmalı.

## Görev Listesi

### Phase 1: Mobil Uygulama (React Native)
- [x] Task: `apps/mobile/src/screens/worker/JobDetailScreen.js` dosyasında `handleSubstepToggle` fonksiyonuna fotoğraf kontrolü ekle.
- [x] Task: `apps/mobile/src/screens/worker/JobDetailScreen.js` dosyasında `handleCompleteJob` fonksiyonuna alt iş emri tamamlama kontrolü ekle.
- [x] Task: Uyarı mesajlarını istenen metinlerle güncelle (i18n desteği dahil).

### Phase 2: Web Uygulama (Next.js)
- [x] Task: İşçi iş detay sayfasını (`apps/web/app/[locale]/worker/jobs/[id]`) ve ilgili bileşenleri bul.
- [x] Task: Web arayüzünde alt iş emri tamamlama (checkbox) ve iş bitirme butonlarına ilgili validasyonları ekle.

### Phase 3: Backend & API Güvenliği
- [x] Task: `apps/web/app/api/worker/jobs/[id]/complete/route.ts` (veya ilgili route) içinde alt iş emri kontrolü yap.
- [x] Task: Alt iş emri durum güncelleme API'sinde fotoğraf varlığını veritabanı düzeyinde doğrula.

### Phase 4: Doğrulama
- [ ] Task: Mobil cihazda/simülatörde eksik adımla iş bitirmeyi dene ve hatayı doğrula.
- [ ] Task: Fotoğrafsız alt iş emri kapatmayı dene ve hatayı doğrula.
- [ ] Task: API'ye doğrudan (Postman vb.) istek atarak bypass edilip edilemediğini test et.
