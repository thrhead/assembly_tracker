# Kapsamlı Test Planı - Arşivlenmiş Özellikler
**Tarih:** 27 Ocak 2026  
**Amaç:** Assembly Tracker projesinin arşivlenmiş (tamamlanmış) özelliklerinin manuel test edilmesi  
**Platformlar:** 🌐 Web | 📱 Mobile

---

## 📋 Test Planı Özeti

Projede **11 adet tamamlanmış özellik** bulunmaktadır. Bu test planı her özelliğin işlevselliğini, güvenliğini ve kullanıcı deneyimini **iki platform (Web & Mobile)** üzerinde doğrulamak için tasarlanmıştır.

### Platform Tanımları:
- **🌐 Web:** Desktop browser (Chrome, Firefox, Safari) - 1024px+ width
- **📱 Mobile:** iOS Safari / Android Chrome - 375px width (responsive)

---

## 🛠️ Platform Compatibility Matrix

| Özellik | Web | Mobile | Shared | Notes |
|---------|-----|--------|--------|-------|
| Mobile Dashboard i18n Fix | ✅ | ✅ | i18n engine | Web: Dashboard view, Mobile: Native UI |
| Lint & Kod Kalitesi | ✅ | ✅ | Build process | Both: Same linting rules |
| Security XSS Hardening | ✅ | ✅ | Backend rules | Both: Sanitization applied |
| Webhook Retry | ✅ | ✅ | Backend only | Both: Async operations |
| API Documentation | ✅ | ✅ | Swagger UI | Web: Full portal, Mobile: Limited view |
| Proforma Export | ✅ | ✅ | PDF generation | Web: Desktop optimized, Mobile: Reduced size |
| Photo & Checklist | ⚠️ | ✅ | Job model | Web: File upload, Mobile: Camera integration |
| Worker Constraints | ✅ | ✅ | Business logic | Both: Same restrictions |
| Admin Job Editing | ✅ | ⚠️ | Admin panel | Web: Full featured, Mobile: Limited UI |
| Admin Job Deletion | ✅ | ⚠️ | Admin panel | Web: Full featured, Mobile: Limited UI |
| Admin Dashboard | ✅ | ⚠️ | Charts/Stats | Web: Full dashboard, Mobile: Simplified |

**Lejand:**  
✅ = Fully tested on platform  
⚠️ = Limited features on platform  
🌐 = Web Desktop browser  
📱 = Mobile (iOS/Android)

---

## 🎯 Test Kategorileri

| Kategori | Ağırlık | Açıklama |
|----------|--------|------------|
| **Fonksiyonel Test** | Yüksek | Özelliğin amaçlandığı şekilde çalışıp çalışmadığı |
| **Güvenlik Test** | Kritik | XSS, input sanitization, authorization kontrolleri |
| **UI/UX Test** | Orta | Arayüz tutarlılığı, responsive tasarım |
| **Performans Test** | Orta | Yükleme zamanları, webhook/API yanıt süreleri |
| **Entegrasyon Test** | Yüksek | Diğer modüllerle uyum |

---

## 📦 Tamamlanmış Özellikler & Test Planları

### 1. Mobile Dashboard i18n & UI Consistency Fix
**Priority:** HIGH | **Status:** Completed  
**Tarih:** 27 Ocak 2026

### 1. Mobile Dashboard i18n & UI Consistency Fix
**Priority:** HIGH | **Status:** Completed  
**Tarih:** 27 Ocak 2026  
**Platformlar:** 🌐 Web + 📱 Mobile

#### Hedefler:
- [ ] Dashboard'un 3+ dilde (TR, EN, DE) doğru şekilde gösterilmesi
- [ ] Metin kesilmelerinin olmaması
- [ ] Font boyutlarının tüm dillerde tutarlı olması
- [ ] Responsive tasarımın her platformda çalışması

---

## 🌐 WEB PLATFORM TESTS

#### Test Adımları:
1. **Web - Dil Değişim Testi**
   - Settings → Language → TR seç
   - [ ] Dashboard yenilendi
   - [ ] Tüm kelimelerin Türkçe göründüğünü doğrula
   - [ ] EN ve DE dillerine geç
   - [ ] Metin akışı düzgün (no text overflow)
   - [ ] Font boyutu uygun

2. **Web - UI Consistency (Desktop: 1920x1080)**
   - Dashboard'u açık
   - [ ] Layout balanced ve centered
   - [ ] Button/Card spacing tutarlı
   - [ ] Sidebar, header alignment doğru
   - [ ] No scrollbars needed

3. **Web - UI Consistency (Tablet: 768x1024)**
   - DevTools → Responsive mode → iPad
   - [ ] Layout responsive olarak adjust ediliyor
   - [ ] Sidebar collapsible/hamburger menu var
   - [ ] Text readable, no cutoff
   - [ ] Touch targets (buttons) 44px+ (web can be smaller)

4. **Web - Font Typography**
   - DevTools → Computed → Font properties
   - Heading sizes: H1 > H2 > H3 hierarchy
   - [ ] Font-size consistent (e.g., H1: 32px, H2: 24px)
   - [ ] Line-height proper
   - [ ] Letter-spacing readable

---

## 📱 MOBILE PLATFORM TESTS

#### Test Adımları:
1. **Mobile - Dil Değişim Testi**
   - Real device (iOS/Android) kullan ya da Android emulator
   - Settings → Language → TR seç
   - [ ] Dashboard immediately updated
   - [ ] Tüm kelimelerin Türkçe göründüğünü doğrula
   - [ ] EN ve DE dillerine geç
   - [ ] Animation smooth (no jank)

2. **Mobile - UI Consistency (375x667 - iPhone SE)**
   - Portrait mode açık
   - [ ] Layout single column'a stack ediliyor
   - [ ] Cards full-width with padding
   - [ ] Text readable (minimum 14px)
   - [ ] Buttons 48px+ height (touch-friendly)
   - [ ] No horizontal scrolling needed

3. **Mobile - UI Consistency (414x896 - iPhone 11)**
   - Portrait: [ ] Layout adapts
   - Landscape: [ ] Rotates properly, readable
   - [ ] Status bar doesn't interfere with content

