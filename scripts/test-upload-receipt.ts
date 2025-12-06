
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api';
const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Testing Expense Receipt Upload...');

    // 1. Login as Worker
    console.log('🔑 Logging in as Worker...');
    const loginRes = await fetch(`${API_URL}/mobile/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'ahah@montaj.com',
            password: 'ahh123'
        })
    });

    if (!loginRes.ok) {
        console.error('❌ Login failed:', await loginRes.text());
        return;
    }
    const token = (await loginRes.json()).token;

    // 2. Get a Job
    const jobsRes = await fetch(`${API_URL}/worker/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const jobs = await jobsRes.json();
    const job = jobs[0];

    if (!job) {
        console.error('❌ No jobs found for worker.');
        return;
    }
    console.log(`📌 Using Job: ${job.title} (${job.id})`);

    // 3. Create a dummy image file
    const dummyImagePath = path.join(__dirname, 'test-receipt.txt');
    fs.writeFileSync(dummyImagePath, 'This is a dummy receipt image content.');

    // 4. Create FormData
    const formData = new FormData();
    formData.append('jobId', job.id);
    formData.append('amount', '150.75');
    formData.append('currency', 'TRY');
    formData.append('category', 'Yemek');
    formData.append('description', 'Test Receipt Upload');
    formData.append('date', new Date().toISOString());

    const fileBlob = new Blob([fs.readFileSync(dummyImagePath)], { type: 'text/plain' });
    formData.append('receipt', fileBlob, 'test-receipt.txt');

    // 5. Send Request
    console.log('📤 Sending Multipart Request...');
    const res = await fetch(`${API_URL}/worker/costs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Content-Type header is automatically set by fetch for FormData
        },
        body: formData
    });

    if (res.ok) {
        const cost = await res.json();
        console.log('✅ Expense created successfully:', cost);
        console.log('   Receipt URL:', cost.receiptUrl);
    } else {
        console.error('❌ Expense creation failed:', await res.text());
    }

    // Cleanup
    fs.unlinkSync(dummyImagePath);
}

main().catch(console.error);
