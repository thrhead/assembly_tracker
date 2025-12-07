import { verifyAuth } from "@/lib/auth-helper"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        console.log('[API] Templates GET Request received');
        const session = await verifyAuth(req)
        console.log('[API] Templates Session:', session ? `User ${session.user.email} (${session.user.role})` : 'No Session');

        if (!session) {
            console.log('[API] Templates: Unauthorized (No session)');
            return new NextResponse("Yetkisiz Erişim", { status: 401 })
        }

        const templates = await prisma.jobTemplate.findMany({
            include: {
                steps: {
                    orderBy: { order: 'asc' },
                    include: {
                        subSteps: {
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        console.log(`[API] Templates Found: ${templates.length}`);
        return NextResponse.json(templates)
    } catch (error) {
        console.error("Templates fetch error:", error)
        return new NextResponse("Sunucu Hatası", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await verifyAuth(req)
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM_LEAD")) {
            return new NextResponse("Yetkisiz Erişim", { status: 401 })
        }

        const body = await req.json()
        const { name, description, steps } = body

        if (!name) {
            return new NextResponse("Şablon adı gereklidir", { status: 400 })
        }

        const template = await prisma.jobTemplate.create({
            data: {
                name,
                description,
                steps: {
                    create: steps?.map((step: any, index: number) => ({
                        title: step.title,
                        order: index + 1,
                        subSteps: {
                            create: step.subSteps?.map((sub: any, subIndex: number) => ({
                                title: sub.title,
                                order: subIndex + 1
                            }))
                        }
                    }))
                }
            },
            include: {
                steps: {
                    include: { subSteps: true }
                }
            }
        })

        return NextResponse.json(template)
    } catch (error) {
        console.error("Template create error:", error)
        return new NextResponse("Sunucu Hatası", { status: 500 })
    }
}
