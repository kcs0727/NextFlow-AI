import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get SVIX headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If headers are missing, return bad request
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  // Get raw request body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get Clerk Webhook Secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable.');
    return new Response('Error: Missing CLERK_WEBHOOK_SECRET', { status: 500 });
  }

  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  // Verify signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  }
  catch (err) {
    console.error('Error verifying Clerk webhook:', err);
    return new Response('Error verifying signature', { status: 400 });
  }

  const eventType = evt.type;
  const rawData = evt.data as any;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const id = rawData.id;
    const email = rawData.email_addresses?.[0]?.email_address || '';
    const fullName = `${rawData.first_name || ''} ${rawData.last_name || ''}`.trim() || 'User';
    const imageUrl = rawData.image_url || rawData.imageUrl || '';

    // Check if the plan is marked as premium in public metadata
    const isPremium = rawData.public_metadata?.plan === 'premium' || rawData.public_metadata?.subscription === 'premium';

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        email,
        name: fullName,
        image: imageUrl,
        isPremium,
      },
      create: {
        clerkId: id,
        email,
        name: fullName,
        image: imageUrl,
        isPremium,
        freeUsageCount: 0,
      },
    });

  }

  if (eventType === 'user.deleted') {
    const id = rawData.id;
    if (id) {
      // Clean up creations and user records
      await prisma.user.deleteMany({
        where: { clerkId: id },
      });
    }
  }

  // Invalidate Redis user cache
  try {
    await redis.del(`user_cache:${rawData.id}`);
    console.log("webhook called")
  } catch (err) {
    console.warn('Redis delete error in webhook:', err);
  }

  return NextResponse.json({ success: true });
}
