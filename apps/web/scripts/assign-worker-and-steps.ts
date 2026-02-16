import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Get Worker and Team
  const worker = await prisma.user.findFirst({
    where: { email: 'worker@test.com' }
  })

  const team = await prisma.team.findFirst({
    where: { name: 'Klima Montaj Ekibi' }
  })

  if (!worker || !team) {
    console.error('Worker or Team not found')
    return
  }

  // 2. Assign Worker to Team
  try {
    await prisma.teamMember.create({
      data: {
        userId: worker.id,
        teamId: team.id
      }
    })
    console.log('Worker assigned to team')
  } catch (e) {
    console.log('Worker already in team or error:', e)
  }

  // 3. Get Job and Add Steps
  const job = await prisma.job.findFirst({
    where: { title: 'Klima Montajı - B Blok' }
  })

  if (job) {
    const steps = [
      { title: 'Keşif ve Ölçüm', order: 1 },
      { title: 'Malzeme Hazırlığı', order: 2 },
      { title: 'İç Ünite Montajı', order: 3 },
      { title: 'Dış Ünite Montajı', order: 4 },
      { title: 'Vakum ve Gaz Basımı', order: 5 },
      { title: 'Test ve Devreye Alma', order: 6 },
      { title: 'Müşteri Bilgilendirme', order: 7 },
    ]

    for (const step of steps) {
      await prisma.jobStep.create({
        data: {
          jobId: job.id,
          title: step.title,
          order: step.order,
          isCompleted: false
        }
      })
    }
    console.log('Job steps created')
  } else {
    console.error('Job not found')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
