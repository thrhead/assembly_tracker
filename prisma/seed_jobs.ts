
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding specific jobs for Mobile Sync...')

    // Find users
    const tahir = await prisma.user.findUnique({ where: { email: 'tahir@montaj.com' } })
    const ali = await prisma.user.findUnique({ where: { email: 'ali@montaj.com' } })
    const manager = await prisma.user.findUnique({ where: { email: 'manager@montaj.com' } }) || tahir // Fallback

    if (!tahir || !ali) {
        console.error('❌ Users Tahir or Ali not found. Please run initial seed first.')
        return
    }

    // Create Customer if not exists
    let customerUser = await prisma.user.findUnique({ where: { email: 'sync_customer@test.com' } })
    if (!customerUser) {
        customerUser = await prisma.user.create({
            data: {
                email: 'sync_customer@test.com',
                name: 'Sync Test Müşterisi',
                role: 'CUSTOMER',
                passwordHash: 'dummy',
                isActive: true
            }
        })
        await prisma.customer.create({
            data: {
                userId: customerUser.id,
                company: 'Sync Test A.Ş.',
                address: 'Büyükdere Cad. No:199, Levent',
                taxId: '9988776655'
            }
        })
    }

    const customer = await prisma.customer.findUnique({ where: { userId: customerUser.id } })

    // 1. Job: In Progress (Assigned to Ali)
    const job1 = await prisma.job.create({
        data: {
            title: 'Levent Ofis Yenileme',
            description: 'Ofis mobilyalarının sökülmesi ve yenilerinin montajı.',
            location: 'Levent, İstanbul',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            scheduledDate: new Date(),
            customerId: customer.id,
            creatorId: manager.id,
            assignments: {
                create: { workerId: ali.id, assignedAt: new Date() }
            },
            steps: {
                create: [
                    { title: 'Eski Mobilyaların Sökümü', order: 1, isCompleted: true },
                    { title: 'Yeni Masaların Montajı', order: 2, isCompleted: false },
                    { title: 'Temizlik', order: 3, isCompleted: false }
                ]
            }
        }
    })
    console.log(`✅ Created Job: ${job1.title}`)

    // 2. Job: Pending (Assigned to Tahir)
    const job2 = await prisma.job.create({
        data: {
            title: 'Kadıköy Mağaza Kurulumu',
            description: 'Raf sistemlerinin montajı ve ürün yerleşimi.',
            location: 'Kadıköy, İstanbul',
            status: 'PENDING',
            priority: 'MEDIUM',
            scheduledDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
            customerId: customer.id,
            creatorId: manager.id,
            assignments: {
                create: { workerId: tahir.id, assignedAt: new Date() }
            },
            steps: {
                create: [
                    { title: 'Raf Montajı', order: 1 },
                    { title: 'Ürün Yerleşimi', order: 2 }
                ]
            }
        }
    })
    console.log(`✅ Created Job: ${job2.title}`)

    console.log('🎉 Jobs seeded successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
