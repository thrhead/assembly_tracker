# Specification: Admin Dashboard Modernizasyonu ve Hata Düzeltmeleri

## Problem
1. **API Hatası:** Admin hesabıyla işler listelenirken `/api/admin/jobs` uç noktası 500 hatası veriyordu. Bu durum mobil uygulamada verilerin boş görünmesine neden oluyordu.
2. **Eski Görselleştirme:** Haftalık tamamlanan adımlar grafiği çok temel ve yetersizdi. Kategorize edilmiş veri ve benchmark desteği yoktu.

## Hedefler
- Jobs API'sini dayanıklı (robust) hale getirmek.
- Vercel üzerindeki kütüphane çakışmalarını (isomorphic-dompurify) çözmek.
- Web tarafında `Recharts` ile modern bir Stacked Bar Chart oluşturmak.
- Mobil tarafında `react-native-gifted-charts` ile gelişmiş bir görselleştirme sunmak.
- Her iki platformda "Drill-down" (detaya inme) özelliği eklemek.

## Teknik Kararlar
- **Backend:** Prisma sorguları sadeleştirildi, manuel JSON serileştirme eklendi.
- **Web:** Recharts Stacked Bar + Line (BM) kombinasyonu kullanıldı.
- **Mobil:** Gifted Charts ile animasyonlu Stacked Bar kullanıldı.
- **Hata Yönetimi:** API seviyesinde `absolute error boundary` eklenerek 500 hataları engellendi.
