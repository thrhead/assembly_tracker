import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Bu SADECE GEÇİCİ bir görüntüleme yoludur. İşlem sonrası silinmelidir.
export async function GET() {
  console.log('Temporary log viewer endpoint was accessed.');
  try {
    const logs = await prisma.systemLog.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Ham veriyi JSON olarak döndür
    return NextResponse.json(logs);
  } catch (error) {
    // Hata durumunda, hatanın ne olduğunu döndür
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: (error as Error).message },
      { status: 500 }
    );
  }
}
