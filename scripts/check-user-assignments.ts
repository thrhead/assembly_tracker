
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'ahah@montaj.com';
    console.log(`🔍 Checking assignments for ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            assignedJobs: {
                include: {
                    job: true
                }
            },
            teamMember: {
                include: {
                    team: {
                        include: {
                            assignments: {
                                include: {
                                    job: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!user) {
        console.error('❌ User not found!');
        return;
    }

    console.log('👤 User ID:', user.id);
    console.log('📋 Direct Assignments:', user.assignedJobs.length);
    user.assignedJobs.forEach(a => console.log(`   - Job: ${a.job.title} (${a.job.id})`));

    console.log('👥 Team Memberships:', user.teamMember.length);
    user.teamMember.forEach(tm => {
        console.log(`   - Team: ${tm.team.name} (${tm.team.id})`);
        console.log(`     - Team Assignments: ${tm.team.assignments.length}`);
        tm.team.assignments.forEach(a => console.log(`       - Job: ${a.job.title} (${a.job.id})`));
    });

    if (user.assignedJobs.length === 0 && user.teamMember.every(tm => tm.team.assignments.length === 0)) {
        console.log('⚠️ User has NO active job assignments.');
    } else {
        console.log('✅ User has assignments.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
