# Aktif Bağlam

**Son Güncelleme:** 28 Kasım 2024  
**Versiyon:** 2.4.0 (Notifications & API Fixes)

### Mevcut Durum

- **Web Uygulaması:** Production-ready (v2.0). Tüm temel ve gelişmiş özellikler tamamlandı.
- **Mobil Uygulama:** Beta aşamasında (v2.5). Worker, Manager ve Admin rolleri için tüm temel özellikler entegre edildi.
- **Teknik Stack:** Next.js + PostgreSQL + Prisma + NextAuth.js + React Native (Expo)

### Son Değişiklikler (Kasım 2024)

1.  **Mobil Uygulama - Tam Entegrasyon (v2.5)**:
    - **Foundation (100%)**:
        - Expo + React Native projesi oluşturuldu (`/mobile`)
        - React Navigation ile rol bazlı yönlendirme (Worker, Manager, Admin)
        - AuthContext ile kimlik doğrulama altyapısı
        - Profile & Settings ekranı (şifre değiştirme, logout)
    
    - **Worker Features (100%)**:
        - `WorkerDashboardScreen`: İstatistikler ve hızlı erişim
        - `WorkerJobsScreen`: İş listesi (filter, search, pull-to-refresh)
        - `JobDetailScreen`: Detaylı iş görünümü
          - İnteraktif checklist (adımlar & alt adımlar)
          - Fotoğraf yükleme
          - Harita entegrasyonu
          - Arama/Telefon/Email entegrasyonu
    
    - **Manager Features (100%)**:
        - `ManagerDashboardScreen`: Ekip istatistikleri
        - `TeamListScreen`: Worker listesi ve performans metrikleri
        - `JobAssignmentScreen`: İş atama ve yeniden atama
          - Worker seçim modal
          - Durum ve öncelik filtreleri
    
    - **Admin Features (100%)**:
        - `AdminDashboardScreen`: Sistem istatistikleri
        - `UserManagementScreen`: Kullanıcı CRUD işlemleri
          - Rol bazlı filtreleme
          - Form validasyonu
        - `CustomerManagementScreen`: Müşteri yönetimi
          - Firma bilgileri
          - Aktif iş sayısı
    
    - **Backend Integration (100%)**:
        - ✅ Axios tabanlı API servisi
        - ✅ Request/Response interceptors
        - ✅ Token yönetimi
        - ✅ Tüm servis katmanları (`auth`, `job`, `user`, `customer`, `team`)
        - ✅ Mobil uyumlu API endpoint'leri (`/api/admin/users`, `/api/admin/customers`, `/api/worker/jobs` vb.)

2.  **Ekip Performans Grafikleri Tamamlandı (v2.0)**:
    - Ekip detay sayfası oluşturuldu (`/admin/teams/[id]`)
    - İş dağılımı, durum grafikleri ve üye performansı eklendi
    - Recharts ile görselleştirme

3.  **Maliyet Takibi Modülü Tamamlandı (v2.0)**:
    - Schema güncellendi (`receiptUrl`, `status`, `createdById`, `approvedById`, `rejectionReason`)
    - Worker API: Masraf girişi (`POST /api/worker/costs`)
    - Admin API: Listeleme ve onay (`GET/PATCH /api/admin/costs`)

4.  **Alt Görevler ve Zaman Takibi (v2.0)**:
    - İş şemasına `scheduledEndDate` eklendi
    - JobDialog güncellendi: Alt görev oluşturma desteği
    - Başlangıç-bitiş tarih/saat seçimi

5.  **Gelişmiş Fotoğraf Yönetimi (v2.3)**:
    - **Alt Görev Bazlı Fotoğraflar**: Her checklist maddesi için ayrı fotoğraf yükleme.
    - **Kısıtlamalar**: Min 1 (tamamlamak için), Max 3 (sınır) fotoğraf kuralı.
    - **Yerel Depolama**: Cloudinary yerine `public/uploads` klasörüne yerel kayıt desteği.
    - **Sıralı İlerleme**: Alt görevlerin sırayla tamamlanması zorunluluğu.

