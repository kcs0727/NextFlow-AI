"use client";

import type { Edge } from "@xyflow/react";
import type { HistoryScope, HistoryStatus, NodeRunHistory, WorkflowEdge, WorkflowNode } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflowStore";
import { useUserStore } from "@/store/userStore";
import { topologicalLayers } from "./graph";
import { saveWorkflow, executeStartNode, pollTriggerRunStatus, saveWorkflowRun } from "@/services/workflow";

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


export async function executeScope(scope: HistoryScope) {
  const store = useWorkflowStore.getState();

  // Auto-save workflow before running
  await saveWorkflow();

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
          const body = await executeStartNode(node.data.kind, inputs);

          if (!body.runId) {
            throw new Error("Trigger run id was not returned");
          }

          const outputs = await pollTriggerRunStatus(body.runId);
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
    selectedIds: scope !== "full" ? useWorkflowStore.getState().selectedNodeIds : undefined,
    nodeRuns,
  };

  useWorkflowStore.getState().addRunHistory(historyEntry);

  await saveWorkflowRun({
    workflowId: useWorkflowStore.getState().workflowId,
    scope,
    status,
    durationMs,
    selectedIds: historyEntry.selectedIds,
    nodeRuns,
  });
}
