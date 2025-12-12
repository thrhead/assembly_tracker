import { prisma } from "@/lib/db";

export async function getApprovals() {
  return await prisma.approval.findMany({
    where: {
      status: 'PENDING'
    },
    include: {
      job: {
        include: {
          customer: true
        }
      },
      requester: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getApprovalStats() {
    const pendingCount = await prisma.approval.count({
        where: { status: 'PENDING' }
    });
    return { pendingCount };
}
