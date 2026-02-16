import { Resend } from 'resend'

// Initialize Resend client
// Initialize Resend client safely
const resendApiKey = process.env.RESEND_API_KEY || 're_123456789'; // Fallback to prevent crash on init
const resend = new Resend(resendApiKey)

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// Email sender function with error handling
async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Email sending failed:', error)
      return { success: false, error }
    }

    console.log('Email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}

// Job Completed Email
export async function sendJobCompletedEmail(
  to: string,
  jobData: {
    id: string
    title: string
    customerName: string
    completedDate: Date
    teamName: string
    completedBy: string
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16A34A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #16A34A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ İş Tamamlandı</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p><strong>${jobData.title}</strong> işi başarıyla tamamlandı!</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">İş:</span> ${jobData.title}
            </div>
            <div class="detail-row">
              <span class="detail-label">Müşteri:</span> ${jobData.customerName}
            </div>
            <div class="detail-row">
              <span class="detail-label">Ekip:</span> ${jobData.teamName}
            </div>
            <div class="detail-row">
              <span class="detail-label">Tamamlayan:</span> ${jobData.completedBy}
            </div>
            <div class="detail-row">
              <span class="detail-label">Tamamlanma Tarihi:</span> ${new Date(jobData.completedDate).toLocaleDateString('tr-TR')}
            </div>
          </div>

          <center>
            <a href="${APP_URL}/admin/jobs/${jobData.id}" class="button">İşi Görüntüle</a>
          </center>

          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            Bu otomatik bir bildirimdir. İşin tüm detaylarını yukarıdaki bağlantıdan görebilirsiniz.
          </p>
        </div>
        <div class="footer">
          <p>Montaj Takip Sistemi © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail(to, `✅ İş Tamamlandı - ${jobData.title}`, html)
}

// Cost Approval Request Email
export async function sendCostApprovalEmail(
  to: string,
  costData: {
    id: string
    amount: number
    category: string
    description: string
    jobTitle: string
    submittedBy: string
    date: Date
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px; }
        .button-approve { background: #16A34A; }
        .button-reject { background: #DC2626; }
        .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .amount { font-size: 24px; font-weight: bold; color: #F59E0B; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Yeni Masraf Onayı Bekliyor</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p>Yeni bir masraf onayınızı bekliyor.</p>
          
          <center>
            <div class="amount">₺${costData.amount.toFixed(2)}</div>
          </center>

          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Kategori:</span> ${costData.category}
            </div>
            <div class="detail-row">
              <span class="detail-label">İş:</span> ${costData.jobTitle}
            </div>
            <div class="detail-row">
              <span class="detail-label">Açıklama:</span> ${costData.description}
            </div>
            <div class="detail-row">
              <span class="detail-label">Gönderen:</span> ${costData.submittedBy}
            </div>
            <div class="detail-row">
              <span class="detail-label">Tarih:</span> ${new Date(costData.date).toLocaleDateString('tr-TR')}
            </div>
          </div>

          <center>
            <a href="${APP_URL}/admin" class="button button-approve">Masrafları Görüntüle</a>
          </center>

          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            Admin panelinden masrafı onaylayabilir veya reddedebilirsiniz.
          </p>
        </div>
        <div class="footer">
          <p>Montaj Takip Sistemi © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail(to, `💰 Yeni Masraf Onayı - ₺${costData.amount}`, html)
}

// Cost Status Update Email
export async function sendCostStatusEmail(
  to: string,
  costData: {
    id: string
    amount: number
    category: string
    description: string
    jobTitle: string
    status: 'APPROVED' | 'REJECTED'
  }
) {
  const isApproved = costData.status === 'APPROVED'
  const statusColor = isApproved ? '#16A34A' : '#DC2626'
  const statusIcon = isApproved ? '✅' : '❌'
  const statusText = isApproved ? 'Onaylandı' : 'Reddedildi'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: ${statusColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusIcon} Masraf ${statusText}</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p>₺${costData.amount.toFixed(2)} tutarındaki masrafınız <strong>${statusText.toLowerCase()}</strong>.</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Tutar:</span> ₺${costData.amount.toFixed(2)}
            </div>
            <div class="detail-row">
              <span class="detail-label">Kategori:</span> ${costData.category}
            </div>
            <div class="detail-row">
              <span class="detail-label">İş:</span> ${costData.jobTitle}
            </div>
            <div class="detail-row">
              <span class="detail-label">Açıklama:</span> ${costData.description}
            </div>
            <div class="detail-row">
              <span class="detail-label">Durum:</span> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
            </div>
          </div>

          ${isApproved ? `
            <p style="color: #16A34A; font-weight: bold;">
              Masrafınız onaylandı. Teşekkürler!
            </p>
          ` : `
            <p style="color: #DC2626;">
              Masrafınız reddedildi. Lütfen yöneticinizle iletişime geçin.
            </p>
          `}
        </div>
        <div class="footer">
          <p>Montaj Takip Sistemi © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail(to, `${statusIcon} Masraf ${statusText} - ₺${costData.amount}`, html)
}

// Job Assignment Email
export async function sendJobAssignmentEmail(
  to: string,
  jobData: {
    id: string
    title: string
    customerName: string
    scheduledDate: Date
    teamName: string
    location: string
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Yeni İş Ataması</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p>Size yeni bir iş atandı!</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">İş:</span> ${jobData.title}
            </div>
            <div class="detail-row">
              <span class="detail-label">Müşteri:</span> ${jobData.customerName}
            </div>
            <div class="detail-row">
              <span class="detail-label">Ekip:</span> ${jobData.teamName}
            </div>
            <div class="detail-row">
              <span class="detail-label">Lokasyon:</span> ${jobData.location}
            </div>
            <div class="detail-row">
              <span class="detail-label">Planlanan Tarih:</span> ${new Date(jobData.scheduledDate).toLocaleDateString('tr-TR')}
            </div>
          </div>

          <center>
            <a href="${APP_URL}/worker/jobs/${jobData.id}" class="button">İşi Görüntüle</a>
          </center>

          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            İş detaylarını yukarıdaki bağlantıdan görüntüleyebilir ve çalışmaya başlayabilirsiniz.
          </p>
        </div>
        <div class="footer">
          <p>Montaj Takip Sistemi © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail(to, `📋 Yeni İş Ataması - ${jobData.title}`, html)
}
