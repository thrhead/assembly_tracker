
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { generateJobPDF } from '@/lib/pdf-generator';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                customer: {
                    include: {
                        user: true
                    }
                },
                steps: {
                    orderBy: { order: 'asc' },
                    include: {
                        subSteps: true
                    }
                },
                costs: true,
                assignments: {
                    include: {
                        team: true
                    }
                }
            }
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const mappedJob = {
            ...job,
            team: job.assignments[0]?.team
        };

        // Since generateJobPDF currently returns a doc and doc.save() downloads in browser,
        // for server-side we need it to return the output buffer.
        // We'll modify generateJobPDF to return the doc or add another export.
        const doc = generateJobPDF(mappedJob as any);
        const pdfOutput = doc.output('arraybuffer');

        return new Response(pdfOutput, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="JobReport_${job.id.substring(0, 8)}.pdf"`,
            },
        });
    } catch (error) {
        console.error('[API Job Report Error]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
