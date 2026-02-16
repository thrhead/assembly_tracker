

const BASE_URL = 'http://localhost:3000';

async function testCustomerCreate() {
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const loginResponse = await fetch(`${BASE_URL}/api/mobile/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@montaj.com',
                password: process.env.ADMIN_PASSWORD
            })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            console.error('Login failed:', loginData);
            return;
        }

        console.log('Login successful. Token:', loginData.token ? 'Received' : 'Missing');
        const token = loginData.token;

        // 2. Create Customer
        console.log('Creating Customer...');
        const customerData = {
            companyName: 'Test Company ' + Date.now(),
            contactPerson: 'Test Person',
            email: `test${Date.now()}@example.com`,
            phone: '5551234567',
            address: 'Test Address'
        };

        const createResponse = await fetch(`${BASE_URL}/api/admin/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(customerData)
        });

        const createData = await createResponse.json();

        if (!createResponse.ok) {
            console.error('Customer creation failed:', createResponse.status, createData);
        } else {
            console.log('Customer created successfully:', createData);
        }

    } catch (error) {
        console.error('Test error:', error);
    }
}

testCustomerCreate();
