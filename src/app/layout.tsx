import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import UserSync from '@/components/UserSync';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'EdgeAI - Reimagining Content with AI',
  description: 'Unleash your content potential. Write articles, remove backgrounds, review resumes, and generate visuals instantly.',
  keywords: ['AI Article Generator', 'Blog Title Generator', 'Object Removal AI', 'Resume Reviewer', 'Cloudinary transform', 'Gemini AI'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
        <body className="min-h-full bg-slate-50 text-slate-900 font-sans dark:bg-[#0c0c0e] dark:text-slate-100 transition-colors duration-300">
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <UserSync />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
