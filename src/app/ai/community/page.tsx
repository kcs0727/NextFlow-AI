'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Heart, Image as ImageIcon, Flame, MessageSquare, Compass } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { Creation } from '@/types';

export default function Community() {
  const [creations, setCreations] = useState<Creation[]>([]);
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);

  const { fetchcreations, tooglelikes } = useUserStore();

  useEffect(() => {
    if (isLoaded && user) {
      fetchcreations(setCreations, setLoading);
    }
  }, [user, isLoaded]);

  const tooglelikesHandler = async (id: string) => {
    if (!user) return;
    await tooglelikes(id, user.id, setCreations);
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <span className="w-10 h-10 rounded-full border-3 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full text-slate-700 dark:text-slate-205">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-805 dark:text-slate-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-500" /> Community Creations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse through beautiful graphics generated publicly by the EdgeAI community.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 min-h-[500px]">
        {creations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-16 text-slate-400 h-full">
            <ImageIcon className="w-12 h-12 mb-4 opacity-30 text-blue-500 animate-pulse" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">No public creations yet</h3>
            <p className="text-xs text-slate-450 max-w-sm">
              Generate an image using the Text-to-Image tool and toggle the &quot;Make public&quot; options to showcase your work here!
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {creations.map((creation) => {
              const isLiked = user ? creation.likes.includes(user.id) : false;
              return (
                <div 
                  key={creation.id} 
                  className="break-inside-avoid relative group rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <img 
                    src={creation.content} 
                    alt={creation.prompt} 
                    className="w-full h-auto object-cover max-h-[400px] select-none"
                    loading="lazy"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-all duration-300">
                    <p className="text-xs text-slate-200 font-medium leading-relaxed line-clamp-3 mb-4">
                      {creation.prompt}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                        {creation.type}
                      </span>
                      
                      <div className="flex items-center gap-2 text-white">
                        <span className="text-xs font-bold">{creation.likes.length}</span>
                        <button
                          onClick={() => tooglelikesHandler(creation.id)}
                          className="p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
                        >
                          <Heart 
                            className={`w-5 h-5 active:scale-125 transition-transform duration-150
                              ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} 
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
