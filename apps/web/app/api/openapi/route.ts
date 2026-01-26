
import { NextRequest, NextResponse } from 'next/server';
import { getOpenApiSpec } from '@/lib/openapi';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    // Optional: Restrict to Admins? 
    // Public API docs are usually public, but we can verify session if needed.
    const session = await auth();
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') || 'tr') as 'tr' | 'en';

    try {
        const spec = getOpenApiSpec(lang);
        return NextResponse.json(spec);
    } catch (error) {
        console.error('[OpenAPI] Error generating spec:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
