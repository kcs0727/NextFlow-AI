import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


export async function createUser(
  clerkId: string,
  email: string,
  name?: string | null,
  image?: string | null
) {
  return await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: {
      clerkId,
      email,
      name: name || '',
      image: image || '',
      isPremium: false,
      freeUsageCount: 0,
    },
  });
}
