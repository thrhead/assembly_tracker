# Plan: Enterprise Integrations & Public API

Bu track, Assembly Tracker sisteminin dış sistemlerle entegrasyonuna ve basit finansal raporlama (faturalama) yeteneklerine odaklanır.

## Görev Alanları
- **Güvenlik & Auth:** API Anahtarı (API Key) yönetimi ve Webhook güvenliği.
- **Backend:** Kamu API endpointleri ve PDF servisleri.
- **Veritabanı:** API Anahtarları ve Entegrasyon kayıtları için şema güncellemeleri.

## Görevli Ajanlar (Orchestration Matrix)
1. `project-planner`: Süreç yönetimi ve koordinasyon.
2. `backend-specialist`: API Anahtarı yönetimi, Webhook API ve PDF oluşturma mantığı.
3. `database-architect`: `ApiKey` tablosu ve ilişkilerinin tasarımı.
4. `security-auditor`: API Key saklama yöntemi ve Webhook doğrulama süreçlerinin denetimi.
5. `test-engineer`: API uç noktaları için entegrasyon testleri.

## Uygulama Aşamaları

### Aşama 1: Altyapı ve Güvenlik (API Key Management)
- **Sorumlu:** `database-architect`, `backend-specialist`, `security-auditor`
- **Hedef:** `ApiKey` modelinin Prisma'ya eklenmesi. Admin panelinde API anahtarı üretme, silme ve listeleme arayüzünün (ve API'sinin) oluşturulması.

### Aşama 2: Kamu API ve Webhooklar
- **Sorumlu:** `backend-specialist`
- **Hedef:** `/api/v1/jobs` vb. kamuya açık (API key ile korunan) uç noktaların açılması. İş durum değişikliklerinde tetiklenecek Webhook yapısının kurulması.

### Aşama 3: Proforma Faturalama ve Raporlama
- **Sorumlu:** `backend-specialist`, `frontend-specialist`
- **Hedef:** Tamamlanan işler için proforma fatura / hizmet dökümü üreten PDF servisinin kodlanması.

### Aşama 4: Doğrulama ve Güvenlik Taraması
- **Sorumlu:** `security-auditor`, `test-engineer`
- **Hedef:** API key yetkilendirme testleri ve `security_scan.py` çalıştırılması.

## Dikkat Edilmesi Gerekenler
> [!IMPORTANT]
> API anahtarları veritabanında "plain-text" olarak değil, hashlenmiş olarak saklanmalıdır.

> [!WARNING]
> Webhook gönderimlerinde retry (yeniden deneme) mekanizması basit seviyede de olsa planlanmalıdır.
