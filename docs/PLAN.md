# Orchestration Plan: Lint & Kod Kalitesi İyileştirmesi (Web & Mobil)

## Goal
Tüm proje genelindeki (Web ve Mobil) lint hatalarını ve uyarılarını temizleyerek kod kalitesini artırmak ve CI/CD süreçlerini sorunsuz hale getirmek.

## Context
- **Öncelik**: Orta/Yüksek
- **Kapsam**: `apps/web` (Next.js) ve `apps/mobile` (Expo/React Native)
- **Durum Analizi**:
    - **Web**: 436 sorun (Kullanılmayan değişkenler, import kuralları).
    - **Mobil**: 250 sorun (Eksik Jest globals, yapılandırma hataları).

## Phase 1: Planning & Assessment (Current)
- [x] Mevcut lint yapılandırmalarının incelenmesi.
- [x] Hata raporlarının oluşturulması ve kategorize edilmesi.
- [/] `docs/PLAN.md` oluşturulması ve kullanıcı onayı.

## Phase 2: Implementation (Requires Approval)
- **Frontend Specialist**:
    - `apps/web` dizinindeki kullanılmayan değişkenleri ve import hatalarını temizler.
    - `eslint.config.mjs` dosyasını modern Next.js 15 standartlarına göre optimize eder.
- **Mobile Developer**:
    - `apps/mobile` dizinindeki test yapılandırmasını (Jest globals) düzeltir.
    - `eslint.config.js` dosyasını Expo standartlarına göre günceller.
    - Mobil uygulamadaki kod stili hatalarını temizler.
- **Test Engineer**:
    - `lint_runner.py` üzerinden tüm projenin lint durumunu doğrular.
    - `npm run lint --workspaces` komutunun hatasız çalıştığını teyit eder.

## Verification Plan
1. **Lint Pas**: Tüm paketlerde `lint` komutu sıfır hata ile tamamlanmalı.
2. **Build Test**: Lint düzeltmeleri sonrası web ve mobil uygulamaların build alabildiği doğrulanmalı.
3. **Audit**: `checklist.py` ile son bir kalite denetimi yapılmalı.

---
*Created by project-planner via Orchestrator*
