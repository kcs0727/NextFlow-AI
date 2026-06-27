import { create } from 'zustand';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import { Creation } from '@/types';
import { WorkflowCard } from '@/types/workflow';

interface UserState {
  freeUsageCount: number;
  isPremium: boolean;

  incrementUsage: () => void;
  getuser: () => Promise<void>;
  fetchcreations: (
    setCreations: React.Dispatch<React.SetStateAction<Creation[]>>,
    setLoading: (l: boolean) => void
  ) => Promise<void>;

  tooglelikes: (
    id: string,
    userId: string,
    setCreations: React.Dispatch<React.SetStateAction<Creation[]>>
  ) => Promise<void>;

  getdashboarddata: (
    setCreations: React.Dispatch<React.SetStateAction<Creation[]>>,
    setLoading: (l: boolean) => void
  ) => Promise<void>;
  fetchWorkflows: () => Promise<WorkflowCard[]>;
  renameWorkflow: (id: string, name: string) => Promise<string | null>;
  deleteWorkflow: (id: string) => Promise<boolean>;
}


export const useUserStore = create<UserState>((set, get) => ({
  freeUsageCount: 0,
  isPremium: false,

  incrementUsage: () => set((state) => ({ freeUsageCount: state.freeUsageCount + 1 })),

  getuser: async () => {
    // Wait for 2 seconds before calling the get-user API to let webhooks finish database sync
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const { data } = await axios.get('/api/user/get-user');
      if (data.success) {
        set({
          isPremium: data.isPremium ?? false,
          freeUsageCount: data.freeUsageCount ?? 0,
        });
      }
    }
    catch (error: any) {
      console.error('getuser store error:', error);
    }
  },

  fetchcreations: async (setCreations, setLoading) => {
    try {
      const { data } = await axios.get('/api/user/get-published-creations');

      if (data.success) {
        setCreations(data.creations);
        if (data.isPremium !== undefined) {
          set({ isPremium: data.isPremium });
        }
      }
      else {
        toast.error(data.message);
      }
    }
    catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
    finally {
      setLoading(false);
    }
  },

  tooglelikes: async (id, userId, setCreations) => {
    try {
      const userIDStr = userId.toString();
      // Optimistic update
      setCreations((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
              ...c,
              likes: c.likes.includes(userIDStr)
                ? c.likes.filter((u) => u !== userIDStr)
                : [...c.likes, userIDStr],
            }
            : c
        )
      );

      const { data } = await axios.post('/api/user/toogle-liked-creations', { id });

      if (data.success) {
        toast.success(data.message);
      }
      else {
        toast.error(data.message);
        // Rollback / Refetch on error
        const refetchResult = await axios.get('/api/user/get-published-creations');
        if (refetchResult.data.success) setCreations(refetchResult.data.creations);
      }
    }
    catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
      const refetchResult = await axios.get('/api/user/get-published-creations');
      if (refetchResult.data.success) setCreations(refetchResult.data.creations);
    }
  },

  getdashboarddata: async (setCreations, setLoading) => {
    try {
      const { data } = await axios.get('/api/user/get-user-creations');

      if (data.success) {
        setCreations(data.creations);
        if (data.isPremium !== undefined) {
          set({ isPremium: data.isPremium });
        }
      }
      else {
        toast.error(data.message);
      }
    }
    catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
    finally {
      setLoading(false);
    }
  },

  fetchWorkflows: async () => {
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
    } 
    catch (error: any) {
      console.error('fetchWorkflows store error:', error);
      toast.error(error.response?.data?.error ?? error.message ?? "Failed to fetch workflows");
      return [];
    }
  },

  renameWorkflow: async (id: string, name: string) => {
    try {
      const { data } = await axios.patch(`/api/workflows/save/${id}`, { name });
      const updatedWorkflow = data.workflow;
      if (updatedWorkflow) {
        toast.success("Workflow renamed successfully");
        return updatedWorkflow.name;
      }
      return null;
    } 
    catch (error: any) {
      console.error('renameWorkflow store error:', error);
      toast.error(error.response?.data?.error ?? error.message ?? "Failed to rename workflow");
      return null;
    }
  },

  deleteWorkflow: async (id: string) => {
    try {
      const { data } = await axios.delete(`/api/workflows/save/${id}`);
      if (data.ok) {
        toast.success("Workflow deleted successfully");
        return true;
      }
      return false;
    } 
    catch (error: any) {
      console.error('deleteWorkflow store error:', error);
      toast.error(error.response?.data?.error ?? error.message ?? "Failed to delete workflow");
      return false;
    }
  },
}));

export default useUserStore;