4. **Mobile - Touch Interactions**
   - Button tap responsiveness
   - [ ] Visual feedback (ripple/press state)
   - [ ] No accidental triggers on scroll
   - [ ] Spacing between buttons (min 8px)

5. **Mobile - Font Typography**
   - Mobile Safari DevTools / Android DevTools
   - [ ] Body text: 16px+ (prevents iOS auto-zoom)
   - [ ] Heading hierarchy maintained
   - [ ] Line-height adequate for mobile (1.5+)

---

#### ✅ Success Criteria (Both Platforms):
✅ Tüm dillerde metin tam ve doğru görülüyor  
✅ Responsive tasarım her platform/screen size'da çalışıyor  
✅ Font hiyerarşisi doğru ve consistent  
✅ Touch targets mobile'da adequate size  
✅ Performance: <2s render time (web), <3s (mobile)

---

### 2. Lint & Kod Kalitesi İyileştirmesi
**Priority:** MEDIUM | **Status:** Completed  
**Tarih:** 26 Ocak 2026  
**Platformlar:** 🌐 Web + 📱 Mobile (Shared: Build Process)

#### Hedefler:
- [ ] ESLint/Prettier hataları minimalize edilmesi (her platform)
- [ ] Kod kalitesi metrikleri iyileştirilmesi
- [ ] Type coverage artışı (her platform)

---

## 🌐 WEB PLATFORM TESTS

#### Test Adımları:
1. **Web - Lint Kontrolü**
   ```bash
   npm run lint --workspace=@apps/web
   ```
   - [ ] Output: "✓ No errors"
   - [ ] Warning'ler minimal (ise varsa <10)
   - [ ] Build hatasız geçiyor

2. **Web - Code Quality Analysis**
   ```bash
   npm run analyze:code-quality --workspace=@apps/web
   ```
   - [ ] Complexity score acceptable (max 15 per function)
   - [ ] Type errors: 0
   - [ ] Unused imports: 0
   - [ ] Unused variables: 0

3. **Web - Type Check**
   ```bash
   npm run type-check --workspace=@apps/web
   ```
   - [ ] TypeScript errors: 0
   - [ ] Type inference working (no implicit any)
   - [ ] Type coverage: >80%

---

## 📱 MOBILE PLATFORM TESTS

#### Test Adımları:
1. **Mobile - Lint Kontrolü**
   ```bash
   npm run lint --workspace=@apps/mobile
   ```
   - [ ] Output: "✓ No errors"
   - [ ] Warning'ler minimal (<10)
   - [ ] Build hatasız geçiyor
   - [ ] React Native specific lints checked

2. **Mobile - Code Quality Analysis**
   ```bash
   npm run analyze:code-quality --workspace=@apps/mobile
   ```
   - [ ] Complexity score acceptable
   - [ ] Type errors: 0
   - [ ] Unused imports: 0
   - [ ] React hooks rules enforced

3. **Mobile - Type Check**
   ```bash
   npm run type-check --workspace=@apps/mobile
   ```
   - [ ] TypeScript errors: 0
   - [ ] React Native types correct
   - [ ] Type coverage: >80%

4. **Mobile - Platform Specific Checks**
   - [ ] iOS specific code follows patterns
   - [ ] Android specific code follows patterns
   - [ ] No platform-specific warnings

---

#### ✅ Success Criteria (Both Platforms):
✅ Zero build errors  
✅ Linting passes completely  
✅ Type coverage >80%  
✅ Complexity scores within limits  
✅ No technical debt increases

---

### 3. Security Hardening: XSS & Input Sanitization
**Priority:** HIGH | **Status:** Completed  
**Tarih:** 26 Ocak 2026  
**Platformlar:** 🌐 Web + 📱 Mobile (Shared: Backend Validation)

#### Hedefler:
- [ ] XSS zafiyeti kapatılması (her platform)
- [ ] Input sanitization uygulanması (her platform)
- [ ] Content Security Policy (CSP) kurulması (web)
- [ ] Mobile: Webview XSS protection

---

## 🌐 WEB PLATFORM TESTS

#### Test Adımları:
1. **Web - XSS Injection Testi**
   - Form alanına XSS payload'u gir:
     - `<script>alert('XSS')</script>`
     - `<img src=x onerror="alert('XSS')">`
     - `<svg/onload=alert('XSS')>`
   - [ ] Script çalışmadı
   - [ ] Payload metin olarak escaped göründü
   - [ ] Browser console'da error yok

2. **Web - Input Sanitization Testi**
   - Form alanlarına özel karakterler gir:
     - `<, >, ", ', &, ;`
     - `../../../etc/passwd` (path traversal)
     - `' OR '1'='1` (SQL injection)
   - [ ] Karakterler sanitize edildi
   - [ ] Veritabanında escape edildi
   - [ ] Backend error handling working

3. **Web - Content Security Policy**
   - DevTools → Network → Response Headers
   - [ ] Content-Security-Policy header var
   - [ ] Değeri restrictive: `default-src 'self'`
   - [ ] Inline scripts blocked: `'unsafe-inline'` yok
   - [ ] External script CDN whitelist yapılandırılmış

4. **Web - CSRF Koruması**
   - POST/PUT request Network tab'da check et
   - [ ] X-CSRF-Token header var
   - [ ] Token değeri session'da mevcut
   - [ ] Token mismatch'ta 403 Forbidden geliyor

---

## 📱 MOBILE PLATFORM TESTS

#### Test Adımları:
1. **Mobile - XSS Injection Testi**
   - Form alanına XSS payload'u gir (aynı listeden)
   - [ ] Native app'de JavaScript execute edilmedi
   - [ ] Payload text olarak gösterildi
   - [ ] No runtime errors

2. **Mobile - Webview XSS Protection**
   - React Native WebView component kullanıyorsa
   - [ ] JavaScript disabled by default
   - [ ] `javaScriptEnabled: false` ayarlanmış
   - [ ] Only trusted content loaded

3. **Mobile - Input Sanitization Testi**
   - Aynı karakterler gir
   - [ ] Sanitized backend'e gitti
   - [ ] Response properly handled
   - [ ] No input validation bypass

