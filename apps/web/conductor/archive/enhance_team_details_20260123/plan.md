# Plan: Ekip Detay ve Rapor Geliştirmeleri

Bu plan, ekiplerin performansını, harcamalarını ve iş geçmişini detaylı bir şekilde raporlayan bir yapı kurmayı hedefler.

## Aşama 1: Veri Katmanı Geliştirmeleri
- [x] `lib/data/teams.ts` dosyasına `getTeamDetailedReports` fonksiyonunun eklenmesi.
    - [x] Toplam çalışma saati hesaplaması (`JobStep`'lerin `startedAt` ve `completedAt` farkları).
    - [x] Toplam masraf hesaplaması (`CostTracking` tablosundan onaylı kayıtlar).
    - [x] Atanan işlerin (aktif ve geçmiş) listesi.
    - [x] Ortalama montaj süresi ve zamanında tamamlama oranı.
- [x] Masraf kategorilerine göre dağılım verisinin çekilmesi.

## Aşama 2: Yeni UI Bileşenleri
- [x] `TeamLeadBadge`: Takım liderini diğer üyelerden ayıran görsel etiket.
- [x] `TeamJobsList`: Ekibe atanan işlerin durumlarıyla listelendiği tablo/liste.
- [x] `TeamFinancialSummary`: Toplam masraf ve kategori bazlı dağılım grafiği.
- [x] `TeamPerformanceCharts`: Aylık tamamlanma ve çalışma saati trend grafikleri.

## Aşama 3: Sayfa Yenileme (`app/[locale]/admin/teams/[id]/page.tsx`)
- [x] Sekmeli (Tabs) yapıya geçiş:
    - [x] **Genel Bakış:** Özet istatistikler ve performans karnesi.
    - [x] **İş Geçmişi:** Atanan tüm işlerin kronolojik listesi.
    - [x] **Ekip Üyeleri:** Lider vurgulu üye kartları.
    - [x] **Finansal Raporlar:** Harcama detayları ve verimlilik raporları.

## Aşama 4: Ekstra Analitik Bilgiler
- [x] Ekip Verimlilik Skoru hesaplama algoritması.
- [x] En çok çalışılan lokasyonlar (Metrik bazlı).
- [x] Üye bazlı adım tamamlama istatistikleri.
