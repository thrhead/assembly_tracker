# Vercel Dağıtım Kılavuzu (Vercel Deployment Guide)

Bu kılavuz, `assembly_tracker` projesinin `apps/web` uygulamasını Vercel üzerinde canlıya almak için gerekli adımları içermektedir.

## 1. Vercel Proje Ayarları

Vercel üzerinde yeni bir proje oluştururken aşağıdaki ayarları kullanın:

- **Framework Preset:** Next.js
- **Root Directory:** `apps/web`
- **Build Command:** `prisma generate && next build`
- **Install Command:** `npm install` (veya monorepo kök dizininde `npm install`)

## 2. Çevre Değişkenleri (Environment Variables)

Vercel Dashboard üzerinden aşağıdaki değişkenleri tanımlamanız gerekmektedir:

| Değişken Adı | Açıklama | Örnek Değer |
|--------------|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL Bağlantı URL (Transaction Mode) | `postgresql://...` |
| `DIRECT_URL` | Neon PostgreSQL Bağlantı URL (Session/Direct Mode) | `postgresql://...` |
| `NEXTAUTH_SECRET` | NextAuth için rastgele anahtar | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Uygulamanın tam URL'i | `https://projeniz.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Uygulamanın tam URL'i | `https://projeniz.vercel.app` |

### Opsiyonel Değişkenler (Kullanılıyorsa)
- `RESEND_API_KEY`: E-posta gönderimi için.
- `CLOUDINARY_URL`: Dosya yüklemeleri için.

## 3. Prisma ve Veritabanı Yapılandırması

Proje **Neon** PostgreSQL kullanmaktadır. Prisma'nın Vercel üzerinde sorunsuz çalışması için:

1. `DATABASE_URL` olarak **Pooled Connection** (Transaction mode) kullanın.
2. `DIRECT_URL` olarak **Direct Connection** (Session mode) kullanın (Migrate işlemleri için gereklidir).
3. `prisma generate` komutunun `build` adımından önce çalıştığından emin olun (Zaten `vercel.json` içinde tanımlanmıştır).

## 4. Canlıya Alma Adımları

1. Kodlarınızı GitHub reposuna yükleyin.
2. Vercel Dashboard'da "Import Project" diyerek repoyu seçin.
3. Çevre değişkenlerini girin.
4. "Deploy" butonuna basın.

## 5. Doğrulama (Post-Deployment)

- Sisteme giriş yapabildiğinizi doğrulayın.
- Veritabanı işlemlerinin (İş oluşturma, profil güncelleme) çalıştığını kontrol edin.
- Webhook'ların (eğer tanımlıysa) hedeflerine ulaştığını loglardan inceleyin.
