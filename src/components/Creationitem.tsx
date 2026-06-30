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


export default function Creationitem({ item }: CreationItemProps) {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = typeIcons[item.type] || FileText;

  const typeColors: Record<string, string> = {
  article: `dark:bg-blue-950/35 dark:border-blue-900/50 bg-blue-50 border-blue-300 text-blue-500`  ,
  'blog-titles': `dark:bg-purple-950/20 dark:border-purple-900/50 bg-purple-50 border-purple-300 text-purple-700`,
  image: `dark:bg-green-950/20 dark:border-green-900/50 bg-green-50 border-green-300 text-green-500`,
  'review-resume': `dark:bg-teal-950/20 dark:border-teal-900/50 bg-teal-50 border-teal-300 text-teal-500`,
};
  const colorClass = typeColors[item.type] || 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400';

  return (
    <div 
      className="p-5 bg-primary border border-slateb rounded-xl cursor-pointer hover:border-slate7 transition"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-lg ${colorClass} border`}>
            <IconComponent className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base text-slate3 leading-snug">
              {item.prompt}
            </h4>
            <p className="text-xs text-slate4 mt-1 font-sans">
              {item.type.toUpperCase()} • {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`hidden sm:inline-block text-xs px-3.5 py-1.5 border rounded-full font-semibold ${colorClass}`}>
            {item.type}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate4" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate4" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-5 pt-4 border-t border-slateb transition-all">
          {item.type === 'image' ? (
            <div className="rounded-lg overflow-hidden border border-slateb max-w-md bg-slate95">
              <img 
                src={item.content} 
                alt="AI Generated Visual" 
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="text-sm text-slate3 leading-relaxed font-sans prose max-w-none max-h-96 overflow-y-auto pr-2">
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
