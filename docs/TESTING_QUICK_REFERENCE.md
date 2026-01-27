# 🚀 Test Planı - Hızlı Başlangıç Rehberi

**Assembly Tracker Proje Testi**  
📅 **Tarih:** 27 Ocak 2026  
📊 **Kapak:** 11 özellik × 2 platform = 22 test senaryosu

---

## 🎯 Test Hedefleri

| Platform | Senaryo | Sayı | Beklenen Sonuç |
|----------|---------|------|---|
| 🌐 **Web** | Desktop full-featured testing | 11 features | ✅ All pass |
| 📱 **Mobile** | Responsive, touch, offline testing | 11 features | ✅ All pass |
| 🔄 **Regression** | Cross-platform compatibility | 3 checks | ✅ No conflicts |

---

## 📋 Test Planı Yapısı

```
TEST_PLAN.md (1383 lines)
├── Platform Compatibility Matrix (11 features)
├── 11 Detailed Feature Tests
│   ├── 1. Mobile i18n Fix (Web + Mobile)
│   ├── 2. Lint & Quality (Web + Mobile)
│   ├── 3. Security XSS (Web + Mobile)
│   ├── 4. Webhook Retry (Backend Shared)
│   ├── 5. API Documentation (Web Full + Mobile Limited)
│   ├── 6. Proforma Export (Web Full + Mobile Simplified)
│   ├── 7. Photo & Checklist (Web Upload + Mobile Camera)
│   ├── 8. Worker Constraints (Web + Mobile)
│   ├── 9. Admin Edit (Web Full + Mobile Limited)
│   ├── 10. Admin Delete (Web Full + Mobile Limited)
│   └── 11. Admin Dashboard (Web Full + Mobile Simplified)
├── Regression Test Checklist
├── Test Execution Tracking (22 test slots)
└── Success Criteria & Bug Report Template
```

---

## 🌐 WEB PLATFORM - Test Focus Areas

| Sıra | Özellik | Focus | Araçlar |
|------|---------|-------|---------|
| 1 | i18n Fix | Dashboard responsiveness, font consistency | Desktop browser, DevTools |
| 2 | Lint & Quality | Build process, no errors | Terminal, npm commands |
| 3 | Security XSS | Input validation, CSP headers | DevTools Network, Burp |
| 4 | Webhook Retry | Event delivery, exponential backoff | Postman, Admin logs |
| 5 | API Docs | Swagger UI, Try it out feature | Browser, Swagger editor |
| 6 | Proforma Export | PDF/Excel generation, large data | File system, browser |
| 7 | Photo & Checklist | File upload, drag-drop | DevTools, file browser |
| 8 | Worker Constraints | Job visibility, status transitions | Browser, multiple roles |
| 9 | Admin Edit | Full edit, history tracking | Admin panel, audit logs |
| 10 | Admin Delete | Soft delete, restoration | Admin panel, DB check |
| 11 | Dashboard | Modern UI, performance <3s | DevTools Lighthouse, Performance |

**Web Test Environment:**
- Browsers: Chrome, Firefox, Safari
- Viewports: 1920x1080 (desktop), 768x1024 (tablet)
- Tools: DevTools, Postman, Admin Panel

---

## 📱 MOBILE PLATFORM - Test Focus Areas

| Sıra | Özellik | Focus | Platformlar |
|------|---------|-------|---|
| 1 | i18n Fix | Touch friendly, language switching | iOS + Android |
| 2 | Lint & Quality | React Native specific rules | Build process |
| 3 | Security XSS | Webview protection, deep links | Webview, decompile |
| 4 | Webhook Retry | Offline queue, sync mechanism | Network simulator |
| 5 | API Docs | Mobile-responsive portal | Mobile browser |
| 6 | Proforma Export | Simplified PDF, offline view | Device storage |
| 7 | Photo & Checklist | Camera, gallery, offline queue | Device camera, gallery |
| 8 | Worker Constraints | Job list, offline completion | Job queue |
| 9 | Admin Edit | Limited UI, offline sync | Admin app |
| 10 | Admin Delete | Delete with offline support | Admin app |
| 11 | Dashboard | Simplified stats, responsive | Mobile app |

**Mobile Test Environment:**
- Real devices: iOS (iPhone SE/11) + Android (Pixel)
- OR Emulator: Android emulator, iOS simulator
- Viewports: 375x667 (iPhone SE), 414x896 (iPhone 11)
- Tools: Xcode, Android Studio, Network simulator

