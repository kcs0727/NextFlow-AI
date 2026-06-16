'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  House, 
  SquarePen, 
  Hash, 
  Image as ImageIcon, 
  Eraser, 
  Scissors, 
  FileText, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  Gem
} from 'lucide-react';
import useTheme from '@/hooks/useTheme';
import useUserStore from '@/store/userStore';

const navItems = [
  { to: '/ai', label: 'Dashboard', icon: House },
  { to: '/ai/write-article', label: 'Write Article', icon: SquarePen },
  { to: '/ai/blog-titles', label: 'Blog Titles', icon: Hash },
  { to: '/ai/generate-image', label: 'Generate Image', icon: ImageIcon },
  { to: '/ai/remove-background', label: 'Remove Background', icon: Eraser },
  { to: '/ai/remove-object', label: 'Remove Object', icon: Scissors },
  { to: '/ai/review-resume', label: 'Review Resume', icon: FileText },
  { to: '/ai/community', label: 'Community', icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {isPremium } = useUserStore();

  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-[#0c0c0e]">
        <span className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0c0c0e] text-slate-700 dark:text-slate-200 transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-6 min-h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 transition-colors duration-300 z-30">
        
        <Link href="/" className="flex items-center gap-2">
          <span className="font-sans font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            AI Workspace
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-amber-400 transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 sm:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar */}
        <aside className={`
          absolute sm:relative top-0 bottom-0 left-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900
          flex flex-col justify-between items-center transition-transform duration-300 ease-in-out z-20
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        `}>
          {/* Nav Items */}
          <div className="my-6 w-full overflow-y-auto px-4 flex-1">
            {user && (
              <div className="flex flex-col items-center mb-6 py-4 border-b border-slate-100 dark:border-slate-900/60">
                <img 
                  src={user.imageUrl} 
                  alt="Avatar" 
                  className="w-14 h-14 rounded-full shadow-inner border border-slate-200 dark:border-slate-800 mb-2 cursor-pointer"
                  onClick={() => openUserProfile()}
                />
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{user.fullName}</h4>
                <div className="flex items-center gap-1 mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-400">
                  {isPremium ? (
                    <span className="flex items-center gap-1 text-amber-500">
                      <Gem className="w-3 h-3 fill-amber-500" /> Premium Plan
                    </span>
                  ) : (
                    <span>Free Plan</span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1 font-medium text-sm">
              {navItems.map((item) => {
                const isActive = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      px-4 py-3 flex items-center gap-3 rounded-xl transition duration-205
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/10' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'}
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Account Info Footer */}
          {user && (
            <div className="w-full border-t border-slate-250/50 dark:border-slate-900 p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <div 
                onClick={() => openUserProfile()} 
                className="flex gap-2.5 items-center cursor-pointer group"
              >
                <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800" />
                <div className="max-w-[120px] truncate">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition">{user.firstName}</h5>
                  <p className="text-[10px] text-slate-405 dark:text-slate-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <button 
                onClick={() => signOut({ redirectUrl: '/' })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </aside>

        {/* Content Viewer */}
        <main className="flex-1 bg-slate-50 dark:bg-[#0c0c0e] overflow-y-auto relative p-6 transition-colors duration-300">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