4. **Mobile - Deep Link Injection**
   - Malicious deep link try et
   - [ ] URL validation working
   - [ ] Unauthorized actions prevent ediliyor
   - [ ] Safe redirection

---

#### ✅ Success Criteria (Both Platforms):
✅ Hiçbir XSS vector açık değil  
✅ Tüm user input sanitize edilmiş  
✅ Backend validation enforce ediliyor  
✅ Web: CSP header doğru yapılandırılmış  
✅ Mobile: Webview security hardened  
✅ CSRF protection active (web)

---

### 4. Resilient Webhook & Retry Mechanism
**Priority:** HIGH | **Status:** Completed  
**Tarih:** 26 Ocak 2026  
**Platformlar:** Backend Shared (Web & Mobile Integration)

#### Hedefler:
- [ ] Webhook retry mekanizması çalışması (her app trigger edebilir)
- [ ] Exponential backoff implementasyonu
- [ ] Failed webhook log tutulması
- [ ] Platform-agnostic event handling

---

## 🌐 WEB PLATFORM TESTS

#### Test Adımları:
1. **Web - Webhook Delivery Testi**
   - Admin Panel → Webhooks → Test Webhook
   - Job event trigger et (from web UI)
   - [ ] Webhook payload alındı
   - [ ] Payload format correct
   - [ ] Timestamp accurate

2. **Web - Retry Mekanizması Testi**
   - Webhook endpoint'i simulate et (fail state)
   - Web UI'dan event trigger et
   - [ ] 1st attempt: Failed
   - [ ] 2nd attempt (~2s): Retry
   - [ ] 3rd attempt (~4s): Retry (exponential backoff)
   - [ ] 4th attempt (~8s): Retry
   - [ ] 5th attempt (~16s): Retry
   - [ ] Max attempts (5) reached, stopped
   - [ ] DevTools: No infinite loops

3. **Web - Log Kontrolü**
   - Admin Panel → Webhooks → Logs
   - [ ] Failed delivery visible
   - [ ] Retry history listed
   - [ ] Each attempt timestamped
   - [ ] Failure reason detailed (timeout, 500 error, etc.)

4. **Web - Success Case**
   - Webhook endpoint'i working state'e koy
   - Event trigger et
   - [ ] 1st attempt: Success (200 OK)
   - [ ] No further retries
   - [ ] Log status: "Delivered"

---

## 📱 MOBILE PLATFORM TESTS

#### Test Adımları:
1. **Mobile - Webhook Trigger Testi**
   - Mobile app'den job create/update et
   - Webhook'lar backend'den trigger oldu
   - [ ] Webhook payload alındı
   - [ ] Mobile data platform-agnostic
   - [ ] Backend payload same structure

2. **Mobile - Retry Mechanism (Offline Scenario)**
   - Mobile app offline mode'a geç
   - Job event trigger et
   - Offline event queue'ya alındı
   - [ ] App online'a gelince webhook retry
   - [ ] Exponential backoff still applied

3. **Mobile - Log Sync**
   - Mobile app: Settings → Webhook Logs
   - [ ] Logs sync'de admin panel ile match
   - [ ] Failed webhooks reflected
   - [ ] No data inconsistency

4. **Mobile - Error Handling**
   - Network unstable simulation
   - Webhook retry'lar retry
   - [ ] No app crash
   - [ ] User notification: "Syncing"
   - [ ] Graceful degradation

---

#### ✅ Success Criteria (Both Platforms):
✅ Webhooks güvenilir şekilde deliver ediliyor  
✅ Retry mekanizması exponential backoff kullanıyor  
✅ Max 5 retry attempts enforced  
✅ Başarısız webhooks log'lanıyor  
✅ Platform-agnostic event handling working  
✅ Mobile offline webhook queue working  
✅ No data loss on retry

---

### 5. Public API Documentation & Developer Portal
**Priority:** MEDIUM | **Status:** Completed  
**Tarih:** 26 Ocak 2026  
**Platformlar:** 🌐 Web (Full Portal) + 📱 Mobile (Limited View)

#### Hedefler:
- [ ] Swagger/OpenAPI dokumentasyonunun tamamlanması
- [ ] API endpoint'lerinin örneklenmiş olması
- [ ] Developer portal erişilebilir olması (Web)
- [ ] Mobile API testing capability

---

## 🌐 WEB PLATFORM TESTS

#### Test Adımları:
1. **Web - API Docs Erişim Testi**
   - Browser: `https://app.domain/api/docs`
   - [ ] Swagger UI loads without errors
   - [ ] Page responsive (1920px desktop)
   - [ ] Tüm endpoint'ler listeleniyor
   - [ ] Search functionality working

2. **Web - Endpoint Dokumentasyon Testi**
   - Her endpoint'i (GET, POST, PUT, DELETE) aç
   - Kontrol et:
     - [ ] Path parametreleri belirtilmiş (e.g., {jobId})
     - [ ] Query parametreleri belirtilmiş (filters, pagination)
     - [ ] Request body örneği JSON formatında var
     - [ ] Response 200, 201 örneğiyle gösterilmiş
     - [ ] Error codes (400, 401, 403, 404, 500) listelenmişş
     - [ ] Rate limiting info documented

3. **Web - Swagger Try It Out Testi**
   - Swagger UI'da "Try it out" butonu
   - GET endpoint test et
   - [ ] Request editor responsive
   - [ ] Response JSON formatted
   - [ ] Status code gösteriliyor
   - [ ] Response headers visible

4. **Web - Authentication Docs**
   - "Authorize" button visible
   - [ ] API key input field
   - [ ] Bearer token example
   - [ ] OAuth 2.0 flow (if applicable)
   - [ ] Example curl commands doğru

5. **Web - Developer Portal UI**
   - Portal main page
   - [ ] Quick start guide visible
   - [ ] Integration examples (JavaScript, Python, cURL)
   - [ ] Best practices documented
   - [ ] Changelog/versioning info

---

## 📱 MOBILE PLATFORM TESTS

#### Test Adımları:
1. **Mobile - API Documentation Access**
   - Mobile app: Settings → Developer Docs
   - [ ] Portal link opening in mobile browser
   - [ ] Responsive layout (375px width)
   - [ ] Navigation accessible
   - [ ] Readable font size (no pinch zoom needed)

