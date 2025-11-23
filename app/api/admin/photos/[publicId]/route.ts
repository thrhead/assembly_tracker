import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { deleteFromCloudinary } from '@/lib/cloudinary'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { publicId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin or manager
        if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const stepId = searchParams.get('stepId')
        const subStepId = searchParams.get('subStepId')
        const publicId = params.publicId

        // Delete from Cloudinary
        await deleteFromCloudinary(publicId)

        // Remove from database
        if (subStepId) {
            const subStep = await prisma.jobSubStep.findUnique({
                where: { id: subStepId },
            })

            if (subStep && subStep.photoUrls) {
                const urls = JSON.parse(subStep.photoUrls)
                const filteredUrls = urls.filter((item: any) => item.publicId !== publicId)

                await prisma.jobSubStep.update({
                    where: { id: subStepId },
                    data: { photoUrls: JSON.stringify(filteredUrls) },
                })
            }
        } else if (stepId) {
            const step = await prisma.jobStep.findUnique({
                where: { id: stepId },
            })

            if (step && step.photoUrls) {
                const urls = JSON.parse(step.photoUrls)
                const filteredUrls = urls.filter((item: any) => item.publicId !== publicId)

                await prisma.jobStep.update({
                    where: { id: stepId },
                    data: { photoUrls: JSON.stringify(filteredUrls) },
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Photo delete error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete photo' },
            { status: 500 }
        )
    }
}
