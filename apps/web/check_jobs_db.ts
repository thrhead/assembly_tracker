import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const jobsCount = await prisma.job.count()
    console.log('Total jobs:', jobsCount)

    const latestJobs = await prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
            include: { user: { select: { name: true } } }
        }
      }
    })
    console.log('Latest 5 jobs:', JSON.stringify(latestJobs, null, 2))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