2. **Mobile - Endpoint List Viewing**
   - Portal açık, mobile'da
   - [ ] Endpoint list scrollable
   - [ ] Each endpoint collapsible
   - [ ] Request/response examples visible
   - [ ] No horizontal scrolling needed

3. **Mobile - API Testing (In-App)**
   - Mobile app: Workspace → API Tester (if available)
   - Sample GET request try et
   - [ ] Request builder responsive
   - [ ] Response formatted
   - [ ] Status code shown
   - [ ] Error handling clear

4. **Mobile - Code Examples**
   - Mobile tabs: JavaScript, Python, cURL
   - [ ] Code samples readable
   - [ ] Copy button functional
   - [ ] Syntax highlighting present (if applicable)
   - [ ] Platform-specific examples (e.g., React Native)

---

#### ✅ Success Criteria (Both Platforms):
✅ Swagger UI hatasız yükleniyor  
✅ Tüm endpoint'ler kompletely dokümante edilmiş  
✅ Request/response examples accurate ve working  
✅ Web: Try it out features operational  
✅ Web: Authentication examples clear  
✅ Mobile: Portal responsive and accessible  
✅ Mobile: Code examples copy-friendly  
✅ No broken links in documentation  
✅ API versioning clearly documented

---

### 6. Enterprise Proforma & Reporting Optimization
**Priority:** MEDIUM | **Status:** Completed  
**Tarih:** 27 Ocak 2026  
**Platformlar:** 🌐 Web (Full) + 📱 Mobile (Simplified)

#### Hedefler:
- [ ] Proforma template iyileştirilmesi
- [ ] Rapor generation performansı artırılması
- [ ] Export formatlama (PDF, Excel) iyileştirilmesi
- [ ] Mobile reporting capability

---

## 🌐 WEB PLATFORM TESTS

#### Test Adımları:
1. **Web - Proforma Generation**
   - Job list → Select job → Generate Proforma
   - [ ] PDF hatasız generate edildi (<5s)
   - [ ] Tüm alanlar doldurulmuş
   - [ ] Logo ve header doğru positioned
   - [ ] Company branding consistent
   - [ ] Page breaks correct

2. **Web - Data Accuracy**
   - Proforma vs Job details comparison
   - [ ] Job ID matches
   - [ ] Client/Company info accurate
   - [ ] Item details complete (description, qty, price)
   - [ ] Totals calculated correctly
   - [ ] Currency symbols correct

3. **Web - Rapor Performance (100+ jobs)**
   - Admin: Reports → Generate Batch Report
   - [ ] <10 seconds completion
   - [ ] Memory usage stable (no crash)
   - [ ] UI responsive during generation
   - [ ] Progress bar updates

4. **Web - Export Formatları**
   - PDF: [ ] Page layout professional, no text cutoff
   - Excel: [ ] Columns aligned, formulas work, formatting preserved
   - CSV: [ ] UTF-8 encoding, Turkish chars (ç,ğ,ı,ö,ş,ü) correct

5. **Web - Batch Reporting**
   - Multiple jobs select → Batch export
   - [ ] All selected jobs included
   - [ ] Consistent formatting across jobs
   - [ ] Summary page added (if applicable)

---

## 📱 MOBILE PLATFORM TESTS

#### Test Adımları:
1. **Mobile - Simplified Report View**
   - Job details → View Report
   - [ ] Report loads (mobile optimized)
   - [ ] Readable on 375px width
   - [ ] Minimal scrolling needed
   - [ ] Font sizes adequate

2. **Mobile - PDF Generation**
   - "Download Proforma" button
   - [ ] PDF generates (takes <10s)
   - [ ] File saved to downloads
   - [ ] Can open in PDF viewer
   - [ ] Basic formatting preserved (mobile-optimized layout)

3. **Mobile - Export Options**
   - Share options available (Email, Drive, etc.)
   - [ ] Email attachment works
   - [ ] Cloud storage integration (if available)
   - [ ] Proper file naming

4. **Mobile - Performance**
   - Slow network simulation
   - [ ] Report generation doesn't timeout
   - [ ] User feedback provided (loading state)
   - [ ] Can cancel operation
   - [ ] No app crash

5. **Mobile - Data Privacy**
   - Report contains sensitive data
   - [ ] File permissions: Private only
   - [ ] No public links auto-generated
   - [ ] Requires authentication to access

---

#### ✅ Success Criteria (Both Platforms):
✅ Proforma hatasız generate ediliyor  
✅ Veriler accurate ve complete  
✅ Export formats working correctly  
✅ Web: Performance <10s for 100+ jobs  
✅ Mobile: Reports mobile-optimized and readable  
✅ PDF formatting professional  
✅ Excel data integrity maintained  
✅ CSV encoding correct  
✅ Mobile: Offline report viewing (if cached)

---

### 7. Fotoğraf ve Granüler Kontrol Listesi Doğrulaması
**Priority:** HIGH | **Status:** Completed  
**Tarih:** 26 Ocak 2026  
**Platformlar:** 🌐 Web (File Upload) + 📱 Mobile (Camera Integration)

#### Hedefler:
- [ ] Photo upload & validation (both platforms)
- [ ] Granular checklist implementation
- [ ] Photo-checklist linking
- [ ] Mobile: Camera integration

---

## 🌐 WEB PLATFORM TESTS

#### Test Adımları:
1. **Web - Photo Upload (File)**
   - Job details → Upload Photo section
   - Desktop file browser'dan file seç
   - [ ] Dosya seçimi responsive
   - [ ] Progress bar animated
   - [ ] Upload tamamlandı
   - [ ] Thumbnail preview gösteriliyor
   - [ ] Image URL accessible

2. **Web - Photo Validation**
   - Invalid file upload et:
     - Corrupt JPG file
     - 10MB+ file
     - .txt file
   - [ ] Error messages clear
   - [ ] File type validation (JPG, PNG only)
   - [ ] File size limit enforced (MAX: 5MB)
   - [ ] Upload prevented

3. **Web - Drag & Drop Upload**
   - Photo zone'a drag & drop et
   - [ ] Works for single file
   - [ ] Works for multiple files
   - [ ] Same validation applied

