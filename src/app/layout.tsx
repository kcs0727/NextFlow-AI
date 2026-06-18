import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import UserSync from '@/components/UserSync';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast-provider';

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
        <body className="min-h-full bg-primary text-secondary font-sans  transition-colors duration-300">
          <UserSync />
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
