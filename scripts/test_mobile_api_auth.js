
const API_URL = 'http://localhost:3000/api/admin/templates';

async function main() {
    console.log('Testing Mobile API Access...');
    try {
        console.log('Attemping fetch without token...');
        const response = await fetch(API_URL);
        console.log(`Response Status: ${response.status} ${response.statusText}`);

        if (response.status === 200) {
            const data = await response.json();
            console.log(`✅ Success! Data length: ${Array.isArray(data) ? data.length : 'Not an array'}`);
        } else if (response.status === 401) {
            console.log('✅ Endpoint reachable but requires auth (Expected for unauthenticated request)');
        } else {
            console.log('❌ Unexpected status');
        }
    } catch (error) {
        console.log('Fetch error details:', error);
        console.error('Fetch error message:', error.message);
    }
}

main();
