import { NextResponse } from "next/server";
import { z } from "zod";
import type { WorkflowNodeKind } from "@/types/workflow";
import { checkAuth, checkLimit } from "@/lib/server/auth-check";
import { incrementFreeUsage } from "@/lib/server/rate-limit";
import { runs, tasks } from "@trigger.dev/sdk/v3";

const payloadSchema = z.object({
    kind: z.enum([
        "text",
        "uploadImage",
        "uploadVideo",
        "runAnyLlm",
        "cropImage",
        "extractFrameFromVideo",
    ] as [WorkflowNodeKind, ...WorkflowNodeKind[]]),
    inputs: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

const TASK_IDS: Record<WorkflowNodeKind, string> = {
    text: "text-node",
    uploadImage: "upload-image-node",
    uploadVideo: "upload-video-node",
    runAnyLlm: "run-any-llm-node",
    cropImage: "crop-image-node",
    extractFrameFromVideo: "extract-frame-from-video-node",
};

function toExecutionPayload(inputs: Record<string, string | string[]>) {
    return {
        text: inputs.text,
        imageUrl: inputs.image_url,
        videoUrl: inputs.video_url,
        model: inputs.model,
        systemPrompt: inputs.system_prompt,
        userMessage: inputs.user_message,
        images: Array.isArray(inputs.images)
            ? inputs.images.map(String)
            : inputs.images
                ? [String(inputs.images)]
                : [],
        xPercent: inputs.x_percent,
        yPercent: inputs.y_percent,
        widthPercent: inputs.width_percent,
        heightPercent: inputs.height_percent,
        timestamp: inputs.timestamp,
    };
}

export async function POST(request: Request) {
    // Use Final_Project's shared auth + usage limit system
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { userId, isPremium, freeUsageCount: initialFreeCount } = authCheck;

    const limitCheck = await checkLimit(userId, isPremium, initialFreeCount);
    if (limitCheck.errorResponse) return limitCheck.errorResponse;

    const parsed = payloadSchema.safeParse(await request.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
    }

    const { kind, inputs } = parsed.data;
    try {
        const handle = await tasks.trigger(TASK_IDS[kind], toExecutionPayload(inputs));

        // Increment shared usage counter (same pool as AI tools)
        let freeUsageCount = initialFreeCount;
        if (!isPremium) {
            freeUsageCount = await incrementFreeUsage(userId, initialFreeCount);
        }

        return NextResponse.json({ runId: handle.id, freeUsageCount, isPremium });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Trigger execution failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const authCheck = await checkAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const url = new URL(request.url);
    const runId = url.searchParams.get("runId");

    if (!runId) {
        return NextResponse.json({ error: "Missing runId" }, { status: 400 });
    }

    try {
        const run = await runs.retrieve(runId);
        return NextResponse.json({
            status: run.status,
            isCompleted: run.isCompleted,
            isSuccess: run.isSuccess,
            output: run.output ?? null,
            error: run.error ?? null,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to retrieve Trigger run";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
