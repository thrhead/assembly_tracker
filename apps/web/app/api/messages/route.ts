import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth' // Assuming we have auth helper, usually next-auth
import { emitToJob, emitToUser } from '@/lib/socket'
import { sanitizeHtml } from '@/lib/security'

// Force dynamic since we use query params and auth
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        // Mock auth check - replace with real auth check
        // const session = await auth()
        // if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

        const { searchParams } = new URL(request.url)
        const jobId = searchParams.get('jobId')
        const conversationId = searchParams.get('conversationId')

        if (!jobId && !conversationId) {
            return new NextResponse('Job ID or Conversation ID required', { status: 400 })
        }

        // Fetch messages with sender details
        const messages = await prisma.message.findMany({
            where: {
                ...(jobId ? { jobId } : {}),
                ...(conversationId ? { conversationId } : {}),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    }
                }
            },
            orderBy: {
                sentAt: 'asc'
            }
        })

        return NextResponse.json(messages)

    } catch (error) {
        console.error('Error fetching messages:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        // const session = await auth()
        // if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

        // Mock user ID for now if auth is missing
        const senderId = "user_id_placeholder"

        const body = await request.json()
        let { content } = body
        const { jobId, conversationId, receiverId, isEncrypted } = body

        if (content && !isEncrypted) {
            content = sanitizeHtml(content)
        }

        if (!content || (!jobId && !receiverId && !conversationId)) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        let targetConversationId = conversationId

        // If no conversation ID, find or create one (simplified logic)
        if (!targetConversationId && jobId) {
            // Check if a conversation exists for this job
            const existingConv = await prisma.conversation.findFirst({
                where: { jobId }
            })

            if (existingConv) {
                targetConversationId = existingConv.id
            } else {
                const newConv = await prisma.conversation.create({
                    data: {
                        jobId,
                        title: `Job ${jobId} Chat`
                    }
                })
                targetConversationId = newConv.id
            }
        }

        // Create the message
        const newMessage = await prisma.message.create({
            data: {
                content,
                senderId, // Use session.user.id in production
                jobId,
                conversationId: targetConversationId!, // Non-null assertion as logic ensures it exists
                receiverId,
                isEncrypted: isEncrypted || false,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    }
                }
            }
        })

        // Real-time broadcast
        if (jobId) {
            emitToJob(jobId, 'receive:message', newMessage)
        } else if (receiverId) {
            emitToUser(receiverId, 'receive:message', newMessage)
        }

        return NextResponse.json(newMessage)

    } catch (error) {
        console.error('Error sending message:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
