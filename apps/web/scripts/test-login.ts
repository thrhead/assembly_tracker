
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3000/api';
const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Testing Worker Login...');

    const email = 'ahah@montaj.com';
    const password = 'ahh123'; // Trying the password mentioned in previous logs

    console.log(`🔑 Attempting login for ${email} with password '${password}'...`);

    try {
        const loginRes = await fetch(`${API_URL}/mobile/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password
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
