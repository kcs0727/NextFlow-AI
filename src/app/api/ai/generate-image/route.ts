import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { checkAuth, checkLimit } from '@/lib/auth-check';
import { incrementFreeUsage } from '@/lib/rate-limit';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { userId, isPremium, freeUsageCount: initialFreeCount } = authCheck;

    const limitCheck = await checkLimit(userId, isPremium, initialFreeCount);
    if (limitCheck.errorResponse) return limitCheck.errorResponse;

    const { prompt, publish } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, message: 'Prompt description is required.' }, { status: 400 });
    }

    let secure_url = '';

    if (!process.env.CLIPDROP_API_KEY) {
      console.warn('CLIPDROP_API_KEY is missing! Using dummy image upload.');
      // Fallback dummy image
      secure_url = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
    } 
    else {
      const formData = new FormData();
      formData.append('prompt', prompt);

      const response = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
        headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
        responseType: 'arraybuffer',
      });

      const base64Image = `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;
      const uploadResult = await uploadToCloudinary(base64Image);
      secure_url = uploadResult.secure_url;
    }

    // Save image creation
    await prisma.creation.create({
      data: {
        userId,
        prompt,
        content: secure_url,
        type: 'image',
        publish: !!publish,
      },
    });

    // Update usage limit
    let freeUsageCount = initialFreeCount;
    if (!isPremium) {
      freeUsageCount = await incrementFreeUsage(userId, initialFreeCount);
    }

    // Invalidate dashboard caching
    await redis.del(`dashboard:${userId}`);

    // If published, invalidate community feed cache
    if (publish) {
      await redis.del('community_feed', 'trending_feed');
    }

    return NextResponse.json({ success: true, content: secure_url, freeUsageCount, isPremium });
  } 
  catch (error: any) {
    console.error('generate-image handler error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
  }
}
