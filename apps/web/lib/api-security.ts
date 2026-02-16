
import crypto from 'crypto'
import { prisma } from './db'

/**
 * Generates a cryptographically secure API key
 */
export function generateApiKey(): string {
    return `at_${crypto.randomBytes(24).toString('hex')}`
}

/**
 * Hashes an API key for storage
 */
export function hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Validates an API key and returns the associated key data if valid
 */
export async function validateApiKey(key: string, requiredScopes: string[] = []) {
    const hashedKey = hashApiKey(key)
    
    const apiKeyData = await prisma.apiKey.findUnique({
        where: { key: hashedKey, isActive: true },
        include: {
            user: {
                select: { id: true, name: true, role: true }
            }
        }
    })

    if (!apiKeyData) return null

    // Check scopes if required
    if (requiredScopes.length > 0) {
        const hasAllScopes = requiredScopes.every(scope => 
            apiKeyData.scopes.includes(scope) || apiKeyData.scopes.includes('*')
        )
        if (!hasAllScopes) return null
    }

    // Update lastUsedAt asynchronously
    prisma.apiKey.update({
        where: { id: apiKeyData.id },
        data: { lastUsedAt: new Date() }
    }).catch(err => console.error('Failed to update lastUsedAt:', err))

    return apiKeyData
}

/**
 * Logs an integration event (API call or Webhook)
 */
export async function logIntegrationEvent(data: {
    apiKeyId?: string
    webhookId?: string
    endpoint?: string
    method?: string
    statusCode?: number
    duration?: number
    payload?: any
    response?: any
    error?: string
    ipAddress?: string
    userAgent?: string
}) {
    try {
        await prisma.integrationLog.create({
            data: {
                ...data,
                payload: data.payload ? JSON.stringify(data.payload) : null,
                response: data.response ? JSON.stringify(data.response) : null,
            }
        })
    } catch (error) {
        console.error('Failed to log integration event:', error)
    }
}
