
import { prisma } from './lib/db';

async function main() {
    console.log('Starting Team Deletion Safety Check...');

    try {
        // 1. Create a dummy team
        const team = await prisma.team.create({
            data: {
                name: 'Test Delete Team',
                description: 'Temporary team for testing deletion safety',
                isActive: true
            }
        });
        console.log('1. Created temporary team:', team.id);

        // 2. Create a dummy job
        const customer = await prisma.customer.findFirst();
        const user = await prisma.user.findFirst();

        if (!customer || !user) {
            console.error('No customer or user found to create job');
            return;
        }

        const job = await prisma.job.create({
            data: {
                title: 'Test Delete Job',
                customerId: customer.id,
                creatorId: user.id,
                status: 'PENDING'
            }
        });
        console.log('2. Created temporary job:', job.id);

        // 3. Assign team to job
        const assignment = await prisma.jobAssignment.create({
            data: {
                jobId: job.id,
                teamId: team.id
            }
        });
        console.log('3. Assigned team to job:', assignment.id);

        // 4. Verify assignment exists in DB
        const teamWithAssignments = await prisma.team.findUnique({
            where: { id: team.id },
            include: { assignments: true }
        });
        console.log('4. Team assignments count in DB:', teamWithAssignments?.assignments.length);

        if (!teamWithAssignments || teamWithAssignments.assignments.length === 0) {
            console.error('ERROR: Assignment not found on team relation!');
        } else {
            console.log('SUCCESS: Relation verified.');
        }

        // 5. Cleanup
        console.log('Cleaning up...');
        await prisma.jobAssignment.delete({ where: { id: assignment.id } });
        await prisma.job.delete({ where: { id: job.id } });
        await prisma.team.delete({ where: { id: team.id } });
        console.log('Cleanup complete.');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

main();