4. **Web - Checklist Management**
   - Job details → Checklist section
   - [ ] Each item has checkbox
   - [ ] Can check/uncheck items
   - [ ] State saves on click
   - [ ] Refresh → state persists
   - [ ] Item descriptions visible

5. **Web - Photo-Checklist Linking**
   - Checklist item check et
   - Photo attachment UI appears
   - [ ] Can select photo from uploaded list
   - [ ] Link established
   - [ ] List view shows photo count
   - [ ] Can unlink if needed

---

## 📱 MOBILE PLATFORM TESTS

#### Test Adımları:
1. **Mobile - Camera Photo Capture**
   - Job details → Add Photo
   - [ ] Camera permission prompt
   - [ ] Camera app launches
   - [ ] Can take photo
   - [ ] Preview before upload
   - [ ] Confirm button saves

2. **Mobile - Gallery Photo Selection**
   - Add Photo → Gallery option
   - [ ] Gallery app opens
   - [ ] Can select from gallery
   - [ ] Image preview shown
   - [ ] Can crop/rotate (optional)
   - [ ] Upload starts automatically

3. **Mobile - Photo Upload Progress**
   - Large photo upload (3MB+)
   - [ ] Progress indicator visible
   - [ ] Can cancel mid-upload
   - [ ] Network error handling graceful

4. **Mobile - Photo Validation**
   - Invalid file attempt
   - [ ] Error toast/alert
   - [ ] Clear error message (format, size)
   - [ ] Can retry upload

5. **Mobile - Checklist UI**
   - Job details → Checklist
   - [ ] Items scrollable
   - [ ] Checkboxes touch-friendly (48px+)
   - [ ] Item descriptions readable
   - [ ] State updates immediately

6. **Mobile - Photo-Checklist Linking**
   - Checklist item check
   - [ ] Photo attachment prompt
   - [ ] Camera/Gallery options
   - [ ] Photo linked successfully
   - [ ] Can view linked photo
   - [ ] Can replace photo

7. **Mobile - Offline Capability**
   - Offline mode: Photos taken
   - [ ] Queued for upload
   - [ ] Checklist state saved locally
   - [ ] Online → automatic sync
   - [ ] No data loss

---

#### ✅ Success Criteria (Both Platforms):
✅ Photos upload successfully (both capture methods)  
✅ File validation working (size, format)  
✅ Thumbnails generate and display  
✅ Checklist items track state correctly  
✅ Photo-checklist linking functional  
✅ Web: Drag & drop upload works  
✅ Mobile: Camera integration responsive  
✅ Mobile: Gallery selection seamless  
✅ Offline photo queue working (mobile)  
✅ No data loss on sync

---

### 8. Worker İş Tamamlama Kısıtlamaları
**Priority:** MEDIUM | **Status:** Completed  
**Tarih:** 26 Ocak 2026  
**Platformlar:** 🌐 Web + 📱 Mobile (Shared: Backend Rules)

#### Hedefler:
- [ ] Worker'ların tamamlayabileceği job'lar restricted (her platform)
- [ ] Business logic kısıtlamalarının enforce edilmesi
- [ ] Pre-completion validation

---

## 🌐 WEB PLATFORM TESTS

#### Test Adımları:
1. **Web - Worker Assignment Validation**
   - Worker olarak login et
   - Job list açık
   - [ ] Sadece assigned job'lar visible
   - [ ] Diğer job'lar gri/disabled veya hidden
   - [ ] Filter: "My Jobs" uygulanmış
   - [ ] List sorted by priority/duedate

2. **Web - Completion Restrictions**
   - Assigned job açık → Complete button
   - Pre-completion validation:
     - [ ] Checklist status checked
     - [ ] Required photos validated
     - [ ] Comments/notes field checked
   - [ ] Error modal gösterilirse
   - [ ] Missing items highlighted (e.g., unchecked items, no photos)

3. **Web - Status Transition**
   - Job initial status: "New"
   - [ ] Worker "Start" button → "In Progress"
   - [ ] Completing before checklist done → Error
   - [ ] All validations pass → "Mark Complete"
   - [ ] Status changed to "Completed"
   - [ ] UI refreshed, complete button disabled

4. **Web - Re-opening Prevention**
   - Completed job view
   - [ ] "Re-open" button absent (worker)
   - [ ] Edit functionality disabled
   - [ ] Tooltip explains: "Only admins can reopen"
   - [ ] UI read-only

---

## 📱 MOBILE PLATFORM TESTS

#### Test Adımları:
1. **Mobile - Job List for Worker**
   - Worker app login
   - Home tab → My Jobs
   - [ ] Only assigned jobs displayed
   - [ ] Other jobs not accessible
   - [ ] Pull to refresh works
   - [ ] List scrollable

2. **Mobile - Job Details & Completion**
   - Assigned job tap
   - [ ] Job details load
   - [ ] "Start Job" button visible
   - Tap Start
   - [ ] Status changes to "In Progress"
   - [ ] UI updates
   - [ ] Checklist section becomes active

3. **Mobile - Pre-Completion Validation**
   - Checklist: items partially checked
   - [ ] "Complete Job" button disabled/grayed
   - [ ] Toast/hint: "Complete all checklist items"
   - Complete all items + add photos
   - [ ] "Complete Job" button enabled
   - Tap Complete
   - [ ] Confirmation dialog
   - Confirm
   - [ ] Job marked complete

4. **Mobile - Offline Completion**
   - Offline mode: Try complete job
   - [ ] Validation runs locally
   - [ ] Allows completion (queued for sync)
   - Online → Syncs to server
   - [ ] Status updated on server

5. **Mobile - Restricted Actions**
   - Completed job tap
   - [ ] Edit button not visible
   - [ ] Re-open button absent
   - [ ] Read-only view

---

#### ✅ Success Criteria (Both Platforms):
✅ Workers only see assigned jobs  
✅ Completion restrictions enforced  
✅ Pre-completion validation working  
✅ Web: Invalid transitions prevented  
✅ Mobile: Offline completion queued properly  
✅ Status transitions accurate  
✅ Re-open permission restricted to admin  
✅ UI reflects business logic correctly  
✅ Error messages clear and actionable

---

