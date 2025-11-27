
import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting Substep Photo Test...')

    // 1. Find a worker user
    const worker = await prisma.user.findFirst({
        where: { role: 'WORKER' }
    })

    if (!worker) {
        console.error('No worker found')
        return
    }
    console.log('Worker found:', worker.email)

    // 2. Find a job assigned to this worker
    const assignment = await prisma.jobAssignment.findFirst({
        where: { workerId: worker.id },
        include: { job: true }
    })

    if (!assignment) {
        console.error('No job assignment found for worker')
        return
    }

    const jobId = assignment.jobId
    console.log('Job found:', jobId)

    // 3. Get Job Details (Simulate API logic)
    const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
            steps: {
                include: {
                    subSteps: {
                        include: {
                            photos: true // Check if this relation works
                        }
                    }
                }
            }
        }
    })

    if (!job) {
        console.error('Job not found in DB')
        return
    }

    console.log('Job Steps count:', job.steps.length)
    if (job.steps.length > 0) {
        const firstStep = job.steps[0]
        console.log('First Step Substeps count:', firstStep.subSteps.length)

        if (firstStep.subSteps.length > 0) {
            const firstSubstep = firstStep.subSteps[0]
            console.log('First Substep Photos:', firstSubstep.photos)
        } else {
            console.log('No substeps in first step, creating one for test...')
            // Create a dummy substep if needed, or just warn
        }
    }

    // 4. Simulate Photo Upload to Substep (Direct DB for now to check schema)
    // We want to see if we can link a photo to a substep
    if (job.steps.length > 0 && job.steps[0].subSteps.length > 0) {
        const step = job.steps[0]
        const subStep = step.subSteps[0]

        console.log(`Attempting to add photo to Substep ${subStep.id} in Step ${step.id}`)

        try {
            const photo = await prisma.stepPhoto.create({
                data: {
                    stepId: step.id,
                    subStepId: subStep.id,
                    url: 'http://test-url.com/photo.jpg',
                    uploadedById: worker.id
                }
            })
            console.log('Photo created successfully:', photo)
        } catch (e) {
            console.error('Error creating photo:', e)
        }
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
