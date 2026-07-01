import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import { SelectedLength, Creation } from '@/types';
import { useAiStore } from '@/store/aitoolsStore';
import { useUserStore } from '@/store/userStore';

export async function getdashboarddata(
  setCreations: React.Dispatch<React.SetStateAction<Creation[]>>,
  setLoading: (l: boolean) => void
): Promise<void> {
  try {
    const { data } = await axios.get('/api/ai/get-user-creations');

    if (data.success) {
      setCreations(data.creations);
      if (data.isPremium !== undefined) {
        useUserStore.setState({ isPremium: data.isPremium });
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
}

export async function writearticle(
  input: string,
  selectedLen: SelectedLength,
  setLoading: (l: boolean) => void,
  setContent: (c: string) => void
): Promise<void> {
  setLoading(true);
  useAiStore.setState({ buttonLoading: true });
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
    } else {
      toast.error(data.message);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || error.message);
  } finally {
    setLoading(false);
    useAiStore.setState({ buttonLoading: false });
  }
}

export async function blogtitles(
  input: string,
  selectedCategory: string,
  setLoading: (l: boolean) => void,
  setContent: (c: string) => void
): Promise<void> {
  setLoading(true);
  useAiStore.setState({ buttonLoading: true });
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
    } else {
      toast.error(data.message);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || error.message);
  } finally {
    setLoading(false);
    useAiStore.setState({ buttonLoading: false });
  }
}

export async function generateimg(
  input: string,
  publish: boolean,
  selectedStyle: string,
  setLoading: (l: boolean) => void,
  setContent: (c: string) => void
): Promise<void> {
  setLoading(true);
  useAiStore.setState({ buttonLoading: true });
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
    } else {
      toast.error(data.message);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || error.message);
  } finally {
    setLoading(false);
    useAiStore.setState({ buttonLoading: false });
  }
}

export async function removebg(
  input: File,
  publish: boolean,
  setLoading: (l: boolean) => void,
  setContent: (c: string) => void
): Promise<void> {
  setLoading(true);
  useAiStore.setState({ buttonLoading: true });
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
    } else {
      toast.error(data.message);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || error.message);
  } finally {
    setLoading(false);
    useAiStore.setState({ buttonLoading: false });
  }
}

export async function removeobj(
  input: File,
  obj: string,
  publish: boolean,
  setLoading: (l: boolean) => void,
  setContent: (c: string) => void
): Promise<void> {
  setLoading(true);
  useAiStore.setState({ buttonLoading: true });
  try {
    const object = obj.trim();
    if (object.split(' ').length > 1) {
      toast.error('Please enter only one object name');
      setLoading(false);
      useAiStore.setState({ buttonLoading: false });
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
    } else {
      toast.error(data.message);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || error.message);
  } finally {
    setLoading(false);
    useAiStore.setState({ buttonLoading: false });
  }
}

export async function reviewresume(
  input: File,
  setLoading: (l: boolean) => void,
  setContent: (c: string) => void
): Promise<void> {
  setLoading(true);
  useAiStore.setState({ buttonLoading: true });
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
    } else {
      toast.error(data.message);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || error.message);
  } finally {
    setLoading(false);
    useAiStore.setState({ buttonLoading: false });
  }
}

export async function fetchcreations(
  setCreations: React.Dispatch<React.SetStateAction<Creation[]>>,
  setLoading: (l: boolean) => void
): Promise<void> {
  try {
    const { data } = await axios.get('/api/ai/get-published-creations');

    if (data.success) {
      setCreations(data.creations);
      if (data.isPremium !== undefined) {
        useUserStore.setState({ isPremium: data.isPremium });
      }
    } else {
      toast.error(data.message);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || error.message);
  } finally {
    setLoading(false);
  }
}

export async function tooglelikes(
  id: string,
  userId: string,
  setCreations: React.Dispatch<React.SetStateAction<Creation[]>>
): Promise<void> {
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

    const { data } = await axios.post('/api/ai/toogle-liked-creations', { id });

    if (data.success) {
      toast.success(data.message);
    } else {
      toast.error(data.message);
      // Rollback / Refetch on error
      const refetchResult = await axios.get('/api/ai/get-published-creations');
      if (refetchResult.data.success) setCreations(refetchResult.data.creations);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || error.message);
    const refetchResult = await axios.get('/api/ai/get-published-creations');
    if (refetchResult.data.success) setCreations(refetchResult.data.creations);
  }
}
