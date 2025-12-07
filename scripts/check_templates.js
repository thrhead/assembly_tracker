
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking Job Templates...');
    const templates = await prisma.jobTemplate.findMany({
        include: { steps: true }
    });

    if (templates.length === 0) {
        console.log('❌ NO TEMPLATES FOUND IN DATABASE');
    } else {
        console.log(`✅ Found ${templates.length} templates:`);
        templates.forEach(t => {
            console.log(`- ${t.name} (Steps: ${t.steps.length})`);
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
