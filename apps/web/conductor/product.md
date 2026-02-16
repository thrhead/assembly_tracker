# Product Guide: Assembly Tracker

## 1. Vision & Goals
**Assembly Tracker**, fabrika dışında çalışan montaj ve servis ekiplerinin süreçlerini dijitalleştiren, operasyonel verimliliği artıran ve müşteri memnuniyetini şeffaflıkla sağlayan kapsamlı bir yönetim platformudur.

### Core Goals
- **Operasyonel Verimlilik:** Kağıt tabanlı süreçleri ortadan kaldırarak iş atama, takip ve raporlama sürelerini minimize etmek.
- **Maliyet ve İstatistik Kontrolü:** Yöneticilerin her bir montaj işi için detaylı masraf (malzeme, işçilik, ulaşım) ve performans istatistiklerini anlık olarak takip edebilmesini sağlamak.
- **Müşteri Şeffaflığı:** Müşterilere iş durumları hakkında gerçek zamanlı bilgi sunarak güven ve memnuniyeti artırmak.
- **Entegrasyon:** İlerleyen aşamalarda ERP ve muhasebe yazılımları ile tam entegrasyon sağlayarak finansal süreçleri otomatize etmek.

## 2. Target Audience & Users
Sistem, hiyerarşik bir kullanıcı yapısına sahiptir:

- **Admin:** Sistem genelinde tam yetkiye sahip, konfigürasyon ve üst düzey raporlama yapan kullanıcı.
- **Manager (Yönetici):** Operasyonel süreçleri yöneten, iş atayan, maliyetleri onaylayan ve ekip performansını denetleyen kişi.
- **Team Lead (Takım Lideri):** Sahadaki ekibini koordine eden ve işin kalitesinden sorumlu olan lider.
- **Worker (Çalışan):** Mobil uygulama üzerinden iş listelerini görüntüleyen, checklist dolduran, fotoğraf yükleyen ve masraf girişi yapan saha personeli.
- **Customer (Müşteri):** Kendisine ait montaj işlerinin durumunu (Başladı, Tamamlandı vb.) izleyen paydaş.

## 3. Key Features & Capabilities
### İş ve Süreç Yönetimi
- Detaylı checklist ve alt görev (sub-steps) yönetimi.
- Hassas zaman takibi (Başlangıç/Bitiş süreleri).
- Otomatik iş kapatma ve bloklama mekanizmaları.

### Finansal Yönetim
- Çoklu kategoride (Yol, Yemek, Malzeme vb.) masraf girişi.
- Yönetici onaylı masraf akışı.
- Montaj bazlı detaylı maliyet analizi.

### Mobil Saha Operasyonları
- **Cross-Platform:** iOS ve Android uyumlu (React Native) ve Tam Özellikli Web PWA.
- **Çevrimdışı Mod (Offline Mode):** Web ve Mobil tarafında tam eşitlik sağlandı. İnternet yokken tüm kritik işlemler (İş kapatma, masraf, mesajlaşma) kuyruğa alınır ve bağlantı geldiğinde otomatik olarak arka planda senkronize edilir.
- **Güvenli Mesajlaşma:** Saha ekipleri ve yöneticiler arasında uçtan uca şifreli (E2E Encrypted), gerçek zamanlı ve çevrimdışı destekli sohbet modülü.
- **Medya Entegrasyonu:** İş adımlarına fotoğraf kanıtı ekleme.
- **Lokasyon:** Navigasyon ve konum doğrulama.

### Bildirim ve Raporlama
- Socket.IO ile gerçek zamanlı bildirimler.
- Tamamlanan işler için PDF raporları ve E-posta bildirimleri.

## 4. Project Status
- **Durum:** Aktif Geliştirme (Brownfield).
- **İlerleme:** Projenin büyük bir bölümü tamamlanmış durumda. Temel akışlar (Web ve Mobil) çalışır vaziyette.
- **Odak:** Eksik modüllerin tamamlanması, mevcut kod tabanının (tamamlanan kısımlar için) refactor edilmesi ve ERP entegrasyonlarının hazırlanması.
