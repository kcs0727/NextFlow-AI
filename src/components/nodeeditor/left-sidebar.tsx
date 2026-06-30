"use client";

import { useMemo, useState } from "react";
import { useClerk, UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Home, Search, PanelLeftClose, PanelLeftOpen, Zap, LogOut } from "lucide-react";
import type { WorkflowNodeKind } from "@/types/workflow";
import { NODE_OPTIONS } from "@/components/nodeeditor/flow/node-metadata";

type LeftSidebarProps = {
    onAddNode: (kind: WorkflowNodeKind) => void;
    onLoadSampleWorkflow: () => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
};

const QUICK_ACCESS = NODE_OPTIONS;

export function LeftSidebar({ onAddNode, onLoadSampleWorkflow, collapsed, onToggleCollapse }: LeftSidebarProps) {
    const router = useRouter();
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const [searchQuery, setSearchQuery] = useState("");
    const filteredQuickAccess = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return QUICK_ACCESS;

        return QUICK_ACCESS.filter((item) => item.label.toLowerCase().includes(query));
    }, [searchQuery]);

    const onDragStart = (event: React.DragEvent<HTMLButtonElement>, kind: WorkflowNodeKind) => {
        event.dataTransfer.setData("application/nextflow-node-kind", kind);
        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <aside
            className={`krea-scroll border-r border-slateb bg-primary py-4 transition-[width,padding] duration-300 flex flex-col justify-between ${collapsed ? "w-18.5 px-2" : "w-67.5 px-3"
                }`}
        >

            <div>
                <div className="mb-6 px-2">
                    <button
                        onClick={onToggleCollapse}
                        className="rounded-lg border border-slateb bg-buttonbg p-2 text-slate3"
                    >
                        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                    </button>
                </div>

                <div className="mb-4 space-y-1 px-1">
                    <button onClick={() => router.push("/nodeeditor")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold text-slate2 transition-colors hover:bg-slate8">
                        <Home className="h-4 w-4 text-sky-300" />
                        {!collapsed ? <span>Home</span> : null}
                    </button>
                    <button
                        onClick={onLoadSampleWorkflow}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate2 transition-colors hover:bg-slate8"
                        title="Load sample marketing workflow"
                    >
                        <Zap className="h-4 w-4 text-yellow-500" />
                        {!collapsed ? <span>Sample Workflow</span> : null}
                    </button>
                </div>

                {!collapsed ? (
                    <div className="mb-6 rounded-xl border border-slateb bg-primarybg px-3 py-2">
                        <div className="flex items-center gap-2 text-slate4">
                            <Search className="h-4 w-4" />
                            <input
                                className="w-full bg-transparent text-sm outline-none"
                                placeholder="Search nodes"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                    </div>
                ) : null}

                <div className="space-y-1">
                    {!collapsed ? <p className="mb-4 px-2 text-[11px] uppercase tracking-[0.2em] text-slate3">Quick Access</p> : null}
                    {filteredQuickAccess.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.kind}
                                onClick={() => onAddNode(item.kind)}
                                draggable={true}
                                onDragStart={(event) => onDragStart(event, item.kind)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate2 transition-colors hover:bg-slate8"
                            >
                                <span className={item.iconClassName}><Icon className="h-4 w-4" /></span>
                                {!collapsed ? <span>{item.label}</span> : null}
                            </button>
                        );
                    })}
                    {!collapsed && filteredQuickAccess.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-slate5">No matching nodes found.</p>
                    ) : null}
                </div>
            </div>
            
            {user && (
                <div className="mt-auto w-full border-t border-slateb pt-4 flex items-center justify-between">
                    <div
                        onClick={() => openUserProfile()}
                        className="flex gap-2.5 items-center cursor-pointer group"
                    >
                        <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full border border-slateb" />
                        <div className="max-w-[120px] truncate">
                            <h5 className="text-xs font-bold text-slate2 group-hover:text-slate1 transition">{user.firstName}</h5>
                            <p className="text-[10px] text-slate5 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ redirectUrl: '/' })}
                        className="p-1.5 rounded-lg text-slate4 hover:text-red-500 hover:bg-red-950/20 transition cursor-pointer"
                        title="Log out"
                    >
                        <LogOut className="w-4.5 h-4.5" />
                    </button>
                </div>
            )}

        </aside>
    );
}
