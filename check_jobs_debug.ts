
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJobs() {
    const startDate = new Date('2025-12-01T00:00:00.000Z');
    const endDate = new Date('2025-12-31T23:59:59.999Z');

    console.log('Checking jobs between:', startDate, 'and', endDate);

    const jobs = await prisma.job.findMany({
        where: {
            scheduledDate: {
                gte: startDate,
                lte: endDate
            }
        },
        select: {
            id: true,
            title: true,
            scheduledDate: true,
            scheduledEndDate: true,
            status: true
        }
    });

    console.log('Found jobs:', jobs.length);
    if (jobs.length > 0) {
        console.log('Sample job:', jobs[0]);
    }
}

checkJobs()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
