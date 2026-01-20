import { loginSchema } from '../lib/validations';

async function testCostCreation() {
    const BASE_URL = 'http://localhost:3000';

    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/mobile/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'worker@montaj.com',
            password: 'worker123'
        })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful. Token:', token ? 'Received' : 'Missing');

    if (!token) return;

    // 2. Create Cost
    console.log('Creating cost...');
    const costRes = await fetch(`${BASE_URL}/api/worker/costs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            jobId: 'job1', // Assuming job1 exists from seed
            amount: 100,
            category: 'Yemek',
            description: 'Test cost from script',
            currency: 'TRY'
        })
    });

    if (costRes.ok) {
        console.log('Cost created successfully:', await costRes.json());
    } else {
        console.error('Cost creation failed:', costRes.status, await costRes.text());
    }
}

testCostCreation();
