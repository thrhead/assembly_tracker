
const BASE_URL = 'http://localhost:3000';

async function testUserList() {
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const loginResponse = await fetch(`${BASE_URL}/api/mobile/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@montaj.com',
                password: 'admin123'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            console.error('Login failed:', loginData);
            return;
        }

        console.log('Login successful. Token:', loginData.token ? 'Received' : 'Missing');
        const token = loginData.token;

        // 2. List Users
        console.log('Listing Users...');
        const listResponse = await fetch(`${BASE_URL}/api/admin/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const listData = await listResponse.json();

        if (!listResponse.ok) {
            console.error('User listing failed:', listResponse.status, listData);
        } else {
            console.log('User listing successful. Count:', listData.length);
        }

    } catch (error) {
        console.error('Test error:', error);
    }
}

testUserList();
