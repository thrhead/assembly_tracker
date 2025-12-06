
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3000/api';
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
            password: 'admin123'
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
            password: 'password123'
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
    let customerId = customers[0]?.id;

    if (!customerId) {
        console.log('Creating customer...');
        // Create customer logic omitted for brevity, assuming seed data exists or we can create one
        // For now, let's assume there is at least one customer or create a dummy one if needed.
        // Actually, let's just use the seed data's customer if possible.
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
            customerId: customerId || 'cmis3pt0r0000cjgvkuflgf89', // Fallback to a likely ID or handle error
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
            password: 'password123'
        })
    });
    const workerToken = (await workerLoginRes.json()).token;

    // 5. Try to Create Expense (Simulating Mobile App Payload)
    console.log('💸 Creating Expense...');

    // Payload exactly as the mobile app would send it after my fix
    const payload = {
        jobId: job.id,
        amount: 100.50, // parsed float
        currency: 'TRY',
        category: 'Yemek',
        description: 'Lunch - Burger King', // combined description
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
