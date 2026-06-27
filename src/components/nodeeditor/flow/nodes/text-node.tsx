"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { WorkflowNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflowStore";
import { NodeShell } from "@/components/nodeeditor/flow/node-shell";
import { OutputHandle } from "@/components/nodeeditor/flow/handles";

function TextNode({ id, data, selected }: NodeProps) {
    const updateNodeValue = useWorkflowStore((s) => s.updateNodeValue);
    const typedData = data as WorkflowNodeData;
    const value = typedData.values.text ?? "";

    return (
        <NodeShell title={typedData.title} status={typedData.status} error={typedData.error} selected={selected}>
            <textarea
                value={value}
                onChange={(e) => updateNodeValue(id, "text", e.target.value)}
                placeholder="Enter text..."
                className="h-28 w-full resize-none rounded-xl border border-slate7 bg-slate95 px-3 py-2 text-sm text-slate2 outline-none transition focus:border-slate5"
            />
            <OutputHandle id="output" top="80%" label="text" kind={typedData.kind} />
        </NodeShell>
    );
}

export default memo(TextNode);
