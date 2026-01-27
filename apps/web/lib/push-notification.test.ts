import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendPushNotification, sendMultiplePushNotifications } from './push-notification'

// Mock Expo SDK
vi.mock('expo-server-sdk', () => {
    function MockExpo() {
        return {
            sendPushNotificationsAsync: vi.fn().mockResolvedValue([
                { status: 'ok', id: 'test-id' }
            ]),
            chunkPushNotifications: vi.fn().mockImplementation((msgs) => [msgs]),
        }
    }
    
    // @ts-expect-error - isExpoPushToken is a static property on Expo class, but we are mocking it as a function
    MockExpo.isExpoPushToken = vi.fn().mockImplementation((token) => token.startsWith('ExponentPushToken'))
    
    return {
        Expo: MockExpo
    }
})

describe('Push Notification Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should send a single push notification', async () => {
        const result = await sendPushNotification({
            to: 'ExponentPushToken[xxxx]',
            title: 'Test Title',
            body: 'Test Body',
            data: { some: 'data' }
        })

        expect(result).toBeDefined()
        expect(result[0].status).toBe('ok')
    })

    it('should send multiple push notifications', async () => {
        const results = await sendMultiplePushNotifications([
            { to: 'ExponentPushToken[xxxx]', title: 'Msg 1', body: 'Body 1' },
            { to: 'ExponentPushToken[yyyy]', title: 'Msg 2', body: 'Body 2' }
        ])

        expect(results).toHaveLength(1) // One chunk in mock
        expect(results[0][0].status).toBe('ok')
    })

    it('should throw error for invalid token', async () => {
        await expect(sendPushNotification({
            to: 'invalid-token',
            title: 'Fail',
            body: 'Fail'
        })).rejects.toThrow('Invalid Expo Push Token')
    })
})
