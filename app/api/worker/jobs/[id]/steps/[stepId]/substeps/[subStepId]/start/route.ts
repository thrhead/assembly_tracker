import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';

export async function POST(request: Request, { params }: { params: Promise<{ id: string; stepId: string; substepId: string }> }) {
    try {
        console.log('[DEBUG] POST request received');
        const paramsValue = await params;
        console.log('[DEBUG] Start Substep Params:', paramsValue);

        const session = await verifyAuth(request);
        const { substepId } = paramsValue;
        console.log('[DEBUG] SubstepId:', substepId);

        const substep = await prisma.jobSubStep.findUnique({
            where: { id: substepId }
        });
        console.log('[DEBUG] Substep found:', substep ? 'Yes' : 'No');

        if (!substep) {
            return NextResponse.json({ error: 'Substep not found' }, { status: 404 });
        }

        if (substep.startedAt) {
            return NextResponse.json({ error: 'Substep already started' }, { status: 400 });
        }

        console.log('[DEBUG] Attempting to update substep with startedAt...');
        const updatedSubstep = await prisma.jobSubStep.update({
            where: { id: substepId },
            data: {
                startedAt: new Date()
            }
        });
        console.log('[DEBUG] Substep updated successfully');

        return NextResponse.json(updatedSubstep);
    } catch (error: any) {
        console.error('Error starting substep:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message || String(error)
        }, { status: 500 });
    }
}
