import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, checkLimit } from '@/lib/server/auth-check';
import { incrementFreeUsage } from '@/lib/server/rate-limit';
import { uploadToCloudinary } from '@/lib/server/cloudinary';
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
    const imageFile = formData.get('image') as File | null;
    const object = formData.get('object') as string | null;
    const publish = formData.get('publish') === 'true';

    if (!imageFile) {
      return NextResponse.json({ success: false, message: 'No image file uploaded.' }, { status: 400 });
    }

    if (!object) {
      return NextResponse.json({ success: false, message: 'Object description is required.' }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

    // Cloudinary upload with AI Generative Object Removal transformation
    const uploadResult = await uploadToCloudinary(base64Image, {
      transformation: [{ effect: `gen_remove:prompt_${object}` }],
    });

    const secure_url = uploadResult.secure_url;

    // Save creation log
    await prisma.creation.create({
      data: {
        userId,
        prompt: `Remove ${object} from image`,
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
    console.error('remove-image-object handler error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
  }
}
