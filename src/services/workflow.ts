import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import { useWorkflowStore } from '@/store/workflowStore';
import type { WorkflowNode, WorkflowEdge, WorkflowCard } from '@/types/workflow';

export async function fetchAllWorkflows(): Promise<WorkflowCard[]> {
  try {
    const { data } = await axios.get('/api/workflows/save');
    const formatted = (data.workflows ?? []).map((wf: any) => ({
      id: wf.id,
      name: wf.name,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
      runCount: wf._count?.runs ?? 0,
    }));
    return formatted;
  } catch (error: any) {
    console.error('fetchWorkflows service error:', error);
    toast.error(error.response?.data?.error ?? error.message ?? "Failed to fetch workflows");
    return [];
  }
}

export async function fetchWorkflow(workflowId: string): Promise<any> {
  try {
    const { data } = await axios.get(`/api/workflows/save/${workflowId}`);
    const workflow = data.workflow;
    if (workflow) {
      const graph = workflow.graphJson as { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
      useWorkflowStore.getState().loadGraph(graph.nodes ?? [], graph.edges ?? [], workflow.id, workflow.name);
      return workflow;
    }
  } catch (error: any) {
    console.error("fetchWorkflow service error:", error);
    toast.error(error.response?.data?.error ?? error.message ?? "Failed to load workflow");
  }
  return null;
}

export async function fetchRuns(workflowId: string): Promise<void> {
  try {
    const { data } = await axios.get("/api/workflows/runs", {
      params: { workflowId },
    });
    useWorkflowStore.setState({ history: data.runs ?? [] });
  } catch (error: any) {
    console.error("fetchRuns service error:", error);
    toast.error(error.response?.data?.error ?? error.message ?? "Failed to fetch runs");
  }
}

export async function saveWorkflow(): Promise<boolean> {
  const { workflowId, workflowName, nodes, edges, loadGraph } = useWorkflowStore.getState();
  try {
    const { data } = await axios.post("/api/workflows/save", {
      id: workflowId,
      name: workflowName,
      graph: { nodes, edges },
    });
    const workflow = data.workflow;
    if (workflow) {
      const graph = workflow.graphJson as { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
      loadGraph(graph.nodes ?? [], graph.edges ?? [], workflow.id, workflow.name);
      toast.success("Workflow saved successfully!");
      return true;
    }
  } catch (err: any) {
    const errMsg = err.response?.data?.error ?? err.response?.data?.message ?? err.message ?? "Error saving workflow";
    toast.error(errMsg);
    console.error("saveWorkflow service error:", err);
  }
  return false;
}

export async function renameWorkflow(id: string, name: string): Promise<string | null> {
  try {
    const { data } = await axios.patch(`/api/workflows/save/${id}`, { name });
    const updatedWorkflow = data.workflow;
    if (updatedWorkflow) {
      toast.success("Workflow renamed successfully");
      return updatedWorkflow.name;
    }
    return null;
  } catch (error: any) {
    console.error('renameWorkflow service error:', error);
    toast.error(error.response?.data?.error ?? error.message ?? "Failed to rename workflow");
    return null;
  }
}

export async function deleteWorkflow(id: string): Promise<boolean> {
  try {
    const { data } = await axios.delete(`/api/workflows/save/${id}`);
    if (data.ok) {
      toast.success("Workflow deleted successfully");
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('deleteWorkflow service error:', error);
    toast.error(error.response?.data?.error ?? error.message ?? "Failed to delete workflow");
    return false;
  }
}
