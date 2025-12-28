# Specification: Raporlama Detayları Modülünün Tamamlanması

## 1. Overview
Bu modül, Admin ve Manager rollerindeki kullanıcıların montaj operasyonları, maliyetler ve ekip performansları hakkında derinlemesine içgörü elde etmelerini sağlamak amacıyla geliştirilecektir. Mevcut temel raporlamanın ötesine geçerek, özelleştirilebilir tarih aralıkları, kategori bazlı kırılımlar ve görselleştirilmiş veriler sunacaktır.

## 2. Goals
- **Görselleştirme:** Verilerin anlaşılmasını kolaylaştırmak için grafik ve şemalar (Pie, Bar, Line charts) kullanmak.
- **Esneklik:** Kullanıcıların raporları tarih, ekip, iş durumu gibi kriterlere göre filtreleyebilmesini sağlamak.
- **Erişilebilirlik:** Raporların sistem dışına (PDF, Excel) kolayca aktarılabilmesini sağlamak.
- **Performans Takibi:** Ekiplerin ve personelin iş tamamlama süreleri ve maliyet verimliliklerini ölçmek.

## 3. User Stories
- **Admin olarak**, tüm şirketin aylık toplam montaj maliyetini ve iş tamamlanma oranlarını tek bir dashboard'da görmek istiyorum.
- **Manager olarak**, sorumlu olduğum ekiplerin haftalık performansını karşılaştırmalı grafiklerle incelemek istiyorum.
- **Manager olarak**, belirli bir tarih aralığındaki "Onay Bekleyen" maliyet kalemlerini listeleyip Excel'e aktarmak istiyorum.
- **Admin olarak**, proje bazlı kârlılık analizi yapabilmek için iş başına düşen ortalama maliyeti görmek istiyorum.

## 4. Functional Requirements
### 4.1. Dashboard & Özet Ekranları
- **KPI Kartları:** Toplam İş, Tamamlanan İş, Toplam Maliyet, Bekleyen Onaylar gibi anahtar metriklerin gösterimi.
- **Trend Grafikleri:** Son 30/90 günlük iş tamamlama ve maliyet trendlerini gösteren çizgi grafikler (Recharts).

### 4.2. Detaylı Raporlar
- **Maliyet Raporu:** Kategori (Yol, Yemek, Malzeme), Personel ve Proje bazlı maliyet tabloları.
- **İş Durum Raporu:** İşlerin duruma (Bekliyor, Başladı, Tamamlandı) göre dağılımı (Pasta grafiği).
- **Ekip Performans Raporu:** Ekiplerin ortalama iş tamamlama süreleri ve iş yükü dağılımı.

### 4.3. Filtreleme ve Dışa Aktarma
- **Filtreler:** Tarih Aralığı (Date Range Picker), Ekip Seçimi, Durum Seçimi.
- **Export:** Tabloların Excel (.xlsx) ve özet ekranların PDF olarak indirilmesi.

## 5. Non-Functional Requirements
- **Performans:** Rapor sorguları optimize edilmeli, büyük veri setlerinde bile sayfa yüklenme süresi 2 saniyenin altında olmalı.
- **Test Kapsamı:** Tüm yeni bileşenler ve yardımcı fonksiyonlar için %95 test coverage sağlanmalı.
- **UI/UX:** ShadCN/UI bileşenleri kullanılarak mevcut tasarım diliyle (Minimalist & Kurumsal) uyumlu olmalı.

## 6. Data Model Changes
- Mevcut veritabanı şeması (Prisma) analiz edilecek, raporlama için gerekirse yeni indeksler veya view'lar eklenecek (ancak büyük şema değişiklikleri öngörülmemektedir).
