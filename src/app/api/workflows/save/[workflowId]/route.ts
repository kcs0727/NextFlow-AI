import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/db";
import { checkAuth } from "@/lib/server/auth-check";
import { redis } from "@/lib/server/redis";

const renameSchema = z.object({
  name: z.string().min(1),
});

type RouteContext = {
  params: Promise<{ workflowId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { userId } = authCheck;

    const { workflowId } = await params;
    const cacheKey = `workflow:${workflowId}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      const workflow = cachedData as any;
      if (workflow.userId === userId) {
        return NextResponse.json({ workflow });
      }
    }

    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await redis.set(cacheKey, workflow, { ex: 3600 });

    return NextResponse.json({ workflow });
  } catch (error: any) {
    console.error("GET /api/workflows/save/[workflowId] error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { userId } = authCheck;

    const { workflowId } = await params;
    const parsed = renameSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
    }

    const workflow = await prisma.workflow.findFirst({ where: { id: workflowId, userId } });
    if (!workflow) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.workflow.update({
      where: { id: workflowId },
      data: { name: parsed.data.name },
    });

    // Invalidate single workflow cache and list cache
    await redis.del(`workflow:${workflowId}`);
    await redis.del(`workflows:${userId}`);

    return NextResponse.json({ workflow: updated });
  } catch (error: any) {
    console.error("PATCH /api/workflows/save/[workflowId] error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { userId } = authCheck;

    const { workflowId } = await params;
    const workflow = await prisma.workflow.findFirst({ where: { id: workflowId, userId } });
    if (!workflow) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.workflow.delete({ where: { id: workflowId } });

    // Invalidate single workflow cache and list cache
    await redis.del(`workflow:${workflowId}`);
    await redis.del(`workflows:${userId}`);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("DELETE /api/workflows/save/[workflowId] error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
