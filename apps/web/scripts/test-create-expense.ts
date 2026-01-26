import { PrismaClient } from '@prisma/client';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TEST_WORKER_PASSWORD = process.env.TEST_WORKER_PASSWORD;

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Testing Expense Creation...');

    // 1. Login as Admin to create a worker and job
    console.log('🔑 Logging in as Admin...');
    const loginRes = await fetch(`${API_URL}/mobile/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@montaj.com',
            password: ADMIN_PASSWORD
        })
    });

    if (!loginRes.ok) {
        console.error('❌ Admin Login failed:', await loginRes.text());
        return;
    }
    const adminToken = (await loginRes.json()).token;

    // 2. Create a Worker
    console.log('👤 Creating/Finding Worker...');
    const workerEmail = `worker_${Date.now()}@test.com`;
    const createWorkerRes = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            name: 'Test Worker',
            email: workerEmail,
            role: 'WORKER',
            password: TEST_WORKER_PASSWORD
        })
    });

    let worker;
    if (createWorkerRes.ok) {
        worker = await createWorkerRes.json();
    } else {
        console.error('❌ Worker creation failed:', await createWorkerRes.text());
        return;
    }

    // 3. Create a Job (if not exists)
    console.log('🏗️ Creating Job...');
    // We need a customer first
    const customersRes = await fetch(`${API_URL}/admin/customers`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const customers = await customersRes.json();
    const customerId = customers[0]?.id;

    if (!customerId) {
        console.log('Creating customer...');
    }

    // Create a job assigned to this worker
    const jobRes = await fetch(`${API_URL}/admin/jobs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            title: 'Test Job for Expense',
            customerId: customerId || 'cmis3pt0r0000cjgvkuflgf89',
            priority: 'MEDIUM',
            steps: []
        })
    });

    let job;
    if (jobRes.ok) {
        job = await jobRes.json();
    } else {
        console.error('❌ Job creation failed:', await jobRes.text());
        // Try to fetch existing jobs
        const jobsRes = await fetch(`${API_URL}/admin/jobs`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const jobs = await jobsRes.json();
        job = jobs[0];
    }

    if (!job) {
        console.error('❌ No job available to test.');
        return;
    }

    // 4. Login as Worker
    console.log('🔑 Logging in as Worker...');
    const workerLoginRes = await fetch(`${API_URL}/mobile/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: workerEmail,
            password: TEST_WORKER_PASSWORD
        })
    });
    const workerToken = (await workerLoginRes.json()).token;

    // 5. Try to Create Expense (Simulating Mobile App Payload)
    console.log('💸 Creating Expense...');

    const payload = {
        jobId: job.id,
        amount: 100.50,
        currency: 'TRY',
        category: 'Yemek',
        description: 'Lunch - Burger King',
        date: new Date().toISOString()
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    const expenseRes = await fetch(`${API_URL}/worker/costs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${workerToken}`
        },
        body: JSON.stringify(payload)
    });

    if (expenseRes.ok) {
        console.log('✅ Expense created successfully:', await expenseRes.json());
    } else {
        console.error('❌ Expense creation failed:', await expenseRes.text());
    }
}

main().catch(console.error);