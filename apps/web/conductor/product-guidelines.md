# Product Guidelines: Assembly Tracker

## 1. Design Principles & Visual Identity
Proje, platforma özgü ihtiyaçlara göre hibrit bir tasarım dili benimser:

### Web (Yönetim Paneli)
- **Stil:** Minimalist, Temiz ve Kurumsal.
- **Teknoloji:** ShadCN/UI, Radix UI ve TailwindCSS.
- **Odak:** Veri yoğunluğunu yönetebilen, okunabilirliği yüksek tablolar ve paneller.
- **Renk Paleti:** Nötr gri tonları, kurumsal mavi vurgular ve temiz beyaz arka planlar.

### Mobile (Saha Uygulaması)
- **Stil:** Endüstriyel, Yüksek Kontrast ve "Neon" Vurgular.
- **Teknoloji:** React Native (Expo).
- **Odak:** Dış mekanlarda ve zorlu koşullarda okunabilirlik.
- **Özellikler:**
  - **Neon-Yeşil Tema:** Aktif işler ve önemli butonlar için dikkat çekici renk kullanımı.
  - **Büyük UI Elemanları:** Eldivenle bile kolay tıklanabilir butonlar ve form alanları.

## 2. User Experience (UX) Priorities
### Saha Çalışanları (Mobile)
1.  **Hız (Efficiency):** İşlemler minimum tıklama ve ekran geçişi ile tamamlanmalıdır.
2.  **Görsel Geri Bildirim:** Kullanıcı yaptığı işlemin sonucunu (Başarılı/Hata) net, büyük ve anlaşılır modallar veya bildirimlerle görmelidir.
3.  **Offline Dayanıklılık (Resilience):** İnternet bağlantısı kopsa bile veri girişi devam edebilmeli, bağlantı geldiğinde otomatik senkronizasyon sağlanmalıdır. Veri kaybı "sıfır tolerans" prensibiyle ele alınır.

### Yöneticiler (Web)
1.  **Kuş Bakışı Görünüm:** Tüm ekiplerin ve işlerin durumu tek bir panoda özetlenmelidir.
2.  **Hızlı Onay:** Maliyet ve iş onayları toplu veya hızlı bir şekilde yapılabilmelidir.

## 3. Tone of Voice & Language
- **Dil:** Öncelikli dil **Türkçe**.
- **Ton:** Samimi, Doğrudan ve Anlaşılır.
  - *Örnek:* "İşlem başarıyla tamamlanmıştır." yerine **"İşlem tamamlandı."**
  - *Örnek:* "Lütfen gerekli alanları doldurunuz." yerine **"Eksik alanları doldurun."**
- **Terminoloji:** Sektör jargonuna uygun ancak herkesin anlayabileceği terimler kullanılmalıdır (Montaj, Checklist, Masraf vb.).

## 4. Accessibility & Inclusion
- **Mobil:** Yüksek kontrastlı renkler ve ölçeklenebilir metinler.
- **Web:** Klavye navigasyonu ve ekran okuyucu uyumluluğu (ShadCN standartları).
