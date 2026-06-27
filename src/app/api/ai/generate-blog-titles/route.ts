import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, checkLimit } from '@/lib/server/auth-check';
import { incrementFreeUsage } from '@/lib/server/rate-limit';
import { geminiAI } from '@/lib/server/ai-clients';
import { prisma } from '@/lib/server/db';
import { redis } from '@/lib/server/redis';

export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { userId, isPremium, freeUsageCount: initialFreeCount } = authCheck;

    const limitCheck = await checkLimit(userId, isPremium, initialFreeCount);
    if (limitCheck.errorResponse) return limitCheck.errorResponse;

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, message: 'Keyword prompt is required.' }, { status: 400 });
    }

    let content = '';
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is missing! Using dummy content for preview.');
      content = `*   **Title Option 1**: Unleashing the Power of AI: A New Era\n*   **Title Option 2**: Why AI is the Key to Scaling Your Business\n*   **Title Option 3**: Step-by-Step Guide to Artificial Intelligence in 2026`;
    }
    else {
      const response = await geminiAI.chat.completions.create({
        model: 'gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });
      content = response.choices[0]?.message?.content || '';
    }

    // Save creation
    await prisma.creation.create({
      data: {
        userId,
        prompt,
        content,
        type: 'blog-titles',
      },
    });

    // Update usage limit
    let freeUsageCount = initialFreeCount;
    if (!isPremium) {
      freeUsageCount = await incrementFreeUsage(userId, initialFreeCount);
    }

    // Invalidate dashboard caching
    await redis.del(`dashboard:${userId}`);

    return NextResponse.json({ success: true, content, freeUsageCount, isPremium });
  }
  catch (error: any) {
    console.error('generate-blog-titles handler error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
  }
}
