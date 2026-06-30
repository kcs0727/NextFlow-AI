"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, FolderPlus, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchAllWorkflows } from "@/services/workflow";
import { WorkflowCard as WorkflowCardType } from "@/types/workflow";
import WorkflowCard from "@/components/WorkflowCard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [workflows, setWorkflows] = useState<WorkflowCardType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadWorkflows = async () => {
      setLoading(true);
      const data = await fetchAllWorkflows();
      setWorkflows(data);
      setLoading(false);
    };

    void loadWorkflows();
  }, [user, fetchAllWorkflows]);

  const filteredWorkflows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workflows.filter((workflow) => workflow.name.toLowerCase().includes(query));
  }, [search, workflows]);

  const createWorkflow = () => {
    router.push("/nodeeditor/editor/new");
  };

  const handleRenameSuccess = (id: string, newName: string) => {
    setWorkflows((current) =>
      current.map((w) => (w.id === id ? { ...w, name: newName } : w))
    );
  };

  const handleDeleteSuccess = (id: string) => {
    setWorkflows((current) => current.filter((w) => w.id !== id));
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate95">
        <span className="w-10 h-10 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-primarybg text-slate2 transition-colors duration-300">

      {/* Hero Section — matches Final_Project landing page style */}
      <section className="relative overflow-hidden border-b border-slateb">
        {/* Gradient glows matching Final_Project hero */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
          <div className="absolute top-[5%] left-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/15 dark:bg-blue-600/10 blur-[100px]" />
          <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-purple-500/15 dark:bg-purple-600/10 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-8 px-6 pb-14 pt-10 lg:px-10">
          <motion.div
            className="flex items-center justify-between gap-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full dark:bg-blue-900/30 dark:border-blue-800/40 dark:text-blue-400 bg-blue-50 border-blue-200/50 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Visual Workflow Builder
              </div>
              <h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight md:text-5xl text-slate1">
                Node Editor
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate4 md:text-base">
                Build and manage visual workflows with a powerful node-based editor. Chain AI operations, image processing, and video tools into automated pipelines.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={createWorkflow}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/20 hover:shadow-indigo-500/30 hover:scale-[1.03] active:scale-[0.98] transition"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FolderPlus className="h-4 w-4" />
                  New Workflow
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Decorative cards — matching Final_Project premium aesthetic */}
            <div className="hidden w-[480px] shrink-0 lg:block">
              <div className="relative h-[280px] rounded-2xl border border-slateb bg-slate95/30 p-6 backdrop-blur-xl overflow-hidden">
                <div className="absolute left-6 top-6 h-36 w-36 rounded-full bg-blue-500/15 blur-3xl" />
                <div className="absolute right-8 top-6 h-28 w-28 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="grid h-full grid-cols-3 gap-3">
                  <motion.div
                    className="translate-y-6 rounded-2xl border border-slateb bg-slate95 p-3 shadow-lg backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 6 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="mb-3 h-16 rounded-xl bg-gradient-to-br from-zinc-500/40 to-zinc-200/10" />
                    <div className="space-y-2">
                      <div className="h-2 w-20 rounded-full bg-slate7" />
                      <div className="h-2 w-14 rounded-full bg-slate8" />
                    </div>
                  </motion.div>
                  <motion.div
                    className="rounded-2xl border border-slateb bg-slate95 p-3 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="mb-3 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10" />
                    <div className="space-y-2">
                      <div className="h-2 w-16 rounded-full bg-slate7" />
                      <div className="h-2 w-22 rounded-full bg-slate8" />
                    </div>
                  </motion.div>
                  <motion.div
                    className="translate-y-4 rounded-2xl border border-slateb bg-slate95 p-3 shadow-lg backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 4 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="mb-3 h-16 rounded-xl bg-gradient-to-br from-emerald-300/30 to-cyan-400/10" />
                    <div className="space-y-2">
                      <div className="h-2 w-14 rounded-full bg-slate7" />
                      <div className="h-2 w-10 rounded-full bg-slate8" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workflows Grid */}
      <section className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10">
        <motion.div
          className="flex flex-col gap-6 border-b border-slate7 pb-6 md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-slate2">Your Workflows</h2>
          <div className="flex flex-1 flex-wrap items-center gap-3 md:justify-end">
            <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-slateb bg-primary px-3 py-2 text-slate5 md:max-w-sm md:flex-none">
              <Search className="h-4 w-4" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-sm text-slate2 outline-none placeholder:text-slate5"
                placeholder="Search workflows..."
              />
            </div>
          </div>
        </motion.div>

        <div className="mt-4 sm:mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {/* New Workflow Card (hidden on mobile, flex on desktop) */}
          <motion.button
            onClick={createWorkflow}
            className="group hidden sm:flex min-h-[260px] flex-col justify-between rounded-2xl border border-slateb bg-primary p-5 text-left transition hover:-translate-y-1 hover:border-slate7 hover:shadow-md hover:shadow-blue-500/5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-start justify-between">
              <span className="rounded-xl border border-slateb bg-slate9 p-2.5 text-slate3">
                <FolderPlus className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white">New</span>
            </div>
            <div className="flex justify-center py-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slateb bg-slate9 text-2xl text-slate3 group-hover:border-blue-500/40 group-hover:text-blue-500 transition">+</div>
            </div>
            <div>
              <p className="text-lg font-bold text-slate3">New Workflow</p>
              <p className="mt-1 text-sm text-slate4">Start from a blank canvas.</p>
            </div>
          </motion.button>

          {/* Loading */}
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <span className="w-8 h-8 rounded-full border-3 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : null}

          {/* Workflow Cards */}
          <AnimatePresence>
            {filteredWorkflows.map((workflow, idx) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ y: -4 }}
                className="w-full flex"
              >
                <WorkflowCard
                  workflow={workflow}
                  onRenameSuccess={handleRenameSuccess}
                  onDeleteSuccess={handleDeleteSuccess}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && filteredWorkflows.length === 0 ? (
            <motion.div
              className="col-span-full p-8 text-center text-md text-slate4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No workflows found. Create a new workflow to get started.
            </motion.div>
          ) : null}

        </div>
      </section>
    </main>
  );
}
