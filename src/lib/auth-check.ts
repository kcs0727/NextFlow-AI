import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createUser, prisma } from './db';
import { checkRateLimit } from './rate-limit';
import { redis } from './redis';

export interface AuthCheckResult {
  userId: string;
  isPremium: boolean;
  freeUsageCount: number;
  errorResponse?: NextResponse;
}

export async function checkAuth(): Promise<AuthCheckResult> {
  const { userId, has } = await auth();

  if (!userId) {
    return {
      userId: '',
      isPremium: false,
      freeUsageCount: 0,
      errorResponse: NextResponse.json(
        { success: false, message: 'Authentication required. Please sign in.' },
        { status: 401 }
      ),
    };
  }

  const cacheKey = `user_cache:${userId}`;
  let dbUser;

  // 1. Try to load user from Redis cache
  try {
    const cachedUser = await redis.get(cacheKey);
    if (cachedUser) {
      dbUser = JSON.parse(cachedUser);
    }
  } catch (err) {
    console.warn('Redis read error in checkAuth:', err);
  }

  // 2. Cache miss: check database
  if (!dbUser) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
  }

  const clerkPremium = await has({ plan: 'premium' });
  const isPremiumFromClerk = !!clerkPremium;

  // 3. Fallback to Clerk only if user is not in database yet (safeguarding race conditions)
  if (!dbUser) {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return {
        userId,
        isPremium: isPremiumFromClerk,
        freeUsageCount: 0,
        errorResponse: NextResponse.json(
          { success: false, message: 'User not found in Clerk.' },
          { status: 404 }
        ),
      };
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const fullName = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
    const imageUrl = clerkUser.imageUrl || '';

    dbUser = await createUser(userId, email, fullName, imageUrl);


  }

  // 4. If DB isPremium is out of sync with Clerk's current token, synchronize it
  if (dbUser.isPremium !== isPremiumFromClerk) {
    dbUser = await prisma.user.update({
      where: { clerkId: userId },
      data: { isPremium: isPremiumFromClerk },
    });
    await redis.del(cacheKey);
  }


  // 5. Save to Redis cache for 24 hours
  const userData = {
    isPremium: dbUser.isPremium,
    freeUsageCount: dbUser.freeUsageCount,
  };

  try {
    await redis.set(cacheKey, JSON.stringify(userData), 'EX', 86400);
  } catch (err) {
    console.warn('Redis write error in checkAuth:', err);
  }

  return {
    userId,
    isPremium: dbUser.isPremium,
    freeUsageCount: dbUser.freeUsageCount,
  };
}

export interface LimitCheckResult {
  allowed: boolean;
  errorResponse?: NextResponse;
}

export async function checkLimit(
  userId: string,
  isPremium: boolean,
  freeUsageCount: number
): Promise<LimitCheckResult> {
  // Rate Limiting (per-minute threshold checks)
  const rateLimit = await checkRateLimit(userId, isPremium);
  if (!rateLimit.allowed) {
    return {
      allowed: false,
      errorResponse: NextResponse.json(
        { success: false, message: 'Too many requests. Please slow down.' },
        { status: 429 }
      ),
    };
  }

  // Free Tier quota check
  if (!isPremium && freeUsageCount >= 10) {
    return {
      allowed: false,
      errorResponse: NextResponse.json(
        { success: false, message: 'Limit reached. Upgrade to continue.' },
        { status: 403 }
      ),
    };
  }

  return {
    allowed: true,
  };
}


