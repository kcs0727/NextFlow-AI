"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type NodeShellProps = {
  title: string;
  status: "idle" | "running" | "success" | "failed";
  error?: string;
  selected?: boolean;
  children: React.ReactNode;
};

export function NodeShell({ title, status, error, selected, children }: NodeShellProps) {
  return (
    <div
      className={cn(
        "relative w-75 rounded-2xl border border-slate7 bg-nodebg p-4 text-slate2 backdrop-blur-md transition-all duration-300",
        selected &&
          "border-slate4 ring-2 ring-white/70",
        status === "running" && "animate-node-pulse ring-4 ring-blue-500/90",
        status === "failed" && "border-rose-400/50 dark:border-rose-500/40 ring-2 ring-rose-500/20 dark:ring-rose-400/20",
      )}
      style={
        status === "running"
          ? {
              animation: "node-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }
          : undefined
      }
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate3">{title}</h3>
        {status === "running" ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        ) : null}
      </div>

      <div className="space-y-3">{children}</div>

      {error ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 text-[11px] text-rose-700 dark:text-rose-200">
          <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
