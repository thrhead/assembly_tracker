import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import cloudinary from '@/lib/cloudinary'

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string; stepId: string }> }
) {
    const params = await props.params

    // Debug Cloudinary Config
    console.log('[Photo Upload Debug] Env Check:', {
        cloudNameExists: !!process.env.CLOUDINARY_CLOUD_NAME,
        apiKeyExists: !!process.env.CLOUDINARY_API_KEY,
        apiSecretExists: !!process.env.CLOUDINARY_API_SECRET
    });
    try {
        const session = await verifyAuth(req)
        if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const contentType = req.headers.get('content-type') || '';

        let file: File | null = null;
        let subStepId: string | null = null;
        let buffer: Buffer = Buffer.alloc(0);

        if (contentType.includes('application/json')) {
            console.log('[Photo Upload] Processing JSON/Base64 request');
            const body = await req.json();
            subStepId = body.subStepId || null;
            const photoBase64 = body.photo;

            if (!photoBase64) {
                return NextResponse.json({ error: 'No photo data provided' }, { status: 400 });
            }

            buffer = Buffer.from(photoBase64, 'base64');
            console.log('[Photo Upload] JSON Body parsed, buffer length:', buffer.length);
        } else {
            // Fallback to FormData (Legacy/Web)
            console.log('[Photo Upload] Processing Multipart/FormData request');
            const formData = await req.formData();
            file = formData.get('photo') as File;
            subStepId = formData.get('subStepId') as string | null;

            if (!file) {
                return NextResponse.json({ error: 'No file provided' }, { status: 400 })
            }

            if (typeof file.arrayBuffer === 'function') {
                const bytes = await file.arrayBuffer()
                buffer = Buffer.from(bytes)
            } else {
                const bytes = await new Response(file).arrayBuffer()
                buffer = Buffer.from(bytes)
            }
        }

        /* 
        console.log('[Photo Upload] Received request:', {
            stepId: params.stepId,
            subStepId,
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type
        })

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Convert file to buffer
        let buffer: Buffer
        try {
            if (typeof file.arrayBuffer === 'function') {
                const bytes = await file.arrayBuffer()
                buffer = Buffer.from(bytes)
            } else {
                console.log('[Photo Upload] arrayBuffer missing, trying Response workaround')
                const bytes = await new Response(file).arrayBuffer()
                buffer = Buffer.from(bytes)
            }
        } catch (err) {
            console.error('[Photo Upload] Error reading file buffer:', err)
            return NextResponse.json({ error: 'Failed to read file' }, { status: 500 })
        }
        */

        // Hex Dump Debug
        const headerHex = buffer.subarray(0, 20).toString('hex');
        console.log('[Photo Upload Debug] File Integrity Check:', {
            size: buffer.length,
            headerHex,
            isJpeg: headerHex.startsWith('ffd8ff'),
            isPng: headerHex.startsWith('89504e47')
        });

        if (buffer.length === 0) {
            return NextResponse.json({ error: 'Empty file received' }, { status: 400 })
        }

        // Create Data URI for upload
        const base64Data = buffer.toString('base64');

        // Sanitize MIME type
        let fileType = file?.type || 'image/jpeg';
        if (fileType === 'image' || !fileType.includes('/')) {
            fileType = 'image/jpeg';
            console.warn('[Photo Upload] Invalid MIME type detected, defaulting to image/jpeg');
        }

        const dataURI = `data:${fileType};base64,${base64Data}`;

        // Hex Dump Debug
        // const headerHex = buffer.subarray(0, 20).toString('hex'); // This was moved up
        console.log('[Photo Upload Debug] File Integrity Check:', {
            size: buffer.length,
            headerHex,
            isJpeg: headerHex.startsWith('ffd8ff'),
            isPng: headerHex.startsWith('89504e47'),
            resolvedMimeType: fileType,
            base64Start: base64Data.substring(0, 50)
        });

        // Upload to Cloudinary using standard upload (Base64 Data URI)
        // This ensures Cloudinary treats it as an image and fails if it's not valid image data.
        const uploadResult: any = await cloudinary.uploader.upload(dataURI, {
            folder: `jobs/${params.id}`,
            resource_type: 'image', // FORCE image type
            public_id: `${params.stepId}_${Date.now()}`
        });

        if (!uploadResult || !uploadResult.secure_url) {
            throw new Error('Cloudinary upload failed')
        }

        const photoUrl = uploadResult.secure_url

        // Create database record
        const photo = await prisma.stepPhoto.create({
            data: {
                stepId: params.stepId,
                subStepId: subStepId || null,
                url: photoUrl,
                uploadedById: session.user.id
            },
            include: {
                uploadedBy: {
                    select: { name: true }
                }
            }
        })

        // Emit Socket.IO event
        const socketPayload = {
            jobId: params.id,
            stepId: params.stepId,
            subStepId: subStepId || null,
            photoUrl: photoUrl,
            uploadedBy: session.user.name || session.user.email || 'Unknown',
            uploadedAt: new Date()
        }

        // Import socket functions dynamically to avoid circular deps if any
        const { emitToUser, broadcast } = await import('@/lib/socket')

        // Notify team lead/manager/admin
        // Find relevant users (e.g. job creator, team lead)
        const job = await prisma.job.findUnique({
            where: { id: params.id },
            include: {
                creator: true,
                assignments: { include: { team: true } }
            }
        })

        if (job) {
            if (job.creatorId) emitToUser(job.creatorId, 'photo:uploaded', socketPayload as unknown as Record<string, unknown>)
            // Broadcast to admins/managers
            broadcast('photo:uploaded', socketPayload as unknown as Record<string, unknown>)
        }

        return NextResponse.json(photo)
    } catch (error: any) {
        console.error('[Photo Upload CRITICAL ERROR]:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            params: await props.params
        })
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 })
    }
}
