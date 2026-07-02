import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/db";
import { checkAuth } from "@/lib/server/auth-check";
import { redis } from "@/lib/server/redis";
import { incrementFreeUsage } from "@/lib/server/rate-limit";

const nodeRunSchema = z.object({
  nodeId: z.string(),
  nodeType: z.string(),
  status: z.enum(["success", "failed", "partial", "running"]),
  inputs: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  outputs: z.record(z.string(), z.string()),
  error: z.string().optional(),
  durationMs: z.number().int().nonnegative(),
});

const runSchema = z.object({
  workflowId: z.string().optional(),
  scope: z.enum(["full", "single", "partial"]),
  status: z.enum(["success", "failed", "partial", "running"]),
  durationMs: z.number().int().nonnegative(),
  selectedIds: z.array(z.string()).optional(),
  nodeRuns: z.array(nodeRunSchema),
});

export async function GET(request: Request) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { userId } = authCheck;

    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId") ?? undefined;

    const dbRuns = await prisma.workflowRun.findMany({
      where: {
        userId,
        ...(workflowId ? { workflowId } : {}),
      },
      include: {
        nodeRuns: true,
      },
      orderBy: { startedAt: "desc" },
      take: 100,
    });

    const formattedRuns = dbRuns.map((run: {
      id: string;
      startedAt: Date;
      finishedAt: Date | null;
      scope: string;
      status: string;
      durationMs: number | null;
      selectedIds: unknown;
      nodeRuns: Array<{
        id: string;
        nodeId: string;
        nodeType: string;
        status: string;
        inputJson: unknown;
        outputJson: unknown;
        error: string | null;
        durationMs: number | null;
      }>;
    }) => ({
      id: run.id,
      createdAt: run.startedAt.toISOString(),
      startedAt: run.startedAt.toISOString(),
      finishedAt: run.finishedAt?.toISOString(),
      scope: run.scope,
      status: run.status,
      durationMs: run.durationMs ?? 0,
      selectedCount: Array.isArray(run.selectedIds) ? run.selectedIds.length : undefined,
      nodeRuns: run.nodeRuns.map((node) => ({
        id: node.id,
        nodeId: node.nodeId,
        nodeType: node.nodeType,
        status: node.status,
        inputs: (node.inputJson as Record<string, string | string[]>) ?? {},
        outputs: (node.outputJson as Record<string, string>) ?? {},
        error: node.error ?? undefined,
        durationMs: node.durationMs ?? 0,
      })),
    }));

    return NextResponse.json({ runs: formattedRuns });
  } catch (error: any) {
    console.error("GET /api/workflows/runs error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { userId } = authCheck;

    const parsed = runSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
    }

    const body = parsed.data;

    const run = await prisma.workflowRun.create({
      data: {
        workflowId: body.workflowId,
        userId,
        scope: body.scope,
        status: body.status,
        durationMs: body.durationMs,
        finishedAt: new Date(),
        selectedIds: body.selectedIds ?? undefined,
        nodeRuns: {
          create: body.nodeRuns.map((node) => ({
            nodeId: node.nodeId,
            nodeType: node.nodeType,
            status: node.status,
            inputJson: node.inputs,
            outputJson: node.outputs,
            error: node.error,
            durationMs: node.durationMs,
          })),
        },
      },
      include: { nodeRuns: true },
    });

    // Invalidate user workflows list because the runs count has incremented!
    await redis.del(`workflows:${userId}`);

    // Increment shared usage counter for the entire workflow run
    let freeUsageCount = authCheck.freeUsageCount;
    if (!authCheck.isPremium) {
      freeUsageCount = await incrementFreeUsage(userId, authCheck.freeUsageCount);
    }

    return NextResponse.json({ run, freeUsageCount, isPremium: authCheck.isPremium });
  } catch (error: any) {
    console.error("POST /api/workflows/runs error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
