const tracker = new Map<string, { count: number; lastReset: number }>();

/**
 * Basic memory-based rate limiter
 * @param ip Client IP address
 * @param limit Max requests per interval
 * @param interval Ms interval (default 1 minute)
 */
export function rateLimit(ip: string, limit: number = 20, interval: number = 60000): boolean {
    const now = Date.now();
    const userData = tracker.get(ip) || { count: 0, lastReset: now };

    if (now - userData.lastReset > interval) {
        userData.count = 1;
        userData.lastReset = now;
    } else {
        userData.count++;
    }

    tracker.set(ip, userData);

    return userData.count <= limit;
}

// Cleanup tracker every hour to prevent memory leaks
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [ip, data] of tracker.entries()) {
            if (now - data.lastReset > 3600000) { // 1 hour
                tracker.delete(ip);
            }
        }
    }, 1800000); // Check every 30 mins
}
