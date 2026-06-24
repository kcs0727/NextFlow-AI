import { redis } from './redis';
import { prisma } from './server/db';

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
}

export async function checkRateLimit(userId: string, isPremium: boolean): Promise<RateLimitResult> {
  const key = `rate_limit:${userId}`;
  const limit = isPremium ? 40 : 5; // 40 requests per min for Premium, 5 for Free
  const windowSeconds = 60;

  const current = await redis.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
    };
  }

  const newCount = await redis.incr(key);
  if (newCount === 1) {
    await redis.expire(key, windowSeconds);
  }

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - newCount),
  };
}

export async function incrementFreeUsage(userId: string, currentCount: number): Promise<number> {
  const newCount = currentCount + 1;
  await prisma.user.update({
    where: { clerkId: userId },
    data: { freeUsageCount: newCount },
  });

  // Invalidate Redis user cache
  const cacheKey = `user_cache:${userId}`;
  await redis.del(cacheKey);

  return newCount;
}

