
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking Jobs in DB...');
    try {
        const jobs = await prisma.job.findMany({
            include: {
                assignments: true,
                steps: true
            }
        });

        console.log(`Found ${jobs.length} jobs.`);
        jobs.forEach(j => {
            console.log(`- Job: ${j.title} (Status: ${j.status})`);
            console.log(`  Assignments: ${j.assignments.length}`);
        });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
