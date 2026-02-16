import { PrismaClient } from '@prisma/client';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

async function main() {
    console.log('🔄 Testing Worker Login...');

    console.log(`🔑 Attempting login for ${TEST_EMAIL}...`);

    try {
        const loginRes = await fetch(`${API_URL}/mobile/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            })
        });

        if (loginRes.ok) {
            const data = await loginRes.json();
            console.log('✅ Login successful!');
            console.log('   Token:', data.token ? 'Present' : 'Missing');
            console.log('   User:', data.user);
        } else {
            console.error('❌ Login failed!');
            console.error('   Status:', loginRes.status);
            console.error('   Body:', await loginRes.text());
        }
    } catch (error) {
        console.error('❌ Network or Server Error:', error);
    }
}

main();