import { prisma } from "@/lib/db";

/**
 * Yeni bir iş için benzersiz bir proje numarası üretir.
 * Format: JOB-YYYY-XXXX (Örn: JOB-2024-0001)
 */
export async function generateJobNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `JOB-${currentYear}-`;

  // Bu yılki en yüksek numarayı bulalım
  const lastJob = await prisma.job.findFirst({
    where: {
      jobNo: {
        startsWith: yearPrefix,
      },
    },
    orderBy: {
      jobNo: 'desc',
    },
    select: {
      jobNo: true,
    },
  });

  let nextSequence = 1;

  if (lastJob?.jobNo) {
    const lastSequenceStr = lastJob.jobNo.split('-').pop();
    if (lastSequenceStr) {
      nextSequence = parseInt(lastSequenceStr, 10) + 1;
    }
  }

  const sequenceStr = nextSequence.toString().padStart(4, '0');
  return `${yearPrefix}${sequenceStr}`;
}

/**
 * İş adımları ve alt adımlar için hiyerarşik numaralar üretir.
 * @param jobNo Ana iş numarası
 * @param stepOrder Adım sırası
 * @param subStepOrder (Opsiyonel) Alt adım sırası
 */
export function formatTaskNumber(jobNo: string, stepOrder: number, subStepOrder?: number): string {
  const stepStr = stepOrder.toString().padStart(2, '0');
  if (subStepOrder !== undefined) {
    const subStepStr = subStepOrder.toString().padStart(2, '0');
    return `${jobNo}-${stepStr}-${subStepStr}`;
  }
  return `${jobNo}-${stepStr}`;
}