const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCalendarQuery() {
    const startDate = new Date('2025-10-01T00:00:00.000Z');
    const endDate = new Date('2026-02-01T00:00:00.000Z');

    console.log('Testing Prisma Query...');

    try {
        const jobs = await prisma.job.findMany({
            where: {
                OR: [
                    { scheduledDate: { gte: startDate, lte: endDate } },
                    { scheduledEndDate: { gte: startDate, lte: endDate } },
                    { scheduledDate: { lte: startDate }, scheduledEndDate: { gte: endDate } }
                ]
            },
            include: {
                customer: { select: { company: true } },
                assignments: { include: { team: true, worker: true } }
            }
        })
        console.log('Query Successful!');
        console.log(`Found ${jobs.length} jobs.`);
        if (jobs.length > 0) {
            console.log('Sample Job:', JSON.stringify(jobs[0], null, 2));

            // Test the mapping logic too
            const mapped = jobs.map(job => {
                const companyName = job.customer?.company || 'Müşteri Yok';
                return {
                    id: job.id,
                    title: `${companyName} - ${job.title}`,
                    // Check if assignments map works
                    assignments: job.assignments?.map(a => a.id)
                }
            });
            console.log('Mapping Successful!');
        }
    } catch (error) {
        console.error('Query FAILED:', error);
    }
}

checkCalendarQuery()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
