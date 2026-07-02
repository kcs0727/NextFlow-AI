import gradientBackground from './gradientBackground.png';
import user_group from './user_group.png';
import star_icon from './star_icon.svg';
import star_dull_icon from './star_dull_icon.svg';
import profile_img_1 from './profile_img_1.png';
import arrow_icon from './arrow_icon.svg';
import { SquarePen, Hash, Image, Eraser, Scissors, FileText, Workflow, LucideIcon } from 'lucide-react';

export const assets = {
  gradientBackground,
  user_group,
  star_icon,
  star_dull_icon,
  profile_img_1,
  arrow_icon,
};

export interface AiTool {
  title: string;
  description: string;
  Icon: LucideIcon;
  bg: { from: string; to: string };
  path: string;
}

export interface Testimonial {
  image: any;
  name: string;
  title: string;
  content: string;
  rating: number;
}

export const AiToolsData: AiTool[] = [
  {
    title: 'AI Article Writer',
    description: 'Generate high-quality, engaging articles on any topic with our AI writing technology.',
    Icon: SquarePen,
    bg: { from: '#3588F2', to: '#0BB0D7' },
    path: '/ai/write-article',
  },
  {
    title: 'Blog Title Generator',
    description: 'Find the perfect, catchy title for your blog posts with our AI-powered generator.',
    Icon: Hash,
    bg: { from: '#B153EA', to: '#E549A3' },
    path: '/ai/blog-titles',
  },
  {
    title: 'AI Image Generation',
    description: 'Create stunning visuals with our AI image generation tool. Experience the power of AI.',
    Icon: Image,
    bg: { from: '#20C363', to: '#11B97E' },
    path: '/ai/generate-image',
  },
  {
    title: 'Background Removal',
    description: 'Effortlessly remove backgrounds from your images with our AI-driven tool.',
    Icon: Eraser,
    bg: { from: '#F76C1C', to: '#F04A3C' },
    path: '/ai/remove-background',
  },
  {
    title: 'Object Removal',
    description: 'Remove unwanted objects from your images seamlessly with our AI object removal tool.',
    Icon: Scissors,
    bg: { from: '#5C6AF1', to: '#427DF5' },
    path: '/ai/remove-object',
  },
  {
    title: 'Resume Reviewer',
    description: 'Get your resume reviewed by AI to improve your chances of landing your dream job.',
    Icon: FileText,
    bg: { from: '#12B7AC', to: '#08B6CE' },
    path: '/ai/review-resume',
  },
  {
    title: 'Node Editor',
    description: 'Build visual AI workflows by chaining nodes — LLMs, image processing, video tools — into automated pipelines.',
    Icon: Workflow,
    bg: { from: '#0891B2', to: '#6366F1' },
    path: '/nodeeditor',
  },
];

export const dummyTestimonialData: Testimonial[] = [
  {
    image: assets.profile_img_1,
    name: 'John Doe',
    title: 'Marketing Director, TechCorp',
    content: 'NextFlow AI has revolutionized our content workflow. The quality of the articles is outstanding, and it saves us hours of work every week.',
    rating: 4,
  },
  {
    image: assets.profile_img_1,
    name: 'Jane Smith',
    title: 'Content Creator, TechCorp',
    content: 'NextFlow AI has made our content creation process effortless. The AI tools have helped us produce high-quality content faster than ever before.',
    rating: 5,
  },
  {
    image: assets.profile_img_1,
    name: 'David Lee',
    title: 'Content Writer, TechCorp',
    content: 'NextFlow AI has transformed our content creation process. The AI tools have helped us produce high-quality content faster than ever before.',
    rating: 4,
  },
];

export const faqData = [
  {
    question: 'What is NextFlow AI?',
    answer: 'NextFlow AI is an advanced AI-powered SaaS platform providing a comprehensive suite of tools for content creation, copy generation, image synthesis, photo manipulation, and resume evaluation.',
  },
  {
    question: 'How do the free tiers work?',
    answer: 'The Free Tier allows you to experience all 6 AI tools (including Image Generation, Background/Object Removal, and Resume Review) with a shared total limit of 10 generations. Upgrade to Premium for unlimited access.',
  },
  {
    question: 'How do I run an AI workflow in the Node Editor?',
    answer: 'Navigate to the Node Editor, add your desired nodes (such as LLM generation, image tools, etc.), connect their inputs and outputs, and click the "Run" button in the toolbar. You can execute the entire workflow, run only a single node, or run all upstream nodes leading to your selection.',
  },
  {
    question: 'Can I cancel my premium subscription anytime?',
    answer: 'Yes! Billing is handled natively through Clerk Stripe checkout. You can modify, upgrade, or cancel your subscription at any time via your user portal.',
  },
];
