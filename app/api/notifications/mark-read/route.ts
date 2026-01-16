import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyAuth(request);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    console.error('[Mark Read] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
