'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp, Image as ImageIcon, FileText, Hash, SquarePen } from 'lucide-react';

import { Creation } from '@/types';

interface CreationItemProps {
  item: Creation;
}

const typeIcons: Record<string, any> = {
  article: SquarePen,
  'blog-titles': Hash,
  image: ImageIcon,
  'review-resume': FileText,
};

const typeColors: Record<string, string> = {
  article: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400',
  'blog-titles': 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/20 dark:border-purple-900/50 dark:text-purple-400',
  image: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-400',
  'review-resume': 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/20 dark:border-teal-900/50 dark:text-teal-400',
};

export default function Creationitem({ item }: CreationItemProps) {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = typeIcons[item.type] || FileText;
  const colorClass = typeColors[item.type] || 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400';

  return (
    <div 
      className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-lg ${colorClass} border`}>
            <IconComponent className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-250 leading-snug">
              {item.prompt}
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-sans">
              {item.type.toUpperCase()} • {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`hidden sm:inline-block text-xs px-3.5 py-1.5 border rounded-full font-semibold ${colorClass}`}>
            {item.type}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 transition-all">
          {item.type === 'image' ? (
            <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-w-md bg-slate-100 dark:bg-slate-950">
              <img 
                src={item.content} 
                alt="AI Generated Visual" 
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-sans prose dark:prose-invert max-w-none max-h-96 overflow-y-auto pr-2">
              <div className="reset-tw">
                <ReactMarkdown>{item.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export { Creationitem };
