import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db'; // Correct: Import prisma to interact with the DB

// Gelen isteğin gövdesi için bir Zod şeması tanımlıyoruz.
// Bu, veri bütünlüğünü ve güvenliği sağlar.
const logSchema = z.object({
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'AUDIT']),
  message: z.string(),
  // Corrected: z.record expects key and value types.
  meta: z.record(z.string(), z.any()).optional(), // Esnek bir JSON nesnesi için
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = logSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid log payload', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { level, message, meta } = validation.data;

    // Logu veritabanına kaydet
    await prisma.systemLog.create({
      data: {
        level,
        message,
        meta: meta || undefined, // Use undefined instead of null
        platform: 'web', // Set default platform for web logs
      },
    });

    return NextResponse.json({ message: 'Log received' }, { status: 201 });
  } catch (error) {
    console.error('[LOG API] Failed to process log:', error);
    // Burada hata durumunda bir loglama döngüsü oluşturmamak için
    // sadece konsola yazdırıyoruz.
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
