
import { loginSchema } from '@/lib/validations'

async function main() {
    console.log('Testing Mobile Login...')

    const response = await fetch('http://localhost:3000/api/mobile/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'worker@montaj.com',
            password: 'worker123'
        })
    })

    console.log('Status:', response.status)
    const data = await response.json()
    console.log('Response:', data)
}

main().catch(console.error)
