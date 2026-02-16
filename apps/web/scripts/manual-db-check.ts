import { prisma } from '../lib/db';
import 'dotenv/config';

// Ensure we are in a context where we can write to DB
async function testLogEndpoint() {
    console.log('Testing SystemLog table access...');
    try {
        const log = await prisma.systemLog.create({
            data: {
                level: 'INFO',
                message: 'MANUAL_TEST_LOG_' + new Date().toISOString(),
                platform: 'manual_script',
                createdAt: new Date()
            }
        });
        console.log('Successfully created log directly via Prisma:', log);

        // Verify via simple read
        const count = await prisma.systemLog.count();
        console.log(`Total logs in system_logs table: ${count}`);

    } catch (e) {
        console.error('Failed to create log directly:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testLogEndpoint();
