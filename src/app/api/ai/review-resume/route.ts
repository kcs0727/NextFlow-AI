import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import path from 'path';
import { pathToFileURL } from 'url';
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

    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File | null;

    if (!resumeFile) {
      return NextResponse.json({ success: false, message: 'No resume file uploaded.' }, { status: 400 });
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Resume file size exceeds allowed size (5MB)' },
        { status: 400 }
      );
    }

    const bytes = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let content = '';

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is missing! Using dummy content for preview.');
      content = `### Resume Review (Mock Analysis)\n\n**Strengths:**\n- Good formatting\n- Clear contact details\n\n**Weaknesses:**\n- Lacks quantitative achievements\n- Objective statement could be stronger\n\n*Configure \`GEMINI_API_KEY\` to get full AI analysis.*`;
    }
    else {
      const workerPath = pathToFileURL(
        path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs')
      ).toString();
      PDFParse.setWorker(workerPath);

      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      const text = pdfData.text || '';
      await parser.destroy();

      const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${text}`;

      const response = await geminiAI.chat.completions.create({
        model: 'gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      content = response.choices[0]?.message?.content || '';
    }

    // Save creation log
    await prisma.creation.create({
      data: {
        userId,
        prompt: 'Review the uploaded resume',
        content,
        type: 'review-resume',
        publish: false,
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
    console.error('review-resume handler error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
  }
}
