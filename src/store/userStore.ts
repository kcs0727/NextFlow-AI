import { create } from 'zustand';
import axios from '@/lib/axios';

interface UserState {
  freeUsageCount: number;
  isPremium: boolean;

  incrementUsage: () => void;
  getuser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
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
}));

export default useUserStore;