### 9. Admin İş Düzenleme Yetkisi
**Priority:** MEDIUM | **Status:** Completed  
**Tarih:** 26 Ocak 2026  
**Platformlar:** 🌐 Web (Full Admin) + 📱 Mobile (Limited/Read-Only)

#### Hedefler:
- [ ] Admin'in completed job'ları edit edebilmesi (web)
- [ ] Edit history tracking
- [ ] Worker/Customer notification
- [ ] Mobile: View edit history

---

## 🌐 WEB PLATFORM TESTS

#### Test Adımları:
1. **Web - Edit Permission**
   - Admin login
   - Completed job details
   - [ ] "Edit" button visible
   - [ ] Edit form accessible
   - Can modify fields (notes, details)
   - As Worker login
   - [ ] Same completed job
   - [ ] "Edit" button absent
   - [ ] Read-only view enforced

2. **Web - Edit History Tab**
   - Job history section açık
   - Admin by field updated
   - [ ] Change logged in history
   - [ ] Timestamp recorded (e.g., 2026-01-27 14:30:00)
   - [ ] Admin name visible
   - [ ] "Before" value shown
   - [ ] "After" value shown
   - [ ] Field name displayed (e.g., "Notes", "Status")

3. **Web - Notification on Edit**
   - Admin: Job field değiştir (e.g., update notes)
   - [ ] Save successful
   - [ ] Worker/Customer notification triggered
   - Check worker's notifications
   - [ ] Email received (if enabled)
   - [ ] In-app notification shown
   - [ ] Message describes change: "Admin updated job notes"

4. **Web - Edit Validation**
   - Invalid data gir:
     - Phone number: "invalid"
     - Email: "not-an-email"
     - Amount: "abc"
   - [ ] Validation error shown
   - [ ] Save prevented
   - [ ] Error message helpful

5. **Web - Concurrent Edits**
   - Two admins edit same job
   - [ ] Last write wins (or conflict detected)
   - [ ] No data corruption
   - [ ] History shows both edits

---

## 📱 MOBILE PLATFORM TESTS

#### Test Adımları:
1. **Mobile - Edit Permission**
   - Admin app login
   - Job details tap
   - [ ] "Edit" button visible (admin only)
   - Tap Edit
   - [ ] Edit form opens
   - Can modify notes
   - As Worker login
   - [ ] Same job
   - [ ] "Edit" button absent

2. **Mobile - View Edit History**
   - Job details → History tab
   - [ ] Edit history list visible
   - [ ] Admin names, timestamps shown
   - [ ] Changes described
   - Tap history entry
   - [ ] Before/after values shown
   - [ ] Diff view (if supported)

3. **Mobile - Offline Edit**
   - Offline mode: Admin tries edit
   - [ ] Changes saved locally
   - Online → Syncs to server
   - [ ] Server notified of edit
   - [ ] Worker receives notification

4. **Mobile - Limited Edit**
   - Some fields read-only on mobile (e.g., critical fields)
   - [ ] Edit form respects constraints
   - [ ] Cannot edit protected fields
   - Error message if attempted

---

#### ✅ Success Criteria (Both Platforms):
✅ Admin edit permission working  
✅ Worker edit permission restricted  
✅ Edit history complete and accurate  
✅ Worker/Customer notifications sent  
✅ Validation enforced on edit  
✅ Web: Full edit capabilities  
✅ Mobile: Admin can edit jobs  
✅ Mobile: Edit history visible  
✅ Concurrent edits handled safely  
✅ Offline edit queued properly (mobile)

---

### 10. Admin İş Silme Yetkisi
**Priority:** MEDIUM | **Status:** Completed  
**Tarih:** 26 Ocak 2026  
**Platformlar:** 🌐 Web (Full) + 📱 Mobile (Limited)

#### Hedefler:
- [ ] Admin'in job'ları silebilmesi (each platform)
- [ ] Soft delete implementasyonu
- [ ] Deletion audit logging
- [ ] Restoration capability

---

## 🌐 WEB PLATFORM TESTS

#### Test Adımları:
1. **Web - Delete Permission**
   - Admin login → Job details
   - [ ] "Delete" button visible & active
   - As Worker login → Same job
   - [ ] "Delete" button absent
   - As Guest
   - [ ] Job details not accessible

2. **Web - Confirmation Dialog**
   - Delete button tap
   - [ ] Confirmation modal shown
   - [ ] Warning message: "This action is permanent"
   - [ ] Shows job title/ID being deleted
   - Cancel button
   - [ ] Modal closes, job persists
   - Confirm button
   - [ ] Job marked deleted
   - [ ] UI returns to job list

3. **Web - Soft Delete Verification**
   - After deletion
   - Job list: [ ] Job hidden from normal view
   - Admin Panel → Deleted Items section
   - [ ] Deleted job appears in list
   - [ ] Timestamp and admin name shown
   - [ ] "Restore" button available
   - Database check: Job marked deleted_at, not removed

4. **Web - Audit Trail**
   - Admin Panel → Audit Trail
   - [ ] Deletion logged: "Job #123 deleted by Admin Name"
   - [ ] Timestamp accurate
   - [ ] Reason (if provided) captured
   - [ ] Restore history tracked (if restored)

5. **Web - Data Integrity**
   - Deleted job had associated data:
     - Photos, checklist items, notes
   - [ ] All linked records soft-deleted too
   - [ ] No orphaned data
   - Restore job
   - [ ] All linked data restored

---

## 📱 MOBILE PLATFORM TESTS

#### Test Adımları:
1. **Mobile - Delete Permission**
   - Admin app login
   - Job details
   - [ ] Delete option available (menu or button)
   - Worker app login
   - [ ] No delete option visible

2. **Mobile - Delete Flow**
   - Admin: Tap delete
   - [ ] Confirmation dialog shown
   - [ ] Clear warning message
   - Cancel: [ ] Dialog closes
   - Confirm: [ ] Job deleted
   - [ ] Job removed from list
   - [ ] Feedback toast: "Job deleted"

3. **Mobile - Offline Delete**
   - Offline mode: Admin deletes job
   - [ ] Deletion queued locally
   - Online → Syncs
   - [ ] Deletion confirmed on server
   - [ ] Audit trail updated