---

## ⏱️ Estimated Testing Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| **Setup** | 30 min | Environment prep, test credentials, tools |
| **Web Platform** | 4-5 hours | 11 features × 15-20 min each + cross-browser |
| **Mobile Platform** | 5-6 hours | 11 features × 20-30 min each + device variety |
| **Regression** | 1 hour | Cross-feature compatibility + data integrity |
| **Bug Documentation** | 30 min - 2 hours | Based on bugs found |
| **Total** | **11-14 hours** | 1.5 - 2 working days |

---

## ✅ Pre-Test Checklist

Before starting tests:

- [ ] Web environment ready (browser, DevTools)
- [ ] Mobile environment ready (device or emulator)
- [ ] Test accounts created (admin, worker, customer roles)
- [ ] Test data seeded (sample jobs, photos, webhooks)
- [ ] Network connectivity verified
- [ ] Offline mode capability (mobile) tested
- [ ] Performance monitoring tools ready (DevTools Lighthouse)
- [ ] Bug tracking system accessible
- [ ] Test plan document open

---

## 🚦 Test Execution Status Symbols

| Symbol | Meaning | Next Action |
|--------|---------|---|
| ⬜ | Not started | Begin testing |
| 🟨 | In progress | Continue, take notes |
| ✅ | Passed | Mark complete, move on |
| ❌ | Failed | Document bug, retry or escalate |
| ⏭️ | Skipped | Note reason, document |
| 🔴 | Blocked | Dependency issue, document |

---

## 📝 During Testing

### Per Feature Checklist:
1. **Setup:** Open feature, log in with correct role
2. **Execute:** Follow test steps in TEST_PLAN.md
3. **Verify:** Check each ✓ checkbox
4. **Issues:** Document in bug template (if found)
5. **Notes:** Add platform-specific observations
6. **Status:** Mark ✅ or ❌ in tracking table

### Bug Documentation:
```
Use format from TEST_PLAN.md → Bug Report Template
Include: Device, OS, Steps, Expected vs Actual, Screenshot
```

---

## 🎯 Pass/Fail Criteria

### PASS: Feature
- ✅ All test checkboxes checked
- ✅ No critical/high bugs found
- ✅ Platform-specific requirements met
- ✅ Performance targets met

### FAIL: Feature
- ❌ 1+ critical bugs found
- ❌ Core functionality broken
- ❌ Performance below threshold
- ❌ Security issues present

### Overall Test:
- **PASS:** All 11 features pass on both platforms
- **FAIL:** 1+ features fail on either platform

---

## 🏁 Post-Testing

### Sign-off Tasks:
1. [ ] Complete tracking table (22 test slots)
2. [ ] Document all bugs with severity
3. [ ] Calculate pass rate (11 features × 2 platforms)
4. [ ] Verify no critical bugs remain
5. [ ] Obtain QA Lead sign-off
6. [ ] Archive test results

### Report to Generate:
```
Test Results Summary:
- Features tested: 11/11 ✅
- Platforms tested: 2/2 (Web, Mobile) ✅
- Total test cases: 22
- Passed: XX ✅
- Failed: XX ❌
- Bugs found: XX (Critical: X, High: X, Medium: X, Low: X)
- Pass rate: XX%
- Status: APPROVED / NEEDS FIXES
```

---

## 📞 Support & Contacts

| Role | Name | Responsibility |
|------|------|---|
| QA Lead | [Name] | Test oversight, sign-off |
| Web Dev | [Name] | Web platform support |
| Mobile Dev | [Name] | Mobile platform support |
| PM | [Name] | Release decision |

**Escalation Path:** Developer → QA Lead → PM → Product

---

## 📚 Reference Links

- **Full Test Plan:** `TEST_PLAN.md` (1383 lines)
- **Archived Features:** `/apps/web/conductor/archive/`
- **Metadata:** `metadata.json` in each archive folder
- **Platform Compatibility:** See matrix above

---

**Remember:**
- 🎯 Test with purpose - verify each requirement
- 📝 Document everything - even "working as expected"
- 🐛 Find bugs early - better now than in production
- ✅ Verify twice - especially on both platforms
- 💬 Communicate - ask questions, escalate blockers

**Good luck with testing! 🚀**
