import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { redis } from '@/lib/server/redis';
import { checkAuth } from '@/lib/server/auth-check';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { userId } = authCheck;

    const cacheKey = 'community_feed';
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        success: true,
        creations: cachedData,
        isPremium: authCheck.isPremium,
      });
    }

    // Fetch from Postgres
    const creations = await prisma.creation.findMany({
      where: { publish: true },
      orderBy: { createdAt: 'desc' },
    });

    // Cache in Redis for 60 minutes
    await redis.set(cacheKey, creations, { ex: 3600 });

    return NextResponse.json({
      success: true,
      creations,
      isPremium: authCheck.isPremium,
    });
  }
  catch (error: any) {
    console.error('get-published-creations error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
  }
}
