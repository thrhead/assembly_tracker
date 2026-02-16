# Plan: Admin İş Düzenleme Yetkisi

## Phase 1: Web Backend & Shared Logic (Completed)
- [x] `lib/actions/jobs.ts` içindeki `updateJobAction` fonksiyonuna yeni alanlar eklendi.
- [x] `updateJobSchema` validasyonu güncellendi.

## Phase 2: Web Frontend (Completed)
- [x] `JobDialog.tsx` bileşenine yeni alanlar (Durum, Kabul Durumu, Gerçekleşen Tarihler) eklendi.
- [x] `Select` bileşenlerinin düzenleme modunda varsayılan değerleri göstermesi sağlandı.

## Phase 3: Mobile Logic (Completed)
- [x] `useJobForm.js` hook'u hem oluşturma hem de düzenleme modunu destekleyecek şekilde güncellendi.
- [x] `job.service.js` içindeki `update` metodu doğrulandı.

## Phase 4: Mobile Frontend (Completed)
- [x] `EditJobScreen.js` ekranı oluşturuldu.
- [x] `JobDetailScreen.js` ekranına ADMIN/MANAGER için "Düzenle" butonu eklendi.
- [x] `App.js` navigasyonuna `EditJob` ekranı kaydedildi.

## Phase 5: Synchronization & Deployment (Completed)
- [x] Değişiklikler `assembly_tracker`, `assembly_web` ve `assembly_tr` depolarına push edildi.
