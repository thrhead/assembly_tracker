
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkJobs() {
    console.log('--- JOB CHECK ---')
    const count = await prisma.job.count()
    console.log(`Total Jobs: ${count}`)

    const jobs = await prisma.job.findMany({
        take: 5,
        orderBy: { scheduledDate: 'desc' },
        select: {
            id: true,
            title: true,
            scheduledDate: true,
            status: true
        }
    })

    console.log('Recent 5 Jobs:')
    console.table(jobs)
    console.log('--- END ---')
}

checkJobs()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
