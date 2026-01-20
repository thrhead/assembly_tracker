import { prisma } from '../lib/db'

async function checkPending() {
    console.log('Checking for pending approvals...')

    const pendingSubsteps = await prisma.jobSubStep.findMany({
        where: { approvalStatus: 'PENDING' },
        include: {
            step: {
                include: {
                    job: {
                        select: { id: true, title: true }
                    }
                }
            }
        }
    })

    console.log(`Found ${pendingSubsteps.length} pending substeps.`)
    pendingSubsteps.forEach(s => {
        console.log(`- Substep ${s.id} (Job: ${s.step.job.title})`)
    })

    const pendingCosts = await prisma.cost.findMany({
        where: { status: 'PENDING' },
        include: {
            job: {
                select: { id: true, title: true }
            }
        }
    })

    console.log(`Found ${pendingCosts.length} pending costs.`)
    pendingCosts.forEach(c => {
        console.log(`- Cost ${c.id} (Job: ${c.job.title})`)
    })
}

checkPending()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
