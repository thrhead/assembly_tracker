import { prisma } from "@/lib/db";

async function verifyCustomerFlow() {
  console.log("🚀 Müşteri Portalı Akış Testi Başlatılıyor...");

  try {
    // 1. Kurulum: Test Müşterisi ve Kullanıcısı Oluştur
    console.log("👤 Test müşterisi oluşturuluyor...");
    const email = `test.customer.${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: "mock_hash",
        role: "CUSTOMER",
        name: "Test Customer"
      }
    });

    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        company: "Test Corp",
        address: "123 Test St"
      }
    });

    // 2. Kurulum: Tamamlanmış İş Oluştur
    console.log("🛠️ Tamamlanmış iş oluşturuluyor...");
    const job = await prisma.job.create({
      data: {
        title: "Test Montaj İşi",
        status: "COMPLETED",
        customerId: customer.id,
        creatorId: user.id, // Basitlik için kendi oluşturmuş gibi
        location: "Test Konumu"
      }
    });

    // 3. Onay API Simülasyonu
    console.log("✅ Onay işlemi simüle ediliyor...");
    
    // İşlemi gerçekleştir
    const updatedJob = await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'ACCEPTED',
          acceptanceStatus: 'APPROVED',
          acceptedAt: new Date(),
          acceptedById: user.id
        }
    });

    // Onay kaydı oluştur
    await prisma.approval.create({
        data: {
          jobId: job.id,
          requesterId: job.creatorId,
          approverId: user.id,
          status: 'APPROVED',
          type: 'CUSTOMER_FINAL_APPROVAL',
          notes: 'Otomatik Test Onayı'
        }
    });

    // 4. Son Durum Kontrolü
    console.log("🔍 Son durum kontrol ediliyor...");
    const finalJob = await prisma.job.findUnique({
        where: { id: job.id },
        include: { approvals: true }
    });

    if (finalJob?.status !== 'ACCEPTED') throw new Error("İş durumu uyuşmazlığı! Beklenen: ACCEPTED");
    if (finalJob?.acceptanceStatus !== 'APPROVED') throw new Error("Kabul durumu uyuşmazlığı!");
    if (finalJob.approvals.length === 0) throw new Error("Onay kaydı bulunamadı!");

    console.log("🎉 BAŞARILI: Müşteri Portalı akışı doğrulandı!");

    // Temizlik
    await prisma.job.delete({ where: { id: job.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
    await prisma.user.delete({ where: { id: user.id } });

  } catch (error) {
    console.error("❌ HATA:", error);
    process.exit(1);
  }
}

verifyCustomerFlow();
