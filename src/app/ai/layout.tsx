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
import useUserStore from '@/store/userStore';
import { useTheme } from "next-themes";

const navItems = [
  { to: '/ai', label: 'Dashboard', icon: House, color: 'text-secondary' },
  { to: '/ai/write-article', label: 'Write Article', icon: SquarePen, color: 'text-blue-500' },
  { to: '/ai/blog-titles', label: 'Blog Titles', icon: Hash, color: 'text-purple-500' },
  { to: '/ai/generate-image', label: 'Generate Image', icon: ImageIcon, color: 'text-emerald-500' },
  { to: '/ai/remove-background', label: 'Remove Background', icon: Eraser, color: 'text-red-500' },
  { to: '/ai/remove-object', label: 'Remove Object', icon: Scissors, color: 'text-indigo-500' },
  { to: '/ai/review-resume', label: 'Review Resume', icon: FileText, color: 'text-teal-500' },
  { to: '/ai/community', label: 'Community', icon: Users, color: 'text-yellow-500' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isPremium } = useUserStore();
  const { theme: nextTheme, setTheme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme ?? nextTheme ?? "dark";


  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate95">
        <span className="w-10 h-10 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-primary text-slate2 transition-colors duration-300">

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-6 min-h-16 bg-primary border-b border-slateb transition-colors duration-300 z-30">

        <Link href="/" className="flex items-center gap-2">
          <span className="font-sans font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            AI Workspace
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full cursor-pointer bg-slate8"
            aria-label="Toggle theme"
          >
            {currentTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 " /> : <Moon className="w-4 h-4 text-slate-900" />}
          </button>

          <button
            className="p-2 text-slate3 hover:text-slate2 sm:hidden"
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
          absolute sm:relative top-0 bottom-0 left-0 w-64 bg-primary border-r border-slateb
          flex flex-col justify-between items-center transition-transform duration-300 ease-in-out z-20
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        `}>
          {/* Nav Items */}
          <div className="my-6 w-full overflow-y-auto px-4 flex-1">
            {user && (
              <div className="flex flex-col items-center mb-6 py-4 border-b border-slateb">
                <img
                  src={user.imageUrl}
                  alt="Avatar"
                  className="w-14 h-14 rounded-full shadow-inner border border-slateb mb-2 cursor-pointer"
                  onClick={() => openUserProfile()}
                />
                <h4 className="font-semibold text-sm text-slate1">{user.fullName}</h4>
                <div className="flex items-center gap-1 mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate9 text-slate3">
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
                        : 'text-slate3 hover:bg-slate9 hover:text-slate2'}
                    `}
                  >
                    <item.icon className={`w-4 h-4 ${!isActive && item.color}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Account Info Footer */}
          {user && (
            <div className="w-full border-t border-slateb p-4 flex items-center justify-between">
              <div
                onClick={() => openUserProfile()}
                className="flex gap-2.5 items-center cursor-pointer group"
              >
                <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full border border-slateb" />
                <div className="max-w-[120px] truncate">
                  <h5 className="text-xs font-bold text-slate2 group-hover:text-slate1 transition">{user.firstName}</h5>
                  <p className="text-[10px] text-slate5 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="p-1.5 rounded-lg text-slate4 hover:text-red-500 hover:bg-red-950/20 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </aside>

        {/* Content Viewer */}
        <main className="flex-1 bg-primarybg overflow-y-auto relative p-6 transition-colors duration-300">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
