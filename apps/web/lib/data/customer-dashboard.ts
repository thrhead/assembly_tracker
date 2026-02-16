import { prisma } from "@/lib/db"

export async function getCustomerJobs(userId: string) {
  // First find the customer record linked to this user
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { id: true }
  })

  if (!customer) {
    return []
  }

  // Fetch jobs for this customer
  const jobs = await prisma.job.findMany({
    where: {
      customerId: customer.id
    },
    orderBy: {
      updatedAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      status: true,
      scheduledDate: true,
      completedDate: true,
      location: true,
      _count: {
        select: { steps: true }
      },
      steps: {
        where: { isCompleted: true }
      }
    }
  })

  return jobs.map(job => ({
    ...job,
    progress: job._count.steps > 0 
      ? Math.round((job.steps.length / job._count.steps) * 100) 
      : 0
  }))
}
