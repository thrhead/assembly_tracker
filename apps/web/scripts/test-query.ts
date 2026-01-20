
import { prisma } from '../lib/db'

async function main() {
    console.log('🔍 Testing Worker Job Query...')

    // 1. Get Worker
    const worker = await prisma.user.findUnique({
        where: { email: 'worker@montaj.com' }
    })

    if (!worker) {
        console.error('❌ Worker not found!')
        return
    }
    console.log('👤 Worker found:', { id: worker.id, email: worker.email })

    // 2. Check Assignments
    const assignments = await prisma.jobAssignment.findMany({
        where: { workerId: worker.id },
        include: { job: true }
    })
    console.log('📋 Assignments found:', assignments.length)
    assignments.forEach(a => console.log(`   - Job: ${a.job.title} (${a.job.status})`))

    // 3. Run the exact query from the API
    const where = {
        assignments: {
            some: {
                OR: [
                    { workerId: worker.id },
                    { team: { members: { some: { userId: worker.id } } } }
                ]
            }
        }
    }

    const jobs = await prisma.job.findMany({
        where,
        include: {
            assignments: true
        }
    })

    console.log('🚀 API Query Result:', jobs.length, 'jobs')
    jobs.forEach(j => console.log(`   - ${j.title} (ID: ${j.id})`))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
