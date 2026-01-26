
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJobs() {
    try {
        console.log('Fetching jobs to debug...');
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                customer: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                assignments: {
                    include: {
                        team: true,
                        worker: {
                            select: { name: true }
                        }
                    }
                },
                _count: {
                    select: {
                        steps: true
                    }
                }
            }
        });
        console.log(`Success! Found ${jobs.length} jobs.`);
        if (jobs.length > 0) {
            console.log('Sample job:', JSON.stringify(jobs[0], null, 2));
        }
    } catch (error) {
        console.error('CRITICAL ERROR during fetch:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkJobs();