4. **Mobile - Deleted Items Access**
   - Admin app: Settings → Deleted Items
   - [ ] List of deleted jobs shown (if accessible on mobile)
   - [ ] Restore option available
   - [ ] No accidental data loss

---

#### ✅ Success Criteria (Both Platforms):
✅ Admin delete permission working  
✅ Worker/Guest cannot delete  
✅ Confirmation required  
✅ Soft delete implemented (data not lost)  
✅ Audit trail complete  
✅ Linked data handled (cascade soft-delete)  
✅ Restore functionality available  
✅ Web: Full deleted items management  
✅ Mobile: Delete with offline support  
✅ No data corruption or orphaning

---

### 11. Admin Dashboard Modernizasyonu ve Hatalar
**Priority:** HIGH | **Status:** Completed  
**Tarih:** 26 Ocak 2026  
**Platformlar:** 🌐 Web (Full Dashboard) + 📱 Mobile (Simplified Stats)

#### Hedefler:
- [ ] Dashboard UI modernize edilmesi
- [ ] Known bug'lar fix edilmesi
- [ ] Performance optimization
- [ ] Mobile-responsive dashboard

---

## 🌐 WEB PLATFORM TESTS

#### Test Adımları:
1. **Web - Dashboard Performance**
   - Admin login
   - Dashboard page load
   - [ ] <3 seconds full load
   - [ ] Shimmer/skeleton placeholders visible
   - [ ] No layout shift (CLS < 0.1)
   - DevTools: Network tab
   - [ ] Bundle size reasonable
   - [ ] No render blocking resources

2. **Web - Widget/Card Rendering (Desktop)**
   - Dashboard açık, 1920x1080 viewport
   - Widgets:
     - [ ] Job Overview card: Total, In Progress, Completed counts
     - [ ] Recent Activities: Last 10 actions, timestamps, names
     - [ ] Team Performance: Worker productivity bars, sortable
     - [ ] Revenue/Budget: Progress bars, currency formatted
   - [ ] All cards properly formatted
   - [ ] Colors modern palette
   - [ ] Spacing consistent
   - [ ] Typography hierarchy clear

3. **Web - Interactive Controls**
   - Date range picker
   - [ ] Opens on click, responsive calendar
   - [ ] Can select date range
   - [ ] Dashboard updates on change
   - Status filters
   - [ ] Checkboxes/dropdown for statuses
   - [ ] Multi-select working
   - [ ] Results filter dynamically
   - Search box
   - [ ] Autocomplete suggestions
   - [ ] Real-time filtering

4. **Web - Charts & Visualizations**
   - Performance charts section
   - [ ] Line/bar charts render
   - [ ] Data points accurate
   - [ ] Legend visible and clickable
   - [ ] Hover tooltips show values
   - [ ] Responsive: Can shrink, still readable

5. **Web - Previous Bugs Fixed**
   - ✅ Missing data in widgets
   - ✅ Broken filter functionality
   - ✅ Slow loading (now <3s)
   - ✅ UI responsive on tablets

6. **Web - Accessibility**
   - DevTools: Accessibility tab
   - [ ] Tab navigation works (focus visible)
   - [ ] Color contrast WCAG AA+ (4.5:1 for text)
   - [ ] Buttons have aria-labels
   - [ ] Charts have alt text or ARIA descriptions
   - Screen reader (if available)
   - [ ] Dashboard title announced
   - [ ] Widget structure announced

---

## 📱 MOBILE PLATFORM TESTS

#### Test Adımları:
1. **Mobile - Dashboard Layout (375x667 iPhone)**
   - Admin app open
   - Dashboard tab
   - [ ] Single column layout
   - [ ] Cards stack vertically
   - [ ] Text readable (no zoom needed)
   - [ ] Buttons/controls touch-friendly (48px+)
   - [ ] No horizontal scrolling

2. **Mobile - Stats View**
   - Dashboard stats visible:
     - [ ] Job counts (Today, This Week, This Month)
     - [ ] Top performers list
     - [ ] Recent activity feed
   - [ ] Scrollable, not overloaded
   - [ ] Data updates in real-time

3. **Mobile - Chart Simplification**
   - Charts on mobile: [ ] Simplified version
   - [ ] Readable without rotation
   - [ ] Essential data only
   - Landscape mode: [ ] More detail if space
   - Tab to rotate chart (if available)

4. **Mobile - Filter Controls**
   - Date range picker
   - [ ] Mobile-optimized (big touch targets)
   - [ ] Responsive date input
   - [ ] Can apply filters
   - Status filters
   - [ ] Dropdown/modal style
   - [ ] Multi-select working

5. **Mobile - Performance**
   - Load time: [ ] <5 seconds
   - Scrolling smooth (no jank)
   - [ ] No lag when filtering
   - Tap responsiveness: [ ] Immediate feedback

6. **Mobile - Landscape Mode (414x896 iPhone)**
   - Rotate phone
   - [ ] Dashboard reflows
   - [ ] 2-column layout (if space allows)
   - [ ] All content accessible
   - Status bar doesn't obstruct

7. **Mobile - Offline State**
   - Offline mode
   - [ ] Cached dashboard data shown
   - [ ] "Offline" indicator visible
   - Online → [ ] Auto-refresh

---

#### ✅ Success Criteria (Both Platforms):
✅ Dashboard modern UI and visually appealing  
✅ Performance: Web <3s, Mobile <5s  
✅ All widgets rendering correctly  
✅ Previous bugs completely fixed  
✅ Web: Full interactive features  
✅ Web: Accessibility standards met  
✅ Mobile: Responsive and touch-friendly  
✅ Mobile: Stats simplified and readable  
✅ Charts responsive on all screen sizes  
✅ No layout shifts or visual glitches  
✅ Data accuracy in all widgets  
✅ Filters/search responsive

---

## 🔄 Regression Test Checklist

### Cross-Feature Compatibility
- [ ] Mobile i18n fix, Admin dashboard modernization'ı break etmedi mi?
- [ ] Security hardening, API functionality'i break etmedi mi?
- [ ] Webhook retry, Worker completion constraints ile conflict var mı?

