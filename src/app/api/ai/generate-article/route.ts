import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, checkLimit } from '@/lib/auth-check';
import { incrementFreeUsage } from '@/lib/rate-limit';
import { geminiAI } from '@/lib/ai-clients';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { userId, isPremium, freeUsageCount: initialFreeCount } = authCheck;

    const limitCheck = await checkLimit(userId, isPremium, initialFreeCount);
    if (limitCheck.errorResponse) return limitCheck.errorResponse;

    const { prompt, length } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, message: 'Prompt is required.' }, { status: 400 });
    }

    const tokenLen = typeof length === 'number' ? length : parseInt(length || '800', 10);
    const maxTokens = tokenLen + 1000;

    let content = '';
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is missing! Using dummy content for preview.');
      content = `## Article: ${prompt}\n\nThis is a preview mode placeholder content because the Gemini API Key is not configured yet. Set up the \`GEMINI_API_KEY\` variable to activate full functionality.\n\n### Benefits of AI Content\n1. Speed of creation\n2. Scale-up potential\n3. Idea brainstorming assistance`;
    } 
    else {
      const response = await geminiAI.chat.completions.create({
        model: 'gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
      });
      content = response.choices[0]?.message?.content || '';
    }

    // Save creation
    await prisma.creation.create({
      data: {
        userId,
        prompt,
        content,
        type: 'article',
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
    console.error('generate-article handler error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
  }
}
