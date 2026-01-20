import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const diagnostics = {
        env: {
            hasAuthSecret: !!process.env.AUTH_SECRET,
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            hasDbUrl: !!process.env.DATABASE_URL,
            hasDirectUrl: !!process.env.DIRECT_URL,
            nodeEnv: process.env.NODE_ENV,
        },
        db: 'Checking...',
    };

    try {
        // Attempt a simple query
        await prisma.user.count();
        diagnostics.db = 'Connected successfully';
    } catch (error: any) {
        diagnostics.db = `Connection failed: ${error.message}`;
    }

    return NextResponse.json(diagnostics);
}
