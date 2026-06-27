'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MoreVertical, Trash2, WandSparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';
import { WorkflowCard as WorkflowCardType } from '@/types/workflow';

interface WorkflowCardProps {
  workflow: WorkflowCardType;
  onRenameSuccess: (id: string, newName: string) => void;
  onDeleteSuccess: (id: string) => void;
}

export default function WorkflowCard({
  workflow,
  onRenameSuccess,
  onDeleteSuccess,
}: WorkflowCardProps) {
  const router = useRouter();
  const { renameWorkflow, deleteWorkflow } = useUserStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(workflow.name);
  const [isSavingRename, setIsSavingRename] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingWorkflow, setIsDeletingWorkflow] = useState(false);

  const handleOpen = () => {
    router.push(`/nodeeditor/editor/${workflow.id}`);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextName = renameValue.trim();
    if (!nextName || nextName === workflow.name) {
      setIsRenaming(false);
      return;
    }

    setIsSavingRename(true);
    const successName = await renameWorkflow(workflow.id, nextName);
    setIsSavingRename(false);
    if (successName) {
      onRenameSuccess(workflow.id, successName);
      setIsRenaming(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeletingWorkflow(true);
    const success = await deleteWorkflow(workflow.id);
    setIsDeletingWorkflow(false);
    if (success) {
      onDeleteSuccess(workflow.id);
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpen();
        }
      }}
      className={cn(
        "group relative rounded-2xl border border-slateb bg-primary transition hover:border-slate7 hover:shadow-md hover:shadow-blue-500/5 cursor-pointer select-none",
        // Desktop style
        "sm:flex sm:flex-col sm:justify-between sm:min-h-[260px] sm:p-5",
        // Mobile style
        "flex flex-row items-center justify-between p-4 gap-4 min-h-0 w-full"
      )}
    >
      {/* In-Card Overlays */}
      <AnimatePresence>
        {isRenaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-20 flex flex-col justify-between bg-slate95 border border-slate7 rounded-2xl p-4"
          >
            {/* Desktop View Form */}
            <form onSubmit={handleRename} className="hidden sm:flex flex-col justify-between h-full w-full">
              <div>
                <h4 className="text-xs font-bold text-slate2 uppercase tracking-wide">Rename Workflow</h4>
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                  required
                  className="mt-2 w-full rounded-lg border border-slateb bg-slate9 px-3 py-1.5 text-xs text-slate2 outline-none focus:border-blue-500/50"
                  placeholder="Workflow name"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsRenaming(false)}
                  disabled={isSavingRename}
                  className="rounded-lg border border-slateb px-2.5 py-1 text-xs text-slate4 hover:bg-slate8 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRename || !renameValue.trim()}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSavingRename ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>

            {/* Mobile View Form (Horizontal / Row layout) */}
            <form onSubmit={handleRename} className="flex sm:hidden items-center justify-between gap-2 h-full w-full">
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                required
                className="flex-1 rounded-lg border border-slateb bg-slate9 px-2 py-1 text-xs text-slate2 outline-none focus:border-blue-500/50 min-w-0"
                placeholder="Workflow name"
              />
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsRenaming(false)}
                  disabled={isSavingRename}
                  className="rounded-lg border border-slateb bg-primary px-2 py-1 text-[11px] text-slate4 hover:bg-slate8 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRename || !renameValue.trim()}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-1 text-[11px] font-semibold text-white transition disabled:opacity-50"
                >
                  {isSavingRename ? '...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {isDeleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-20 flex flex-col justify-between bg-slate95 border border-slate7 rounded-2xl p-4"
          >
            {/* Desktop View Delete */}
            <div className="hidden sm:flex flex-col justify-between h-full w-full">
              <div className="flex items-start gap-2">
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate2 uppercase tracking-wide">Delete Workflow?</h4>
                  <p className="text-[10px] text-slate4 mt-1 leading-snug">
                    Cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleting(false)}
                  disabled={isDeletingWorkflow}
                  className="rounded-lg border border-slateb bg-primary px-2.5 py-1 text-xs text-slate4 hover:bg-slate8 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeletingWorkflow}
                  className="rounded-lg bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-400 transition"
                >
                  {isDeletingWorkflow ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            {/* Mobile View Delete */}
            <div className="flex sm:hidden items-center justify-between gap-2 h-full w-full">
              <div className="flex items-center gap-1.5 min-w-0">
                <Trash2 className="h-4 w-4 text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-slate2 truncate">Delete?</span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDeleting(false)}
                  disabled={isDeletingWorkflow}
                  className="rounded-lg border border-slateb bg-primary px-2 py-1 text-[11px] text-slate4 hover:bg-slate8 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeletingWorkflow}
                  className="rounded-lg bg-rose-500/20 hover:bg-rose-500/30 px-2.5 py-1 text-[11px] font-semibold text-rose-400 transition"
                >
                  {isDeletingWorkflow ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main card contents */}
      {/* 1. Header icon and PC Menu dropdown (top right in PC view) */}
      <div className="flex sm:w-full items-center justify-between gap-3 sm:items-start shrink-0">
        <div className="rounded-xl border border-slateb bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-2.5 sm:p-3 text-slate3">
          <WandSparkles className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </div>

        {/* Menu button for PC view (top right) */}
        <div className="hidden sm:block relative">
          <button
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="rounded-full border border-slateb bg-slate9 p-1.5 sm:p-2 text-slate4 sm:opacity-0 group-hover:opacity-100 transition hover:bg-slate8"
          >
            <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30 bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div
                onClick={(event) => event.stopPropagation()}
                className="absolute right-0 top-11 z-40 w-44 rounded-2xl border border-slateb bg-slate95 p-2 shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsRenaming(true);
                    setRenameValue(workflow.name);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate3 transition hover:bg-slate8"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsDeleting(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-400 transition hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Title & metadata info */}
      <div className="flex-1 min-w-0 sm:mt-2 text-left">
        <p className="text-base sm:text-lg md:text-xl font-bold text-slate3 group-hover:text-blue-500 transition truncate leading-snug">
          {workflow.name}
        </p>
        <p className="mt-1 text-[11px] sm:text-xs text-slate4 truncate">
          Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
        </p>
        <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate5">
          <span>{workflow.runCount ?? 0} runs</span>
          <span className="h-1 w-1 rounded-full bg-slate7 hidden sm:inline-block" />
          <span className="hidden sm:inline-block">Created {formatDistanceToNow(new Date(workflow.createdAt), { addSuffix: true })}</span>
        </div>
      </div>

      {/* 3. Bottom actions (PC: Open editor link. Mobile: Menu dropdown at right end) */}
      <div className="flex items-center gap-2 sm:w-full sm:justify-between sm:pt-2 sm:border-t sm:border-slateb/50 shrink-0">
        <span className="hidden sm:inline-block text-xs font-medium text-slate5 group-hover:text-blue-500 transition">
          Open editor
        </span>

        {/* Menu button for Mobile view (placed at right-most, bottom) */}
        <div className="sm:hidden relative">
          <button
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="rounded-full border border-slateb bg-slate9 p-1.5 text-slate4 transition hover:bg-slate8"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30 bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div
                onClick={(event) => event.stopPropagation()}
                className="absolute right-0 bottom-8 z-40 w-36 rounded-xl border border-slateb bg-slate95 p-1.5 shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsRenaming(true);
                    setRenameValue(workflow.name);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-slate3 transition hover:bg-slate8"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsDeleting(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-rose-400 transition hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>

        <ChevronRight className="h-4.5 w-4.5 text-slate5 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
      </div>
    </div>
  );
}
