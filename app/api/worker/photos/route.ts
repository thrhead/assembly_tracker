import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const jobId = formData.get('jobId') as string | null
        const stepId = formData.get('stepId') as string | null
        const subStepId = formData.get('subStepId') as string | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
                { status: 400 }
            )
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            )
        }

        // Upload to Cloudinary
        const result: any = await uploadToCloudinary(file, 'assembly-tracker/jobs')

        const photoUrl = result.secure_url
        const publicId = result.public_id

        // Update database based on context
        if (subStepId) {
            // Add to sub-step
            const subStep = await prisma.jobSubStep.findUnique({
                where: { id: subStepId },
            })

            if (!subStep) {
                return NextResponse.json({ error: 'Sub-step not found' }, { status: 404 })
            }

            const existingUrls = subStep.photoUrls ? JSON.parse(subStep.photoUrls) : []
            const newUrls = [...existingUrls, { url: photoUrl, publicId }]

            await prisma.jobSubStep.update({
                where: { id: subStepId },
                data: { photoUrls: JSON.stringify(newUrls) },
            })
        } else if (stepId) {
            // Add to step
            const step = await prisma.jobStep.findUnique({
                where: { id: stepId },
            })

            if (!step) {
                return NextResponse.json({ error: 'Step not found' }, { status: 404 })
            }

            const existingUrls = step.photoUrls ? JSON.parse(step.photoUrls) : []
            const newUrls = [...existingUrls, { url: photoUrl, publicId }]

            await prisma.jobStep.update({
                where: { id: stepId },
                data: { photoUrls: JSON.stringify(newUrls) },
            })
        }

        return NextResponse.json({
            success: true,
            url: photoUrl,
            publicId,
        })
    } catch (error: any) {
        console.error('Photo upload error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to upload photo' },
            { status: 500 }
        )
    }
}
