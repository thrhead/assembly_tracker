# Plan: Admin İş Silme Fonksiyonu

## Phase 1: Backend & Database
- [x] Task: `schema.prisma` dosyasında `Message` modelinin `Job` ilişkisini güncelle (`onDelete: Cascade`).
- [x] Task: `apps/web/app/api/admin/jobs/[id]/route.ts` dosyasına `DELETE` metodu ekle.
- [x] Task: `deleteJobAction` oluştur (Server Action).

## Phase 2: Web Frontend
- [x] Task: `apps/web/app/[locale]/admin/jobs/page.tsx` listesine silme butonu ekle.
- [x] Task: `apps/web/app/[locale]/admin/jobs/[id]/page.tsx` detay sayfasına silme butonu ekle.
- [x] Task: Silme işlemi için `ConfirmationDialog` entegrasyonu yap.

## Phase 3: Mobile Implementation
- [x] Task: `apps/mobile/src/services/job.service.js` içine `delete` fonksiyonu ekle.
- [x] Task: `apps/mobile/src/screens/worker/JobDetailScreen.js` (veya admin ekranları) içine silme butonu ekle.
- [x] Task: Mobil tarafta onay modalı (`Alert.alert`) ekle.

## Phase 4: Verification
- [x] Task: Web üzerinden bir işi sil ve bağlı verilerin temizlendiğini doğrula.
- [x] Task: Mobil üzerinden bir işi sil ve API entegrasyonunu doğrula.
- [x] Task: Yetkisiz bir kullanıcının (Worker) silme işlemi yapamadığını test et.
