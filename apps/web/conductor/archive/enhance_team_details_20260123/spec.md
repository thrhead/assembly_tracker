# Specification: Ekip Detay Geliştirmeleri

## Kapsam
Ekipler modülündeki takım detay sayfasının (Admin paneli), operasyonel ve finansal verilerle zenginleştirilmesi.

## Gereksinimler
1. **Atanan İşler:** Ekibin dahil olduğu tüm montajların (Job) durum bazlı listelenmesi.
2. **Takım Lideri Vurgusu:** Üye listesinde liderin açıkça belirtilmesi.
3. **Finansal Takip:** Ekibin montajlarda yaptığı toplam masrafın (onaylı) gösterilmesi.
4. **Zaman Analizi:** Ekibin sahada geçirdiği toplam sürenin (çalışma saati) raporlanması.
5. **İstatistikler:** Tamamlanan toplam montaj sayısı ve başarı oranları.

## Teknik Detaylar
- **Veri Kaynağı:** Prisma (Team, User, Job, JobAssignment, CostTracking, JobStep modelleri).
- **UI Framework:** Tailwind CSS, Shadcn UI (Tabs, Card, Charts).
- **Hesaplama Mantığı:**
    - `Çalışma Saati` = SUM(JobStep.completedAt - JobStep.startedAt)
    - `Toplam Masraf` = SUM(CostTracking.amount WHERE status = 'APPROVED')
