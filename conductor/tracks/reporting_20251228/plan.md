# Plan: Raporlama Detayları Modülünün Tamamlanması

## Phase 1: Altyapı ve Veri Hazırlığı
- [x] Task: Raporlama Servislerinin Oluşturulması a6fde8d
  - [ ] Subtask: Write Tests (TDD) for Report Service (Data Aggregation)
  - [ ] Subtask: Implement Report Service (Queries for Costs, Jobs, Performance)
- [x] Task: Veritabanı Optimizasyonu 9497a91
  - [ ] Subtask: Analyze Query Performance
  - [ ] Subtask: Add Indexes if necessary (Prisma Schema Update)
- [x] Task: Conductor - User Manual Verification 'Altyapı ve Veri Hazırlığı' (Protocol in workflow.md) [checkpoint: 073ade0]

## Phase 2: UI Bileşenleri ve Görselleştirme
- [x] Task: Temel Raporlama Bileşenleri 2a55c8c
  - [ ] Subtask: Write Tests for KPI Cards & Filter Components
  - [ ] Subtask: Implement KPI Cards & Date Range/Filter Components
- [x] Task: Grafik Entegrasyonu (Recharts) a158684
  - [ ] Subtask: Write Tests for Chart Components
  - [ ] Subtask: Implement Cost Trend Chart (Line)
  - [ ] Subtask: Implement Job Distribution Chart (Pie)
  - [ ] Subtask: Implement Team Performance Chart (Bar)
- [ ] Task: Conductor - User Manual Verification 'UI Bileşenleri ve Görselleştirme' (Protocol in workflow.md)

## Phase 3: Rapor Sayfaları ve Entegrasyon
- [ ] Task: Maliyet Raporu Sayfası
  - [ ] Subtask: Write Tests for Cost Report Page
  - [ ] Subtask: Implement Cost Report Page (Table + Charts + Filters)
- [ ] Task: İş ve Performans Raporu Sayfası
  - [ ] Subtask: Write Tests for Performance Page
  - [ ] Subtask: Implement Performance Page
- [ ] Task: Conductor - User Manual Verification 'Rapor Sayfaları ve Entegrasyon' (Protocol in workflow.md)

## Phase 4: Dışa Aktarma ve Finalizasyon
- [ ] Task: Excel Export Özelliği
  - [ ] Subtask: Write Tests for Excel Generator
  - [ ] Subtask: Implement Excel Export Button & Logic
- [ ] Task: PDF Export Özelliği
  - [ ] Subtask: Write Tests for PDF Generator
  - [ ] Subtask: Implement PDF Export Button & Logic
- [ ] Task: E2E Testleri ve Bug Fixes
  - [ ] Subtask: Write E2E Tests (Playwright/Cypress if available or Integration Tests)
  - [ ] Subtask: Perform Final Polish & Bug Fixes
- [ ] Task: Conductor - User Manual Verification 'Dışa Aktarma ve Finalizasyon' (Protocol in workflow.md)
