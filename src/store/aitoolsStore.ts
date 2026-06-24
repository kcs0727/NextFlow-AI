import { create } from 'zustand';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import { SelectedLength } from '@/types';
import { useUserStore } from './userStore';

interface AiState {
  buttonLoading: boolean;
  setButtonLoading: (loading: boolean) => void;

  writearticle: (
    input: string,
    selectedLen: SelectedLength,
    setLoading: (l: boolean) => void,
    setContent: (c: string) => void
  ) => Promise<void>;

  blogtitles: (
    input: string,
    selectedCategory: string,
    setLoading: (l: boolean) => void,
    setContent: (c: string) => void
  ) => Promise<void>;

  generateimg: (
    input: string,
    publish: boolean,
    selectedStyle: string,
    setLoading: (l: boolean) => void,
    setContent: (c: string) => void
  ) => Promise<void>;

  removebg: (
    input: File,
    publish: boolean,
    setLoading: (l: boolean) => void,
    setContent: (c: string) => void
  ) => Promise<void>;

  removeobj: (
    input: File,
    obj: string,
    publish: boolean,
    setLoading: (l: boolean) => void,
    setContent: (c: string) => void
  ) => Promise<void>;

  reviewresume: (
    input: File,
    setLoading: (l: boolean) => void,
    setContent: (c: string) => void
  ) => Promise<void>;
}

export const useAiStore = create<AiState>((set, get) => ({
  buttonLoading: false,
  setButtonLoading: (loading) => set({ buttonLoading: loading }),

  writearticle: async (input, selectedLen, setLoading, setContent) => {
    setLoading(true);
    set({ buttonLoading: true });
    try {
      const prompt = `Write an article about ${input} in ${selectedLen.text}`;
      const length = selectedLen.length;

      const { data } = await axios.post('/api/ai/generate-article', { prompt, length });

      if (data.success) {
        setContent(data.content);
        toast.success('Article generated successfully!');
        useUserStore.setState({
          freeUsageCount: data.freeUsageCount,
          isPremium: data.isPremium ?? false,
        });
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
      set({ buttonLoading: false });
    }
  },

  blogtitles: async (input, selectedCategory, setLoading, setContent) => {
    setLoading(true);
    set({ buttonLoading: true });
    try {
      const prompt = `Generate the blog title for the keyword ${input} in the category ${selectedCategory}`;

      const { data } = await axios.post('/api/ai/generate-blog-titles', { prompt });

      if (data.success) {
        setContent(data.content);
        toast.success('Titles generated successfully!');
        useUserStore.setState({
          freeUsageCount: data.freeUsageCount,
          isPremium: data.isPremium ?? false,
        });
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
      set({ buttonLoading: false });
    }
  },

  generateimg: async (input, publish, selectedStyle, setLoading, setContent) => {
    setLoading(true);
    set({ buttonLoading: true });
    try {
      const prompt = `Generate an image of ${input} in the style of ${selectedStyle}`;

      const { data } = await axios.post('/api/ai/generate-image', { prompt, publish });

      if (data.success) {
        setContent(data.content);
        toast.success('Image generated successfully!');
        useUserStore.setState({
          freeUsageCount: data.freeUsageCount,
          isPremium: data.isPremium ?? false,
        });
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
      set({ buttonLoading: false });
    }
  },

  removebg: async (input, publish, setLoading, setContent) => {
    setLoading(true);
    set({ buttonLoading: true });
    try {
      const formData = new FormData();
      formData.append('image', input);
      formData.append('publish', publish ? 'true' : 'false');

      const { data } = await axios.post('/api/ai/remove-image-background', formData);

      if (data.success) {
        setContent(data.content);
        toast.success('Background removed successfully!');
        useUserStore.setState({
          freeUsageCount: data.freeUsageCount,
          isPremium: data.isPremium ?? false,
        });
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
      set({ buttonLoading: false });
    }
  },

  removeobj: async (input, obj, publish, setLoading, setContent) => {
    setLoading(true);
    set({ buttonLoading: true });
    try {
      const object = obj.trim();
      if (object.split(' ').length > 1) {
        toast.error('Please enter only one object name');
        setLoading(false);
        set({ buttonLoading: false });
        return;
      }
      const formData = new FormData();
      formData.append('image', input);
      formData.append('object', object);
      formData.append('publish', publish ? 'true' : 'false');

      const { data } = await axios.post('/api/ai/remove-image-object', formData);

      if (data.success) {
        setContent(data.content);
        toast.success('Object removed successfully!');
        useUserStore.setState({
          freeUsageCount: data.freeUsageCount,
          isPremium: data.isPremium ?? false,
        });
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
      set({ buttonLoading: false });
    }
  },

  reviewresume: async (input, setLoading, setContent) => {
    setLoading(true);
    set({ buttonLoading: true });
    try {
      const formData = new FormData();
      formData.append('resume', input);

      const { data } = await axios.post('/api/ai/review-resume', formData);

      if (data.success) {
        setContent(data.content);
        toast.success('Resume reviewed successfully!');
        useUserStore.setState({
          freeUsageCount: data.freeUsageCount,
          isPremium: data.isPremium ?? false,
        });
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
      set({ buttonLoading: false });
    }
  },
}));

export default useAiStore;
