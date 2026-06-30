import { create } from 'zustand';

interface AiState {
  buttonLoading: boolean;
  setButtonLoading: (loading: boolean) => void;
}

export const useAiStore = create<AiState>((set) => ({
  buttonLoading: false,
  setButtonLoading: (loading) => set({ buttonLoading: loading }),
}));

export default useAiStore;
