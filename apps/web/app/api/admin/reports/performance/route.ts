import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-helper';
import { getJobStatusDistribution, getTeamPerformance, getReportStats, getWeeklyCompletedSteps } from '@/lib/data/reports';

export async function GET(request: Request) {
    try {
        const session = await verifyAuth(request);
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const fromStr = searchParams.get('from');
        const toStr = searchParams.get('to');

        const from = fromStr ? new Date(fromStr) : new Date(new Date().setDate(new Date().getDate() - 30));
        const to = toStr ? new Date(toStr) : new Date();

        // Use same range logic as web
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);

        const [jobDistribution, teamPerformance, stats, weeklySteps] = await Promise.all([
            getJobStatusDistribution(from, to, 'all', 'all'),
            getTeamPerformance(from, to, 'all', 'all'),
            getReportStats(from, to),
            getWeeklyCompletedSteps()
        ]);

        return NextResponse.json({
            jobDistribution,
            teamPerformance,
            stats,
            weeklySteps
        });
    } catch (error) {
        console.error('Mobile Performance Report Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
