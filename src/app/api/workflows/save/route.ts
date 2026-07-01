import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/db";
import { checkAuth } from "@/lib/server/auth-check";
import { redis } from "@/lib/server/redis";

const saveSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  graph: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
});

export async function GET() {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { userId, isPremium } = authCheck;

    const cacheKey = `workflows:${userId}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        workflows: cachedData,
        isPremium,
      });
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        _count: {
          select: { runs: true },
        },
      },
    });

    await redis.set(cacheKey, workflows, { ex: 3600 });

    return NextResponse.json({ workflows, isPremium });
  } catch (error: any) {
    console.error("GET /api/workflows/save error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { userId } = authCheck;

    const parsed = saveSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
    }

    const { id, name, graph } = parsed.data;

    const workflow = id
      ? await prisma.workflow.update({
          where: { id },
          data: { name, graphJson: graph, userId },
        })
      : await prisma.workflow.create({
          data: { name, graphJson: graph, userId },
        });

    // Invalidate workflows list cache and individual workflow cache
    await redis.del(`workflows:${userId}`);
    if (id) {
      await redis.del(`workflow:${id}`);
    }

    return NextResponse.json({ workflow });
  } catch (error: any) {
    console.error("POST /api/workflows/save error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
