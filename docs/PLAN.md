# Plan: Web & Mobil Özellik Eşitleme (Feature Parity) - Admin & Manager

Bu plan, `assembly_tracker` projesindeki Admin ve Manager rollerinin web uygulamasında sahip olduğu tüm yeteneklerin, mobil-optimize bir arayüzle mobil uygulamaya kazandırılmasını kapsamaktadır.

## 1. Mevcut Durum Analizi ve Eksiklikler (Gap Analysis)

### Admin Rolü
| Modül | Web Yeteneği | Mobil Durum | Eksiklik / Geliştirme |
| :--- | :--- | :--- | :--- |
| **Dashboard** | Haftalık Performans Grafiği, Takım Durumu, Bütçe Takibi | Özet İstatistikler, Son İşler | Haftalık grafikler ve detaylı bütçe/maliyet widget'ları eklenecek. |
| **İş Yönetimi** | Gelişmiş Filtreleme, Toplu İşlemler, Gantt Görünümü | Liste ve Detay | Gelişmiş filtreleme ve mobil uyumlu takvim/planlama derinleştirilecek. |
| **Kullanıcı/Müşteri** | Tam CRUD, Role-based yetkilendirme | Temel CRUD | Detaylı düzenleme ve karmaşık ilişkilerin yönetimi. |
| **Maliyetler** | Onay Akışı, Bugünün bütçe kullanımı, Kategorizasyon | Temel Listeleme | Admin için web'deki gibi bütçe analiz görünümleri. |
| **Raporlar** | Dinamik grafikler, Excel/PDF dışa aktarma | Temel Liste | Web'deki grafiklerin (Recharts) mobil karşılıkları (Victory/SVG). |
| **Entegrasyonlar** | Webhook yönetimi, API anahtarları | Yok | Admin için webhook izleme ve basit kontrol paneli. |
| **Şablonlar** | PDF/Excel rapor şablonu yönetimi | Yok | Mevcut şablonların önizlenmesi ve seçilmesi. |

### Manager Rolü
| Modül | Web Yeteneği | Mobil Durum | Eksiklik / Geliştirme |
| :--- | :--- | :--- | :--- |
| **Dashboard** | Yönetilen ekip metrikleri, atanmış işler | Özet İstatistikler | Ekip verimliliği grafikleri. |
| **Onaylar** | Alt adımların ve maliyetlerin onayı | Onay Ekranı | Eksik kalan onay detayları (fotoğraflı/imzalı kontrol listesi doğrulaması). |
| **Raporlar** | Ekip bazlı performans raporları | Yok/Kısıtlı | Manager için saha performans tabloları. |

## 2. Uygulama Adımları (Phases)

### Phase 1: Ortak Altyapı ve API Hazırlığı (Backend Specialist)
- [x] Mobil için eksik olan raporlama endpoint'lerinin (Haftalık trend, bütçe analizi vb.) optimize edilmesi.
- [x] Admin/Manager rolleri için özel `meta-data` (istatistik) endpoint'lerinin güncellenmesi.

### Phase 2: Core Admin Modülleri Sync (Mobile Developer)
- [x] **Dashboard Revizyonu:** Web'deki performans grafiklerinin mobil-uyumlu (Victory Native veya benzeri) versiyonlarının eklenmesi.
- [x] **Gelişmiş Filtreleme Component'i:** Tüm yönetim ekranlarına web'deki zengin filtreleme yeteneklerinin eklenmesi.
- [x] **Maliyet Kontrol Paneli:** Admin için bütçe ilerleme barı ve günlük limit takibi.

### Phase 3: Manager ve Saha Onay Modülleri (Mobile Developer)
- [x] Manager Dashboard'una ekip verimlilik skorlarının eklenmesi.
- [x] Onay süreçlerinde web'deki tüm detayların (belgeler, detaylı notlar) görünür hale getirilmesi.

### Phase 4: Gelişmiş Özellikler (Admin Extras)
- [x] **Entegrasyon Paneli:** Basit webhook izleme ekranı.
- [x] **Şablon Seçimi:** İş raporu oluştururken şablon seçebilme özelliği.

## 3. Teknik Detaylar ve Kullanılacak Araçlar
 - **Grafikler:** `react-native-gifted-charts`.
- **UI:** Mevcut `GlassCard` ve `LinearGradient` yapısı korunarak mobil-optimize dashboard widget'ları.
- **State Management:** Veri tutarlılığı için `Context API` + `Hooks`.

## 4. Doğrulama ve Test Planı
- [ ] Admin rolüyle tüm web aksiyonlarının mobilde simülasyonu.
- [ ] Manager rolüyle ekip onay süreçlerinin doğrulanması.
- [ ] `lighthouse_audit.py` ve `mobile_audit.py` ile performans kontrolü.