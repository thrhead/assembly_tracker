# Specification: Admin İş Düzenleme Yetkisi

## Hedef
Admin ve Manager rollerinin, oluşturulmuş işlerin tüm detaylarını (atama, zamanlama, durum) hem web hem de mobil platformlar üzerinden güncelleyebilmesini sağlamak.

## Kapsam
1. **Web (Admin):** `JobDialog` bileşeninin güncellenerek tüm alanları (durum, kabul durumu, tarihler) desteklemesi.
2. **Mobil (Admin/Manager):** Yeni bir `EditJobScreen` oluşturulması ve iş detay sayfasından erişilebilir hale getirilmesi.
3. **Backend:** `updateJobAction` sunucu eyleminin yeni alanları (startedAt, completedDate, status, acceptanceStatus) destekleyecek şekilde genişletilmesi.

## Teknik Detaylar
- **Prisma:** Mevcut `Job` ve `JobAssignment` modelleri kullanıldı.
- **Web:** `react-hook-form` ve `zod` şemaları güncellendi.
- **Mobil:** `useJobForm` hook'u genişletildi, `EditJobScreen` navigasyona eklendi.
- **API:** `/api/admin/jobs/[id]` PUT/PATCH uç noktaları üzerinden tam yetki sağlandı.