### Data Flow Validation
- [ ] Photo upload (checklist feature) → Proforma (export) → correctly rendered
- [ ] Admin edit (job editing) → Worker view (data consistency)
- [ ] Job completion (constraints) → Dashboard stats (reflection)

---

## 📊 Test Execution Tracking

### Platform Legend:
- 🌐 = Web Desktop Browser (Chrome, Firefox, Safari)
- 📱 = Mobile App (iOS Safari / Android Chrome)
- ⬜ = Not Started | 🟨 = In Progress | ✅ = Passed | ❌ = Failed

### Web Platform (🌐)

| Feature | Platform | Status | Notes | Tester | Date |
|---------|----------|--------|-------|--------|------|
| Mobile i18n Fix | 🌐 Web | ⬜ | Dashboard i18n, font consistency | - | - |
| Lint & Quality | 🌐 Web | ⬜ | ESLint, Type checks, code quality | - | - |
| Security XSS | 🌐 Web | ⬜ | XSS injection, input sanitization, CSP | - | - |
| Webhook Retry | 🌐 Web | ⬜ | Webhook delivery, retry mechanism, logs | - | - |
| API Docs | 🌐 Web | ⬜ | Swagger UI, endpoint docs, Try it out | - | - |
| Proforma Export | 🌐 Web | ⬜ | PDF/Excel generation, data accuracy, performance | - | - |
| Photo & Checklist | 🌐 Web | ⬜ | File upload, drag-drop, checklist linking | - | - |
| Worker Constraints | 🌐 Web | ⬜ | Job visibility, completion restrictions | - | - |
| Admin Edit | 🌐 Web | ⬜ | Full edit capabilities, history, notifications | - | - |
| Admin Delete | 🌐 Web | ⬜ | Delete permission, soft delete, audit trail | - | - |
| Admin Dashboard | 🌐 Web | ⬜ | UI modernization, widgets, performance, interactive | - | - |

### Mobile Platform (📱)

| Feature | Platform | Status | Notes | Tester | Date |
|----------|----------|--------|-------|--------|------|
| Mobile i18n Fix | 📱 Mobile | ⬜ | Dashboard responsive, touch-friendly | - | - |
| Lint & Quality | 📱 Mobile | ⬜ | Build, ESLint, React Native specific | - | - |
| Security XSS | 📱 Mobile | ⬜ | Webview security, deep link injection | - | - |
| Webhook Retry | 📱 Mobile | ⬜ | Event handling, offline queue, sync | - | - |
| API Docs | 📱 Mobile | ⬜ | Portal responsive, mobile-optimized | - | - |
| Proforma Export | 📱 Mobile | ⬜ | Simplified report, PDF download, offline view | - | - |
| Photo & Checklist | 📱 Mobile | ⬜ | Camera capture, gallery, offline queue | - | - |
| Worker Constraints | 📱 Mobile | ⬜ | Job list responsive, offline completion | - | - |
| Admin Edit | 📱 Mobile | ⬜ | Limited edit, history view, offline sync | - | - |
| Admin Delete | 📱 Mobile | ⬜ | Delete with offline support | - | - |
| Admin Dashboard | 📱 Mobile | ⬜ | Simplified stats, responsive layout | - | - |

---

## 🎯 Success Criteria Summary

### Overall Project Health
- ✅ 100% of archived features passing functional tests
- ✅ 0 critical/high severity bugs found
- ✅ Security hardening verified (XSS, input validation, CSP)
- ✅ Performance metrics acceptable (<3s dashboard load, <10s reports)
- ✅ All UI/UX improvements visible and working
- ✅ Cross-feature compatibility validated

### Documentation Requirements
- ✅ Test results documented for audit trail
- ✅ Any bugs found logged with severity
- ✅ Feature completeness verified
- ✅ Known limitations noted (if any)

---

## 📝 Bug Report Template

Bir bug bulunursa, şu format'ta kaydet:

```
### Bug ID: BUG-XXX
**Feature:** [Feature Name]  
**Severity:** [Critical/High/Medium/Low]  
**Title:** [Brief title]  

**Description:**
[Detailed description of the bug]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Expected vs. Actual result]

**Environment:**
- Device: [Browser/Mobile/Desktop]
- OS: [Windows/macOS/iOS/Android]
- Version: [App version]

**Screenshots:** [If applicable]
```

---

## ✅ Test Completion Checklist

### Web Platform (🌐)
- [ ] Mobile i18n Fix - Web platform tested
- [ ] Lint & Quality - Web workspace tested
- [ ] Security XSS - Web XSS & CSP tested
- [ ] Webhook Retry - Web trigger & retry tested
- [ ] API Docs - Web portal tested
- [ ] Proforma Export - Web generation & formats tested
- [ ] Photo & Checklist - Web upload & drag-drop tested
- [ ] Worker Constraints - Web restrictions tested
- [ ] Admin Edit - Web full edit tested
- [ ] Admin Delete - Web soft delete tested
- [ ] Admin Dashboard - Web UI & performance tested

### Mobile Platform (📱)
- [ ] Mobile i18n Fix - Mobile responsive tested
- [ ] Lint & Quality - Mobile workspace tested
- [ ] Security XSS - Mobile webview tested
- [ ] Webhook Retry - Mobile offline queue tested
- [ ] API Docs - Mobile portal responsive tested
- [ ] Proforma Export - Mobile simplified report tested
- [ ] Photo & Checklist - Mobile camera/gallery tested
- [ ] Worker Constraints - Mobile offline completion tested
- [ ] Admin Edit - Mobile edit & history tested
- [ ] Admin Delete - Mobile delete offline tested
- [ ] Admin Dashboard - Mobile simplified stats tested

### Overall Test Summary
- [ ] All 11 features tested on both platforms
- [ ] Regression tests passed (cross-feature compatibility)
- [ ] No critical/high severity bugs found
- [ ] Test results documented
- [ ] Platform-specific edge cases verified
- [ ] Offline capability tested (mobile)
- [ ] Performance benchmarks met
- [ ] Security requirements validated
- [ ] Sign-off obtained (QA Lead/PM)

---

**Test Plan Sahibi:** QA Team  
**Son Güncelleme:** 27 Ocak 2026  
**Sonraki Review:** İlk bugların çözülmesinden sonra
