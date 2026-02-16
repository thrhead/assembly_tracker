
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminOrManager } from '@/lib/auth-helper'

// Simple Nearest Neighbor Algorithm for Route Optimization
function optimizeRoute(jobs: any[]) {
    if (jobs.length <= 1) return jobs;

    const unvisited = [...jobs];
    const optimized: any[] = [];

    // Start with the first job in the list (or we could pick the one closest to a 'center')
    let current = unvisited.shift();
    optimized.push(current);

    while (unvisited.length > 0) {
        let closestIdx = 0;
        let minDistance = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
            const dist = calculateDistance(
                current.latitude || 0,
                current.longitude || 0,
                unvisited[i].latitude || 0,
                unvisited[i].longitude || 0
            );

            if (dist < minDistance) {
                minDistance = dist;
                closestIdx = i;
            }
        }

        current = unvisited.splice(closestIdx, 1)[0];
        optimized.push(current);
    }

    return optimized;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    // Simple Pythagorean distance for approximation (Haversine would be better for real world)
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
}

export async function POST(req: Request) {
    try {
        const session = await verifyAdminOrManager(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { date, teamId } = await req.json();

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const jobs = await prisma.job.findMany({
            where: {
                scheduledDate: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                ...(teamId && teamId !== 'all' ? { assignments: { some: { teamId } } } : {})
            }
        });

        const jobsWithCoords = jobs.filter(j => j.latitude !== null && j.longitude !== null);
        const optimizedJobs = optimizeRoute(jobsWithCoords);

        // Include jobs without coordinates at the end
        const jobsWithoutCoords = jobs.filter(j => j.latitude === null || j.longitude === null);
        const finalResult = [...optimizedJobs, ...jobsWithoutCoords];

        return NextResponse.json(finalResult);
    } catch (error) {
        console.error('Route optimization error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