6.  **Bildirim Sistemi İyileştirmeleri (v2.4)**:
    - **Admin & Worker Badge**: Dashboard ve header'da okunmamış bildirim sayısı (kırmızı nokta) gösterimi.
    - **Akıllı Bildirim Yönetimi**: Bildirime tıklandığında otomatik "okundu" işaretleme ve listeden kaldırma.
    - **API Entegrasyonu**: Onay, Red ve Kabul işlemlerinde otomatik bildirim gönderimi (`notification-helper`).

7.  **Kritik API ve UI Düzeltmeleri (v2.4)**:
    - **Next.js 16 Uyumluluğu**: API route'larında `params` promise yapısına uygun hale getirildi (`await params`).
    - **Auth Entegrasyonu**: Tüm kritik endpoint'ler `verifyAuth` ile hem Web hem Mobil (Bearer) token destekler hale geldi.
    - **Admin Dashboard**: Layout merge conflict sorunu çözüldü, dashboard yapısı düzeltildi.
    - **UI/UX**: Türkçe karakter sorunları giderildi, onay/red butonları modernize edildi.

## Sonraki Adımlar

### Hemen Yapılacaklar

1.  **Mobil Uygulama - Test ve Polish**:
    - Fiziksel cihazlarda kapsamlı test
    - UI/UX iyileştirmeleri ve animasyonlar
    - Hata yönetimi ve kullanıcı geri bildirimleri
2.  **Mobil Uygulama - Ek Özellikler**:
    - Push Notifications (Expo)
    - Offline Mode (AsyncStorage caching)
3.  **Web - Bakım**:
    - Küçük hata düzeltmeleri
    - Performans optimizasyonları

### Kısa Vadeli (Bu Sprint)

1.  Mobil uygulama testlerini tamamla
2.  Push notification altyapısını kur
3.  Offline mod için POC yap

## Aktif Kararlar ve Düşünceler

### Mobil Geliştirme (React Native + Expo)

- **Karar**: Expo kullanımı.
- **Sebep**: Hızlı geliştirme, kolay test (Expo Go) ve OTA güncellemeleri.
- **Durum**: Tüm temel özellikler tamamlandı, test aşamasında.

### Teknoloji Seçimleri (Web)

**Next.js vs Ayrı Backend**
- Karar: Next.js (full-stack framework)
- Sebep: Tek projede hem frontend hem backend, hızlı development

**Database Seçimi**
- Karar: PostgreSQL + Prisma
- Sebep: Güçlü ilişkisel veri modeli, type-safety

**Authentication**
- Karar: NextAuth.js
- Sebep: Next.js ile entegrasyon, çok sayıda provider desteği

### UI/UX Tercihleri

**Mobil Arayüz**
- Kart tabanlı tasarım (Job Cards).
- Büyük dokunma alanları (Worker'lar için).
- Renk kodlu durum göstergeleri.
- Native hissi veren navigasyon.

## Önemli Desenler ve Tercihler

### Code Organization
- Feature-based folder structure
- Shared components ayrı klasör
- API routes domain bazlı gruplandırma

### Naming Conventions
- camelCase: Değişkenler ve fonksiyonlar
- PascalCase: Componentler ve tipler
- kebab-case: Dosya isimleri
- UPPER_CASE: Sabitler

## Öğrenimler ve Proje İçgörüleri

### Mobil Entegrasyon Zorlukları
- **CORS**: Web API'ye mobilden erişimde CORS sorunları yaşandı. Next.js config'de headers ayarı gerekebilir.
- **Network**: Localhost erişimi için Android emülatörde `10.0.2.2` veya fiziksel cihazda LAN IP kullanılması gerekiyor.
- **State Management**: Context API basit durumlar için yeterli, ancak offline mod için daha gelişmiş bir çözüm (TanStack Query vb.) gerekebilir.

### Kullanıcı İhtiyaçları
- Basitlik ve hız çok önemli (montaj ekipleri sahada)
- Mobil kullanım öncelikli
- Offline çalışma ileride kritik olabilir
- Bildirimler gerçek zamanlı olmalı
