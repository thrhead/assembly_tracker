# Specification: Admin İş Silme Fonksiyonu

## Problem
Adminler hatalı oluşturulan veya iptal edilen işleri sistemden tamamen silemiyorlar. Bu durum veri kirliliğine neden oluyor.

## Hedefler
- Adminlerin hem web hem mobil uygulama üzerinden iş silebilmesini sağlamak.
- Silme işlemi öncesinde kullanıcıdan onay almak.
- İş silindiğinde bağlı verilerin (adımlar, masraflar, atamalar) tutarlı bir şekilde yönetilmesi.

## Teknik Gereksinimler
1. **API:** `DELETE /api/admin/jobs/[id]` endpoint'inin oluşturulması.
2. **Güvenlik:** Sadece `ADMIN` rolüne sahip kullanıcıların bu işlemi yapabilmesi.
3. **Web UI:** 
   - İş listesi tablosuna silme aksiyonu eklenmesi.
   - İş detay sayfasına "İşi Sil" butonu eklenmesi.
4. **Mobil UI:** 
   - `job.service.js` dosyasına `deleteJob` fonksiyonu eklenmesi.
   - İş detay ekranında adminler için silme opsiyonu sunulması.
5. **Veritabanı:** `Message` modelindeki `jobId` ilişkisinin silme işlemini engellememesi için `onDelete: Cascade` veya `SetNull` kontrolü.
