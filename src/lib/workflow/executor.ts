"use client";

import type { Edge } from "@xyflow/react";
import axios from "@/lib/axios";
import type { HistoryScope, HistoryStatus, NodeRunHistory, WorkflowEdge, WorkflowNode } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflowStore";
import { useUserStore } from "@/store/userStore";
import { topologicalLayers } from "./graph";

type ExecuteStartResponse = {
  runId?: string;
  freeUsageCount?: number;
  isPremium?: boolean;
  error?: string;
};

type ExecuteStatusResponse = {
  status?: string;
  isCompleted?: boolean;
  isSuccess?: boolean;
  output?: Record<string, string> | null;
  error?: { message?: string } | null;
};

function incomingEdges(nodeId: string, edges: Edge[]) {
  return edges.filter((edge) => edge.target === nodeId);
}

function resolveInputs(node: WorkflowNode, nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const inputs: Record<string, string | string[]> = { ...node.data.values };
  const incoming = incomingEdges(node.id, edges);

  for (const edge of incoming) {
    const source = nodes.find((n) => n.id === edge.source);
    if (!source || !edge.targetHandle) continue;

    const outputVal = source.data.outputs.output ?? source.data.values.output ?? "";

    if (edge.targetHandle === "images") {
      const existing = Array.isArray(inputs.images) ? inputs.images : inputs.images ? [String(inputs.images)] : [];
      inputs.images = [...existing, outputVal].filter(Boolean);
    }
    else {
      inputs[edge.targetHandle] = outputVal;
    }
  }

  return inputs;
}

function runStatusFromNodeRuns(nodeRuns: NodeRunHistory[]): HistoryStatus {
  const failed = nodeRuns.some((run) => run.status === "failed");
  if (!failed) return "success";
  const success = nodeRuns.some((run) => run.status === "success");
  return success ? "partial" : "failed";
}

async function waitForTriggerRun(runId: string) {
  while (true) {
    try {
      const { data: body } = await axios.get<ExecuteStatusResponse & { error?: string }>(
        `/api/workflows/execute`,
        { params: { runId } }
      );

      if (!body.isCompleted) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      if (body.status === "COMPLETED" && body.isSuccess) {
        return (body.output ?? {}) as Record<string, string>;
      }

      throw new Error(body.error?.message ?? `Trigger task failed with status ${body.status ?? "unknown"}`);
    } catch (error: any) {
      if (error.response?.data) {
        const data = error.response.data;
        const msg = data.error?.message ?? data.error ?? data.message ?? error.message;
        throw new Error(msg);
      }
      throw error;
    }
  }
}

export async function executeScope(scope: HistoryScope) {
  const store = useWorkflowStore.getState();

  // Auto-save workflow before running
  const { workflowId, workflowName, nodes: allNodes, edges: allEdges } = store;
  if (workflowId && workflowName) {
    try {
      await axios.post("/api/workflows/save", {
        id: workflowId,
        name: workflowName,
        graph: { nodes: allNodes, edges: allEdges },
      });
    } catch (error) {
      console.error("Failed to auto-save workflow:", error);
    }
  }

  const runnable = store.getRunnableNodes(scope);
  if (!runnable.length) return;

  const nodes = store.nodes.filter((node) => runnable.some((r) => r.id === node.id));
  const edges = store.edges.filter(
    (edge) => nodes.some((n) => n.id === edge.source) && nodes.some((n) => n.id === edge.target),
  );

  const layers = topologicalLayers(nodes, edges);
  const nodeRuns: NodeRunHistory[] = [];
  const runStart = performance.now();

  for (const layer of layers) {
    await Promise.all(
      layer.map(async (node) => {
        const start = performance.now();
        useWorkflowStore.getState().setNodeStatus(node.id, "running");

        const inputs = resolveInputs(node, useWorkflowStore.getState().nodes, useWorkflowStore.getState().edges);

        try {
          const { data: body } = await axios.post<ExecuteStartResponse>(
            "/api/workflows/execute",
            { kind: node.data.kind, inputs }
          );

          // Sync usage state from the response
          if (body.freeUsageCount !== undefined || body.isPremium !== undefined) {
            useUserStore.setState({
              freeUsageCount: body.freeUsageCount ?? useUserStore.getState().freeUsageCount,
              isPremium: body.isPremium ?? useUserStore.getState().isPremium,
            });
          }

          if (!body.runId) {
            throw new Error("Trigger run id was not returned");
          }

          const outputs = await waitForTriggerRun(body.runId);
          for (const [key, val] of Object.entries(outputs)) {
            useWorkflowStore.getState().setNodeOutput(node.id, key, val);
          }

          if (node.data.kind === "runAnyLlm") {
            useWorkflowStore.getState().setNodeInlineResult(node.id, outputs.output ?? "");
          }

          useWorkflowStore.getState().setNodeStatus(node.id, "success");
          nodeRuns.push({
            id: `${node.id}-${Date.now()}`,
            nodeId: node.id,
            nodeType: node.data.kind,
            status: "success",
            inputs,
            outputs,
            durationMs: Math.round(performance.now() - start),
          });
        }
        catch (error: any) {
          const message = error.response?.data?.error?.message ??
            error.response?.data?.error ??
            error.response?.data?.message ??
            error.message ??
            "Unknown error";
          useWorkflowStore.getState().setNodeStatus(node.id, "failed", message);
          nodeRuns.push({
            id: `${node.id}-${Date.now()}`,
            nodeId: node.id,
            nodeType: node.data.kind,
            status: "failed",
            inputs,
            outputs: {},
            error: message,
            durationMs: Math.round(performance.now() - start),
          });
        }
      }),
    );
  }

  const durationMs = Math.round(performance.now() - runStart);
  const status = runStatusFromNodeRuns(nodeRuns);

  const historyEntry = {
    id: `run-${Date.now()}`,
    createdAt: new Date().toISOString(),
    scope,
    status,
    durationMs,
    selectedIds: scope !== "full" ? store.selectedNodeIds : undefined,
    nodeRuns,
  };

  useWorkflowStore.getState().addRunHistory(historyEntry);

  try {
    await axios.post("/api/workflows/runs", {
      workflowId: useWorkflowStore.getState().workflowId,
      scope,
      status,
      durationMs,
      selectedIds: historyEntry.selectedIds,
      nodeRuns,
    });
  } catch (err) {
    console.error("Failed to save workflow run history:", err);
  }
}
