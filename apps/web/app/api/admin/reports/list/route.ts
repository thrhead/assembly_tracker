
import { NextResponse } from 'next/server';
import { listStoredReports } from '@/lib/reports-storage';
import { auth } from '@/lib/auth';

export async function GET() {
    const session = await auth();
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const reports = await listStoredReports();
        // Sort by creation time descending
        reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return NextResponse.json(reports);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
