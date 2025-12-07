
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
    console.log('--- DB KONTROLÜ BAŞLIYOR ---')

    // 1. İşleri Kontrol Et
    const jobs = await prisma.job.findMany({
        take: 5,
        include: {
            steps: {
                include: {
                    subSteps: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    console.log(`Toplam bulunan son iş sayısı: ${jobs.length}`)

    if (jobs.length === 0) {
        console.log('HİÇ İŞ BULUNAMADI! Veritabanı boş.')
    } else {
        jobs.forEach(job => {
            console.log(`\nİş ID: ${job.id}`)
            console.log(`Başlık: ${job.title}`)
            console.log(`Tarih: ${job.scheduledDate}`)
            console.log(`Adım Sayısı: ${job.steps.length}`)

            if (job.steps.length > 0) {
                job.steps.forEach(step => {
                    console.log(`  - Adım: ${step.title} (Alt adım: ${step.subSteps.length})`)
                })
            } else {
                console.log('  BU İŞİN HİÇ ADIMI YOK!')
            }
        })
    }

    console.log('\n--- KULLANICI ROLLERİ ---')
    const users = await prisma.user.findMany({
        select: { email: true, role: true }
    })
    console.table(users)

    console.log('--- DB KONTROLÜ BİTTİ ---')
}

checkData()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
