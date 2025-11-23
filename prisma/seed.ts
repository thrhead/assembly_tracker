import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (optional)
  try {
    await prisma.approval.deleteMany()
    await prisma.costTracking.deleteMany()
    await prisma.jobSubStep.deleteMany()
    await prisma.jobStep.deleteMany()
    await prisma.jobAssignment.deleteMany()
    await prisma.job.deleteMany()
    await prisma.teamMember.deleteMany()
    await prisma.team.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.user.deleteMany()
    console.log('✅ Cleared existing data')
  } catch (error) {
    console.warn('⚠️ Could not clear some data (might be empty or foreign key constraints), continuing...')
  }

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+90 555 123 4567',
      isActive: true,
    },
  })
  console.log('✅ Created admin user: admin@example.com / admin123')

  // Create Worker Users
  const workerPassword = await bcrypt.hash('worker123', 10)
  const worker1 = await prisma.user.create({
    data: {
      email: 'ali@example.com',
      name: 'Ali Usta',
      passwordHash: workerPassword,
      role: 'WORKER',
      phone: '+90 555 234 5678',
      isActive: true,
    },
  })

  const worker2 = await prisma.user.create({
    data: {
      email: 'mehmet@example.com',
      name: 'Mehmet Çelik',
      passwordHash: workerPassword,
      role: 'WORKER',
      phone: '+90 555 345 6789',
      isActive: true,
    },
  })
  console.log('✅ Created worker users')

  // Create Manager User
  const managerPassword = await bcrypt.hash('manager123', 10)
  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      name: 'Yönetici Ahmet',
      passwordHash: managerPassword,
      role: 'MANAGER',
      phone: '+90 555 456 7890',
      isActive: true,
    },
  })
  console.log('✅ Created manager user')

  // Create Customer
  const customerPassword = await bcrypt.hash('customer123', 10)
  const customerUser = await prisma.user.create({
    data: {
      email: 'musteri@example.com',
      name: 'Müşteri Firma',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      phone: '+90 555 567 8901',
      isActive: true,
      customerProfile: {
        create: {
          company: 'ABC Mobilya A.Ş.',
          address: 'Atatürk Cad. No:123, İstanbul',
          taxId: '1234567890',
          notes: 'VIP müşteri',
        },
      },
    },
  })
  console.log('✅ Created customer')

  // Create Team
  const team = await prisma.team.create({
    data: {
      name: 'Montaj Ekibi 1',
      description: 'Ana montaj ekibi',
      leadId: worker1.id,
      isActive: true,
      members: {
        create: [
          {
            userId: worker1.id,
            joinedAt: new Date('2024-01-01'),
          },
          {
            userId: worker2.id,
            joinedAt: new Date('2024-02-01'),
          },
        ],
      },
    },
  })
  console.log('✅ Created team')

  // Create Sample Jobs
  const customer = await prisma.customer.findFirst({
    where: { userId: customerUser.id },
  })

  if (customer) {
    const job1 = await prisma.job.create({
      data: {
        title: 'Ofis Mobilya Montajı',
        description: 'Yeni ofis için masa ve dolap montajı',
        customerId: customer.id,
        creatorId: admin.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        location: 'Levent, İstanbul',
        scheduledDate: new Date('2024-12-25T09:00:00'),
        scheduledEndDate: new Date('2024-12-25T17:00:00'),
        steps: {
          create: [
            {
              title: 'Malzeme Kontrolü',
              description: 'Tüm parçaların eksiksiz olduğunu kontrol et',
              order: 1,
              isCompleted: true,
              completedAt: new Date(),
              completedById: worker1.id,
            },
            {
              title: 'Masa Montajı',
              description: '5 adet ofis masası monte et',
              order: 2,
              isCompleted: false,
              subSteps: {
                create: [
                  {
                    title: 'Ayakları tak',
                    order: 1,
                    isCompleted: true,
                    completedAt: new Date(),
                  },
                  {
                    title: 'Tabla yerleştir',
                    order: 2,
                    isCompleted: false,
                  },
                ],
              },
            },
            {
              title: 'Dolap Montajı',
              description: '3 adet dolap monte et',
              order: 3,
              isCompleted: false,
            },
            {
              title: 'Son Kontrol',
              description: 'Tüm montajı kontrol et ve temizlik yap',
              order: 4,
              isCompleted: false,
            },
          ],
        },
        assignments: {
          create: {
            teamId: team.id,
            assignedAt: new Date(),
          },
        },
      },
    })

    const job2 = await prisma.job.create({
      data: {
        title: 'Mutfak Dolapları Montajı',
        description: 'Ev mutfağı için dolap sistemi',
        customerId: customer.id,
        creatorId: admin.id,
        status: 'PENDING',
        priority: 'MEDIUM',
        location: 'Kadıköy, İstanbul',
        scheduledDate: new Date('2024-12-28T10:00:00'),
        scheduledEndDate: new Date('2024-12-28T16:00:00'),
        steps: {
          create: [
            {
              title: 'Ölçüm ve Planlama',
              order: 1,
              isCompleted: false,
            },
            {
              title: 'Alt Dolap Montajı',
              order: 2,
              isCompleted: false,
            },
            {
              title: 'Üst Dolap Montajı',
              order: 3,
              isCompleted: false,
            },
            {
              title: 'Tezgah Yerleştirme',
              order: 4,
              isCompleted: false,
            },
          ],
        },
        assignments: {
          create: {
            teamId: team.id,
            assignedAt: new Date(),
          },
        },
      },
    })

    console.log('✅ Created sample jobs')

    // Create sample cost tracking
    const jobSteps = await prisma.jobStep.findMany({
      where: { jobId: job1.id },
    })

    if (jobSteps.length > 0) {
      await prisma.costTracking.create({
        data: {
          jobId: job1.id,
          category: 'MATERIAL',
          amount: 250.50,
          currency: 'TRY',
          description: 'Vida ve bağlantı malzemeleri',
          status: 'APPROVED',
          createdById: worker1.id,
          approvedById: admin.id,
        },
      })

      await prisma.costTracking.create({
        data: {
          jobId: job1.id,
          category: 'FOOD',
          amount: 150.00,
          currency: 'TRY',
          description: 'Öğle yemeği',
          status: 'PENDING',
          createdById: worker1.id,
        },
      })

      console.log('✅ Created sample costs')
    }
  }

  console.log('\n🎉 Seed completed successfully!\n')
  console.log('📝 Test Accounts:')
  console.log('   Admin:    admin@example.com / admin123')
  console.log('   Manager:  manager@example.com / manager123')
  console.log('   Worker:   ali@example.com / worker123')
  console.log('   Worker:   mehmet@example.com / worker123')
  console.log('   Customer: musteri@example.com / customer123')
  console.log('\n✨ You can now login and test the application!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
