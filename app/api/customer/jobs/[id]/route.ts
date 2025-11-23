import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await props.params
    const { id } = params

    // Get customer profile
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    // Get job with details
    const job = await prisma.job.findFirst({
      where: {
        id,
        customerId: customer.id // Ensure job belongs to customer
      },
      include: {
        customer: {
          select: {
            company: true,
            address: true
          }
        },
        steps: {
          select: {
            id: true,
            title: true,
            description: true,
            isCompleted: true,
            completedAt: true,
            order: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        assignments: {
          include: {
            worker: {
              select: {
                name: true,
                phone: true,
                email: true
              }
            },
            team: {
              select: {
                name: true,
                lead: {
                  select: {
                    name: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        approvals: {
          select: {
            status: true,
            createdAt: true,
            updatedAt: true,
            notes: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Calculate progress
    const totalSteps = job.steps.length
    const completedSteps = job.steps.filter(s => s.isCompleted).length
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    return NextResponse.json({
      ...job,
      progress,
      completedSteps,
      totalSteps
    })
  } catch (error) {
    console.error('Get customer job detail error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
