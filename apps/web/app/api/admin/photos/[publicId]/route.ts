import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { deleteFromCloudinary, extractPublicIdFromUrl } from '@/lib/cloudinary'
import { prisma } from '@/lib/db'

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ publicId: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin or manager
        if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const photoId = params.publicId

        // 1. Find the photo to get the URL
        const photo = await prisma.stepPhoto.findUnique({
            where: { id: photoId }
        })

        if (!photo) {
            return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
        }

        // 2. Delete from Cloudinary
        const publicId = extractPublicIdFromUrl(photo.url)
        if (publicId) {
            await deleteFromCloudinary(publicId)
        }

        // 3. Delete from database
        await prisma.stepPhoto.delete({
            where: { id: photoId }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Photo delete error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete photo' },
            { status: 500 }
        )
    }
}
