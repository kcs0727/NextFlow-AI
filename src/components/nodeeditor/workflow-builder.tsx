"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    ReactFlow,
    ReactFlowProvider,
    useReactFlow,
    type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ChevronDown, Download, Hand, Maximize2, MousePointer2, MoonStar, PanelRightOpen, Play, Plus, Redo2, Save, Scissors, Share2, SunMedium, Trash2, Undo2, Upload, ZoomIn, ZoomOut } from "lucide-react";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { LeftSidebar } from "@/components/nodeeditor/left-sidebar";
import { RightSidebar } from "@/components/nodeeditor/right-sidebar";
import { nodeTypes } from "@/components/nodeeditor/flow/node-types";
import { NODE_OPTIONS } from "@/components/nodeeditor/flow/node-metadata";
import { executeScope } from "@/lib/workflow/executor";
import { useWorkflowStore } from "@/store/workflowStore";
import { fetchWorkflow, fetchRuns, saveWorkflow as saveWorkflowAction } from "@/services/workflow";
import { createSampleWorkflow } from "@/lib/workflow/sample-workflow";
import type { WorkflowNodeKind } from "@/types/workflow";


function WorkflowBuilderInner({ workflowId: routeWorkflowId }: { workflowId?: string }) {
    const {
        workflowId: savedWorkflowId,
        workflowName,
        nodes,
        edges,
        selectedNodeIds,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        deleteSelected,
        cutSelectedEdges,
        setWorkflowName,
        setSelectedNodeIds,
        undo,
        redo,
        loadGraph,
        history,
        setHistory,
    } = useWorkflowStore();
    const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();
    const [historyOpen, setHistoryOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTool, setActiveTool] = useState<"select" | "hand">("hand");
    const [activeButtonId, setActiveButtonId] = useState<string | null>(null);
    const { theme: nextTheme, setTheme, resolvedTheme } = useTheme();
    const currentTheme = resolvedTheme ?? nextTheme ?? "dark";
    const [projectMenuOpen, setProjectMenuOpen] = useState(false);
    const [addNodeMenuOpen, setAddNodeMenuOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const projectMenuRef = useRef<HTMLDivElement>(null);
    const addNodeMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!projectMenuOpen) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target;
            if (projectMenuRef.current && target instanceof Node && !projectMenuRef.current.contains(target)) {
                setProjectMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
        };
    }, [projectMenuOpen]);

    useEffect(() => {
        if (!addNodeMenuOpen) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target;
            if (addNodeMenuRef.current && target instanceof Node && !addNodeMenuRef.current.contains(target)) {
                setAddNodeMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
        };
    }, [addNodeMenuOpen]);

    useEffect(() => {
        if (!routeWorkflowId) {
            setHistory([]);
            loadGraph([], [], undefined, "Untitled Workflow");
            return;
        }

        const bootstrap = async () => {
            await fetchWorkflow(routeWorkflowId);
            await fetchRuns(routeWorkflowId);
        };

        void bootstrap();
    }, [routeWorkflowId, fetchWorkflow, fetchRuns, setHistory, loadGraph]);

    const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
        setSelectedNodeIds((params.nodes ?? []).map((n) => n.id));
    }, [setSelectedNodeIds]);

    const saveWorkflow = useCallback(async () => {
        setActiveButtonId("save");
        setTimeout(() => setActiveButtonId(null), 300);
        await saveWorkflowAction();
    }, [saveWorkflowAction]);

    const exportWorkflow = useCallback(() => {
        setActiveButtonId("export");
        setTimeout(() => setActiveButtonId(null), 300);
        try {
            const data = {
                name: workflowName || "workflow",
                graph: { nodes, edges },
            };
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${data.name}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Workflow exported successfully!");
        } catch (err) {
            toast.error("Error exporting workflow");
            console.error(err);
        }
    }, [workflowName, nodes, edges]);

    const importWorkflow = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);

                    if (data.graph?.nodes && data.graph?.edges) {
                        if (data.name) {
                            setWorkflowName(data.name);
                        }
                        loadGraph(data.graph.nodes, data.graph.edges, savedWorkflowId, data.name || workflowName);
                        toast.success("Workflow imported successfully!");
                    } else {
                        throw new Error("Invalid workflow JSON format");
                    }
                } catch (err) {
                    toast.error("Invalid JSON format");
                    console.error(err);
                }
            };
            reader.readAsText(file);
        } catch (err) {
            toast.error("Error importing workflow");
            console.error(err);
        }

        event.currentTarget.value = "";
    }, [savedWorkflowId, loadGraph, setWorkflowName, workflowName]);

    const loadSampleWorkflow = useCallback(() => {
        try {
            const { nodes: sampleNodes, edges: sampleEdges } = createSampleWorkflow();
            setWorkflowName("Sample Marketing Workflow");
            loadGraph(sampleNodes, sampleEdges, savedWorkflowId, "Sample Marketing Workflow");
            toast.success("Sample workflow loaded!");
        } catch (err) {
            toast.error("Error loading sample workflow");
            console.error(err);
        }
    }, [savedWorkflowId, loadGraph, setWorkflowName]);

    const actions = useMemo(
        () => [
            {
                id: "run-full",
                label: "Run Full",
                icon: Play,
                fn: () => {
                    setActiveButtonId("run-full");
                    setTimeout(() => setActiveButtonId(null), 300);
                    executeScope("full");
                }
            },
            {
                id: "run-selected",
                label: "Run Selected",
                icon: Play,
                fn: () => {
                    setActiveButtonId("run-selected");
                    setTimeout(() => setActiveButtonId(null), 300);
                    executeScope("partial");
                }
            },
            {
                id: "run-single",
                label: "Run Single",
                icon: Play,
                fn: () => {
                    setActiveButtonId("run-single");
                    setTimeout(() => setActiveButtonId(null), 300);
                    executeScope("single");
                }
            },
            { id: "save", label: "Save", icon: Save, fn: saveWorkflow },
        ],
        [saveWorkflow],
    );

    const selectToolClass =
        activeTool === "select"
            ? "border-blue-500/40 bg-blue-500/18 text-blue-400"
            : "text-slate3 hover:bg-buttonhoverbg";
    const handToolClass =
        activeTool === "hand"
            ? "border-blue-500/40 bg-blue-500/18 text-blue-400"
            : "text-slate3 hover:bg-buttonhoverbg";


    return (
        <div className="flex h-[calc(100vh-1px)] w-full overflow-hidden bg-primary text-slate2">
            <LeftSidebar
                onAddNode={(kind) => {
                    addNode(kind);
                }}
                onLoadSampleWorkflow={loadSampleWorkflow}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
            />

            <main className="relative flex-1 bg-primarybg">

                <div className="pointer-events-none absolute left-4 right-4 top-4 z-30 flex items-start justify-between">
                    <div ref={projectMenuRef} className="pointer-events-auto relative flex items-center gap-2 rounded-xl border border-slateb bg-buttonbg p-2 backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => setProjectMenuOpen((value) => !value)}
                            aria-label="Open project menu"
                            className="rounded-lg p-1 text-slate4 transition hover:bg-slate8 hover:text-slate2"
                        >
                            <ChevronDown className={`h-4 w-4 transition-transform ${projectMenuOpen ? "rotate-180" : ""}`} />
                        </button>
                        <input
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            className="w-40 bg-transparent text-sm font-medium text-slate2 outline-none"
                        />


                        {projectMenuOpen ? (
                            <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-50 rounded-2xl border border-slateb bg-buttonbg p-2">
                                <button
                                    onClick={() => {
                                        setProjectMenuOpen(false);
                                        fileInputRef.current?.click();
                                    }}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate3 transition hover:bg-slate8"
                                >
                                    <Upload className="h-4 w-4" />
                                    Import
                                </button>
                                <button
                                    onClick={() => {
                                        setProjectMenuOpen(false);
                                        exportWorkflow();
                                    }}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate3 transition hover:bg-slate8"
                                >
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className="pointer-events-auto flex items-center gap-2">
                        {actions.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => item.fn()}
                                className={`flex items-center gap-2 rounded-xl border border-slateb px-3 py-2 text-xs text-slate3 backdrop-blur transition ${activeButtonId === item.id
                                    ? "bg-cyan-500/40 border-cyan-500/60 text-blue-400"
                                    : "bg-buttonbg hover:border-slate5 hover:bg-buttonhoverbg"
                                    }`}
                            >
                                <item.icon className="h-3.5 w-3.5" />
                                {item.label}
                            </button>
                        ))}
                        <button
                            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                            className="rounded-xl border px-3 py-2 text-xs font-medium backdrop-blur transition border-slateb bg-buttonbg text-slate3 hover:border-slate5 hover:bg-buttonhoverbg"
                            title="Toggle theme"
                        >
                            {currentTheme === "dark" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={() => void (async () => {
                                try {
                                    const shareData = {
                                        title: workflowName || "NextFlow",
                                        text: `Check out ${workflowName || "this workflow"}`,
                                        url: window.location.href,
                                    };

                                    if (navigator.share) {
                                        await navigator.share(shareData);
                                    } else {
                                        await navigator.clipboard.writeText(window.location.href);
                                        toast.success("Link copied to clipboard");
                                    }
                                } catch (error) {
                                    if (error instanceof DOMException && error.name === "AbortError") return;
                                    toast.error("Unable to share workflow");
                                }
                            })()}
                            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium backdrop-blur transition border-slateb bg-buttonbg text-slate3 hover:border-slate5 hover:bg-buttonhoverbg"
                            title="Share workflow"
                        >
                            <Share2 className="h-4 w-4" />
                            Share
                        </button>
                        <button
                            onClick={() => setHistoryOpen((v) => !v)}
                            className="rounded-xl border p-2 backdrop-blur transition border-slateb bg-buttonbg text-slate3 hover:border-slate5 hover:bg-buttonhoverbg"
                        >
                            <PanelRightOpen className="h-4 w-4" />
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={importWorkflow}
                        className="hidden"
                    />
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectionChange={onSelectionChange}
                    fitView
                    nodeTypes={nodeTypes}
                    proOptions={{ hideAttribution: true }}
                    selectionOnDrag={activeTool === "select"}
                    panOnDrag={activeTool === "hand"}
                    panOnScroll={true}
                    nodesDraggable={activeTool === "hand"}
                    nodesConnectable={true}
                    elementsSelectable={true}
                    minZoom={0.2}
                    maxZoom={2}
                    deleteKeyCode={["Delete", "Backspace"]}
                    onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                        event.preventDefault();

                        const kind = event.dataTransfer.getData("application/nextflow-node-kind") as WorkflowNodeKind;
                        if (!kind) return;

                        const position = screenToFlowPosition({
                            x: event.clientX,
                            y: event.clientY,
                        });

                        addNode(kind, position);
                    }}
                    className={`h-full w-full animate-[fadein_380ms_ease-out] ${activeTool === "select" ? "cursor-crosshair" : ""}`}
                >
                    <Background variant={BackgroundVariant.Dots} gap={22} size={1.3} color={currentTheme === "dark" ? "#40434688" : "#6b728066"} />
                    <Controls showInteractive={false} className="hidden!" />
                    <MiniMap
                        className="bottom-4! right-4! h-24! w-36! rounded-xl! border! border-slateb! bg-buttonbg!"
                        nodeColor="#7d89a9"
                        maskColor="rgba(7,8,12,0.68)"
                        pannable
                        zoomable
                    />
                </ReactFlow>

                {nodes.length === 0 ? (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                        <p className="px-4 py-2 text-md tracking-wide text-slate3 font-semibold backdrop-blur-sm">
                            Add a node to start
                        </p>
                    </div>
                ) : null}

                <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 rounded-2xl border border-slateb bg-buttonbg p-1 backdrop-blur-md">
                    <button onClick={undo} className="rounded-xl p-2 text-slate3 hover:bg-buttonhoverbg relative group">
                        <Undo2 className="h-5 w-5" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate9 text-slate2 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Undo
                        </span>
                    </button>
                    <button onClick={redo} className="rounded-xl p-2 text-slate3 hover:bg-buttonhoverbg relative group" >
                        <Redo2 className="h-5 w-5" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate9 text-slate2 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Redo
                        </span>
                    </button>
                    <button onClick={deleteSelected} className="rounded-xl p-2 text-slate3 hover:bg-buttonhoverbg relative group">
                        <Trash2 className="h-5 w-5" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate9 text-slate2 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Delete
                        </span>
                    </button>

                </div>

                <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-slateb bg-buttonbg p-2 backdrop-blur-md">
                    <div ref={addNodeMenuRef} className="relative">
                        <button
                            onClick={() => setAddNodeMenuOpen((value) => !value)}
                            className="group rounded-xl p-2 text-slate3 transition hover:bg-buttonhoverbg relative"
                            aria-expanded={addNodeMenuOpen}
                            aria-haspopup="menu"
                            title="Add Node"
                        >
                            <Plus className="h-5 w-5" />
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-slate9 px-2 py-1 text-xs text-slate2 opacity-0 transition-opacity group-hover:opacity-100">
                                Add Node
                            </span>
                        </button>

                        {addNodeMenuOpen ? (
                            <div className="absolute bottom-[calc(100%+0.75rem)] left-1/2 w-72 -translate-x-1/2 rounded-2xl border border-slateb bg-primary p-2 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
                                <p className="px-3 pb-2 pt-1 text-[11px] uppercase tracking-[0.2em] text-slate3">Add a node</p>
                                <div className="space-y-1">
                                    {NODE_OPTIONS.map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <button
                                                key={item.kind}
                                                onClick={() => {
                                                    addNode(item.kind);
                                                    setAddNodeMenuOpen(false);
                                                }}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate2 transition hover:bg-slate8"
                                            >
                                                <span className={item.iconClassName}>
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <button
                        onClick={() => setActiveTool("select")}
                        className={`rounded-xl hover:bg-buttonhoverbg p-2 text-slate3 transition relative group ${selectToolClass}`}
                        aria-pressed={activeTool === "select"}

                    >
                        <MousePointer2 className="h-5 w-5" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate9 text-slate2 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Select
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTool("hand")}
                        className={`rounded-xl hover:bg-buttonhoverbg p-2 text-slate3 transition relative group ${handToolClass}`}
                        aria-pressed={activeTool === "hand"}

                    >
                        <Hand className="h-5 w-5" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate9 text-slate2 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Hand
                        </span>
                    </button>
                    <button
                        onClick={() => cutSelectedEdges()}
                        disabled={selectedNodeIds.length === 0}
                        className="rounded-xl hover:bg-buttonhoverbg p-2 text-slate3 transition disabled:opacity-40 relative group"

                    >
                        <Scissors className="h-5 w-5" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate9 text-slate2 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Cut Edges
                        </span>
                    </button>
                    <button onClick={() => void zoomOut()} className="rounded-xl p-2 text-slate3 hover:bg-buttonhoverbg transition relative group" >
                        <ZoomOut className="h-5 w-5" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate9 text-slate2 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Zoom Out
                        </span>
                    </button>
                    <button onClick={() => void zoomIn()} className="rounded-xl p-2 text-slate3 hover:bg-buttonhoverbg transition relative group" >
                        <ZoomIn className="h-5 w-5" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate9 text-slate2 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Zoom In
                        </span>
                    </button>
                    <button onClick={() => void fitView({ padding: 0.2, duration: 300 })} className="rounded-xl p-2 text-slate3 hover:bg-buttonhoverbg transition relative group">
                        <Maximize2 className="h-5 w-5" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate9 text-slate2 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Fit View
                        </span>
                    </button>
                </div>

            </main>

            {historyOpen ? <RightSidebar runs={history} workflowName={workflowName} /> : null}
        </div>
    );
}

export function WorkflowBuilder({ workflowId }: { workflowId?: string }) {
    return (
        <ReactFlowProvider>
            <WorkflowBuilderInner workflowId={workflowId} />
        </ReactFlowProvider>
    );
}
