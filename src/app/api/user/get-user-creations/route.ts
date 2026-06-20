import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-check';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { userId } = authCheck;

    const cacheKey = `dashboard:${userId}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      const creations = cachedData;
      return NextResponse.json({
        success: true,
        creations,
        isPremium: authCheck.isPremium,
      });
    }

    // Fetch from Postgres
    const creations = await prisma.creation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Cache creations list in Redis for 60 minutes 
    await redis.set(cacheKey, creations, { ex: 3600 });

    return NextResponse.json({
      success: true,
      creations,
      isPremium: authCheck.isPremium,
    });
  } 
  catch (error: any) {
    console.error('get-user-creations error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
  }
}

