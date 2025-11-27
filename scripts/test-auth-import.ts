
async function main() {
    console.log('Testing lib/auth import...')
    try {
        const auth = await import('../lib/auth')
        console.log('Import successful')
        console.log('Auth config:', auth.authConfig)
    } catch (error) {
        console.error('Import failed:', error)
    }
}

main()
