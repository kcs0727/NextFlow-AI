"use client";

import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { HANDLE_TONE_CLASS, HANDLE_TONE_STYLE, getHandleTone } from "@/components/nodeeditor/flow/node-metadata";
import type { WorkflowNodeKind } from "@/types/workflow";
import type { NodeTone } from "@/components/nodeeditor/flow/node-metadata";

type InputHandleProps = {
  id: string;
  top: string;
  disabled?: boolean;
  label?: string;
  kind: WorkflowNodeKind;
  tone?: NodeTone;
};

export function InputHandle({ id, top, disabled, label, kind, tone }: InputHandleProps) {
  const resolvedTone = tone ?? getHandleTone(kind);

  return (
    <div className="relative" style={{ position: "absolute", left: 0, top }}>
      <Handle
        type="target"
        id={id}
        position={Position.Left}
        className={cn(
          "h-3.5 w-3.5 rounded-full border",
          HANDLE_TONE_CLASS[resolvedTone],
          disabled && "opacity-50",
        )}
        style={HANDLE_TONE_STYLE[resolvedTone]}
        isConnectable={!disabled}
      />
    </div>
  );
}

type OutputHandleProps = {
  id?: string;
  top?: string;
  label?: string;
  kind: WorkflowNodeKind;
  tone?: NodeTone;
};

export function OutputHandle({ id = "output", top = "50%", label, kind, tone }: OutputHandleProps) {
  const resolvedTone = tone ?? getHandleTone(kind);

  return (
    <div className="relative" style={{ position: "absolute", right: 0, top }}>
      <Handle
        type="source"
        id={id}
        position={Position.Right}
        className={cn("h-3.5 w-3.5 rounded-full border", HANDLE_TONE_CLASS[resolvedTone])}
        style={HANDLE_TONE_STYLE[resolvedTone]}
        isConnectable
      />
    </div>
  );
}
