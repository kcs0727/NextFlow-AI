'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Gem, Sparkles, FolderOpen, AlertCircle } from 'lucide-react';
import { Creationitem } from '@/components/Creationitem';
import { useUserStore } from '@/store/userStore';
import { Creation } from '@/types';

export default function Dashboard() {
  const { user } = useUser();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  const { getdashboarddata, freeUsageCount, isPremium } = useUserStore();

  useEffect(() => {
    getdashboarddata(setCreations, setLoading);
  }, []);

  const filteredCreations = creations.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'articles') return item.type === 'article';
    if (filter === 'titles') return item.type === 'blog-titles';
    if (filter === 'images') return item.type === 'image';
    if (filter === 'resume') return item.type === 'review-resume';
    if (filter === 'published') return item.publish === true;
    return true;
  });

  return (
    <div className="flex flex-col h-full gap-6">
      
      <div>
        <h1 className="text-2xl font-bold font-sans text-slate1">
          Welcome back, {user?.firstName || 'Creator'}!
        </h1>
        <p className="text-sm text-slate4 mt-1">
          Here is a summary of your workspace statistics and recent generations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Creations */}
        <div className="flex justify-between items-center py-5 px-6 bg-primary rounded-2xl border border-slateb shadow-sm transition">
          <div>
            <p className="text-xs font-semibold text-slate4 uppercase tracking-wider">Total Creations</p>
            <h2 className="text-2xl font-extrabold text-slate3 mt-1">{creations.length}</h2>
          </div>
          <div className="size-12 rounded-xl bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center shadow-md shadow-blue-500/10">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Active Plan */}
        <div className="flex justify-between items-center py-5 px-6 bg-primary rounded-2xl border border-slateb shadow-sm transition">
          <div>
            <p className="text-xs font-semibold text-slate4 uppercase tracking-wider">Active Plan</p>
            <h2 className="text-2xl font-extrabold text-slate3 mt-1">
              {isPremium ? 'Premium' : `Free (${Math.max(0, 10 - freeUsageCount)} left)`}
            </h2>
          </div>
          <div className={`size-12 rounded-xl text-white flex justify-center items-center shadow-md 
            ${isPremium 
              ? 'bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] shadow-purple-500/10' 
              : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/15'}`}
          >
            <Gem className="w-5 h-5" />
          </div>
        </div>

        {/* Rate Limits info */}
        <div className="flex justify-between items-center py-5 px-6 bg-primary rounded-2xl border border-slateb shadow-sm transition">
          <div>
            <p className="text-xs font-semibold text-slate4 uppercase tracking-wider">API Usage Tier</p>
            <h2 className="text-2xl font-bold text-slate3 mt-1">
              {isPremium ? '40 Requests / min' : '5 Requests / min'}
            </h2>
          </div>
          <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex justify-center items-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Recent Creations list */}
      <div className="flex-1 flex flex-col min-h-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate2 font-sans">Recent Generations</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-primary border border-slateb rounded-xl px-3 py-1.5 text-sm text-slate3 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition cursor-pointer"
          >
            <option value="all">All Creations</option>
            <option value="articles">Articles</option>
            <option value="titles">Blog Titles</option>
            <option value="images">Images</option>
            <option value="resume">Resume Reviews</option>
            <option value="published">Published</option>
          </select>
        </div>
        
        {loading ? (
          <div className="flex-1 flex justify-center items-center min-h-[200px]">
            <span className="w-10 h-10 rounded-full border-3 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : filteredCreations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slateb rounded-2xl p-10 bg-primary text-center min-h-[250px]">
            <FolderOpen className="w-12 h-12 text-slate7 mb-4" />
            <h4 className="font-bold text-slate3 mb-1">No creations found</h4>
            <p className="text-xs text-slate4 max-w-sm">
              No creations match the selected filter. Create something new or try another filter!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCreations.map((item) => (
              <Creationitem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
