import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimit } from './rate-limit';

describe('rateLimit', () => {
    const IP = '192.168.1.1';

    beforeEach(() => {
        // Reset internal state if possible or use a fresh IP for each test
        vi.useFakeTimers();
    });

    it('should allow requests within the limit', () => {
        const limit = 5;
        const interval = 60000;

        for (let i = 0; i < limit; i++) {
            expect(rateLimit(IP + '_1', limit, interval)).toBe(true);
        }
    });

    it('should deny requests exceeding the limit', () => {
        const limit = 3;
        const interval = 60000;
        const testIp = IP + '_2';

        rateLimit(testIp, limit, interval); // 1
        rateLimit(testIp, limit, interval); // 2
        rateLimit(testIp, limit, interval); // 3
        expect(rateLimit(testIp, limit, interval)).toBe(false); // 4th request
    });

    it('should reset count after the interval has passed', () => {
        const limit = 2;
        const interval = 1000;
        const testIp = IP + '_3';

        expect(rateLimit(testIp, limit, interval)).toBe(true); // 1
        expect(rateLimit(testIp, limit, interval)).toBe(true); // 2
        expect(rateLimit(testIp, limit, interval)).toBe(false); // 3 (Blocked)

        // Fast-forward time
        vi.advanceTimersByTime(interval + 100);

        // Should be allowed again
        expect(rateLimit(testIp, limit, interval)).toBe(true);
    });

    it('should treat different IPs independently', () => {
        const limit = 1;
        const interval = 60000;

        expect(rateLimit('1.1.1.1', limit, interval)).toBe(true);
        expect(rateLimit('1.1.1.2', limit, interval)).toBe(true);

        expect(rateLimit('1.1.1.1', limit, interval)).toBe(false);
        expect(rateLimit('1.1.1.2', limit, interval)).toBe(false);
    });
});
