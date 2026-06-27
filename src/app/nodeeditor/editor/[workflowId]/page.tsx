"use client";

import { use } from "react";
import { WorkflowBuilder } from "@/components/nodeeditor/workflow-builder";

export default function WorkflowEditorPage({ params }: { params: Promise<{ workflowId: string }> }) {
  const { workflowId } = use(params);
  const resolvedId = workflowId === "new" ? undefined : workflowId;

  return <WorkflowBuilder workflowId={resolvedId} />;
}
