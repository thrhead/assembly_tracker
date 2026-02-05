import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { auth } from "@/lib/auth";

const logSchema = z.object({
  level: z.string(), // Use string to be more flexible, will validate in mapping
  message: z.string(),
  context: z.any().optional(),
  stack: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  createdAt: z
    .any()
    .optional()
    .transform((val) => {
        if (!val) return new Date();
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date() : d;
    }),
});

const batchSchema = z.array(logSchema);

export async function POST(req: Request) {
  try {
    const session = await auth();

    const body = await req.json();
    const parsed = batchSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const logs = parsed.data;

    // Protection against future dates (e.g. wrong device clock) which break sorting/visibility
    const now = new Date();
    const futureThreshold = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer

    // Map fields to match the Prisma model exactly
    const logsToCreate = logs.map((log) => {
      let finalDate = log.createdAt;
      // If date is in the future, reset to server time to preserve log order
      if (finalDate > futureThreshold) {
          finalDate = new Date();
      }

      return {
        level: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'AUDIT'].includes(log.level) ? log.level : 'INFO',
        message: log.message || 'No message',
        platform: (log.platform as string) || 'web',
        createdAt: finalDate,
        userId: session?.user?.id || null,
        meta: (log.context || log.stack)
            ? {
                context: log.context || null,
                stack: log.stack || null,
              }
            : undefined, // Use undefined instead of null to satisfy Prisma's NullableJsonNullValueInput type
      };
    });

    if (logsToCreate.length > 0) {
        await prisma.systemLog.createMany({
            data: logsToCreate,
            skipDuplicates: true
        });
    }

    return NextResponse.json({ success: true, count: logsToCreate.length }, { status: 201 });
  } catch (error) {
    console.error("Log batch sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}