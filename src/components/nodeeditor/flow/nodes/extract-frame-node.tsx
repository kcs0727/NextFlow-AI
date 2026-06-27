"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { WorkflowNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflowStore";
import { InputHandle, OutputHandle } from "@/components/nodeeditor/flow/handles";
import { NodeShell } from "@/components/nodeeditor/flow/node-shell";

function ExtractFrameNode({ id, data, selected }: NodeProps) {
  const updateNodeValue = useWorkflowStore((s) => s.updateNodeValue);
  const typedData = data as WorkflowNodeData;
  const videoConnected = Boolean(typedData.connectedInputs.video_url);
  const timestampConnected = Boolean(typedData.connectedInputs.timestamp);

    return (
      <NodeShell title={typedData.title} status={typedData.status} error={typedData.error} selected={selected}>
      {/* Input Handles */}
      <InputHandle id="video_url" top="35%" label="video" kind={typedData.kind} />
      <InputHandle id="timestamp" top="70%" label="time" kind={typedData.kind} tone="orange" />

      <div className="space-y-3">
        {/* Video URL Field */}
        <label className="block space-y-1">
          <span className="text-[11px] uppercase tracking-[0.14em] text-slate5">
            {videoConnected ? "Video (connected)" : "Video URL"}
          </span>
          <input
            type="url"
            value={typedData.values.video_url ?? ""}
            disabled={videoConnected}
            onChange={(e) => updateNodeValue(id, "video_url", e.target.value)}
            placeholder="Video URL"
            className="w-full rounded-xl border border-slate7 bg-slate95 px-3 py-2 text-sm text-slate2 outline-none transition focus:border-slate5 disabled:cursor-not-allowed disabled:opacity-40"
          />
        </label>

        {/* Timestamp Field */}
        <label className="block space-y-1">
          <span className="text-[11px] tracking-[0.14em] text-slate5">
            {timestampConnected ? "TIMESTAMP (connected)" : "TIMESTAMP (Seconds or percentage)"}
          </span>
          <input
            value={typedData.values.timestamp ?? "0"}
            disabled={timestampConnected}
            onChange={(e) => updateNodeValue(id, "timestamp", e.target.value)}
            placeholder="(e.g., 0, 30, 50%)"
            className="w-full rounded-xl border border-slate7 bg-slate95 px-3 py-2 text-sm text-slate2 outline-none transition focus:border-slate5 disabled:cursor-not-allowed disabled:opacity-40"
          />
        </label>

        {/* Info */}
        <p className="text-[11px] text-slate5">Enter seconds (e.g., 5) or percentage (e.g., 25%)</p>

        {typedData.outputs.output && (
          <div className="space-y-2">
            <img
              src={typedData.outputs.output}
              alt="Extracted frame"
              className="h-28 w-full rounded-xl border border-slate7 bg-slate95 object-cover"
            />
            <a
              href={typedData.outputs.output}
              target="_blank"
              rel="noreferrer"
              className="block truncate rounded-lg border border-slate7 bg-slate95 px-2 py-1 text-[11px] text-slate4 hover:text-slate2"
              title={typedData.outputs.output}
            >
              {typedData.outputs.output}
            </a>
          </div>
        )}
      </div>

      <OutputHandle id="output" top="88%" label="image" kind={typedData.kind} />
    </NodeShell>
  );
}

export default memo(ExtractFrameNode);
