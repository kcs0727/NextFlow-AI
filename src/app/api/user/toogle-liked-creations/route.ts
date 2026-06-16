import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-check';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { userId } = authCheck;

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'Creation ID is required.' }, { status: 400 });
    }

    const creation = await prisma.creation.findUnique({
      where: { id },
    });

    if (!creation) {
      return NextResponse.json({ success: false, message: 'Creation not found' }, { status: 404 });
    }

    const currentLikes = creation.likes || [];
    let updatedLikes: string[];
    let message = '';

    if (currentLikes.includes(userId)) {
      updatedLikes = currentLikes.filter((user) => user !== userId);
      message = 'Creation unliked';
    } else {
      updatedLikes = [...currentLikes, userId];
      message = 'Creation liked';
    }

    await prisma.creation.update({
      where: { id },
      data: { likes: updatedLikes },
    });

    // Invalidate caches
    await redis.del(['community_feed', 'trending_feed']);

    return NextResponse.json({
      success: true,
      message,
    });
  } 
  catch (error: any) {
    console.error('toggle-liked-creations error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
  }
}
