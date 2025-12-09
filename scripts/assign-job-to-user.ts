
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'ahah@montaj.com';
    console.log(`🔍 Finding user ${email}...`);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.error('❌ User not found!');
        return;
    }

    console.log('🔍 Finding a job to assign...');
    const job = await prisma.job.findFirst({
        where: { status: { not: 'COMPLETED' } }
    });

    if (!job) {
        console.error('❌ No active jobs found to assign!');
        // Create a job if none exists

        return;
    }

    console.log(`📌 Assigning job "${job.title}" (${job.id}) to user...`);

    await prisma.jobAssignment.create({
        data: {
            jobId: job.id,
            workerId: user.id
        }
    });

    console.log('✅ Assignment created successfully!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
