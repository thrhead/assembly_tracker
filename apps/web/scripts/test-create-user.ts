
const API_URL = 'http://localhost:3000/api';

async function main() {
    console.log('🔄 Testing User Creation...');

    // 1. Login
    console.log('🔑 Logging in as Admin...');
    const loginRes = await fetch(`${API_URL}/auth/callback/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@assembly.com',
            password: process.env.ADMIN_PASSWORD,
            redirect: false,
            callbackUrl: '/'
        })
    });

    if (!loginRes.ok) {
        console.error('❌ Login failed:', await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token; // Assuming token is returned here based on AuthContext logic
    console.log('✅ Login successful. Token obtained.');

    // 2. Create User with empty password
    console.log('👤 Creating user with empty password...');
    const userData = {
        name: 'Test User',
        email: `testuser_${Date.now()}@example.com`,
        role: 'WORKER',
        password: '' // Simulating mobile app behavior
    };

    const createRes = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });

    let createdUser: any;
    if (createRes.ok) {
        createdUser = await createRes.json();
        console.log('✅ User created successfully:', createdUser);
    } else {
        console.error('❌ User creation failed:', await createRes.text());
        return;
    }

    // 3. List Users
    console.log('📋 Listing users...');
    const listRes = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (listRes.ok) {
        const users = await listRes.json();
        console.log(`✅ Fetched ${users.length} users.`);
    } else {
        console.error('❌ Failed to list users:', await listRes.text());
    }

    if (createdUser) {
        // 4. Update User
        console.log('📝 Updating user...');
        const updateRes = await fetch(`${API_URL}/admin/users/${createdUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Updated User Name',
                role: 'MANAGER'
            })
        });

        if (updateRes.ok) {
            const updatedUser = await updateRes.json();
            console.log('✅ User updated successfully:', updatedUser);
        } else {
            console.error('❌ User update failed:', await updateRes.text());
        }
    }
}

main().catch(console.error);
