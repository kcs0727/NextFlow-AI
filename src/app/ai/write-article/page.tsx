'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Edit, Sparkles, AlertCircle } from 'lucide-react';
import { useAiStore } from '@/store/aitoolsStore';
import { SelectedLength } from '@/types';
import { useTheme } from 'next-themes';

const articleLengthOptions: SelectedLength[] = [
  { length: 800, text: 'Short (500-800 words)' },
  { length: 1200, text: 'Medium (800-1200 words)' },
  { length: 1600, text: 'Long (1200+ words)' },
];

export default function WriteArticle() {
  const [selectedLen, setSelectedLen] = useState<SelectedLength>(articleLengthOptions[0]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const { theme: nextTheme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme ?? nextTheme ?? "dark";

  const { writearticle, buttonLoading } = useAiStore();

  const onsubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await writearticle(input, selectedLen, setLoading, setContent);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full text-slate3">

      {/* Configuration Form */}
      <form
        onSubmit={onsubmitHandler}
        className="w-full lg:max-w-md p-6 bg-primary rounded-2xl border border-slateb  shadow-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h1 className="text-xl font-bold text-slate1">Article Configuration</h1>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate3">Article Topic</label>
            <input
              type="text"
              className="w-full p-3 mt-2 outline-none text-sm rounded-xl border border-slateb bg-slate95 text-slate3 focus:border-blue-950 focus:ring-1 focus:ring-blue-500 transition duration-200"
              placeholder="e.g., Deep learning in healthcare, Travel tips for Japan..."
              required
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate3">Article Length</label>
            <div className="mt-3 flex gap-3 flex-wrap">
              {articleLengthOptions.map((item) => (
                <span
                  key={item.text}
                  className={`text-xs px-4 py-2 border rounded-full cursor-pointer transition font-medium
                    ${selectedLen.text === item.text
                      ? `${currentTheme === 'dark' ? 'bg-blue-950/35 border-blue-900/50' : 'bg-blue-50 border-blue-300'} text-blue-500 font-bold`
                      : 'text-slate4 border-slateb hover:bg-slate9'}`}
                  onClick={() => setSelectedLen(item)}
                >
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-700 hover:to-blue-500 text-white px-5 py-3 mt-8 text-sm font-semibold rounded-xl cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-lg disabled:opacity-50 transition"
          disabled={buttonLoading}
        >
          {loading ? (
            <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Edit className="w-4 h-4" />
          )}
          Generate Article
        </button>
      </form>

      {/* Generated Article Display */}
      <div className="flex-1 p-6 bg-primary rounded-2xl border border-slateb shadow-sm flex flex-col min-h-[400px]">
        <div className="flex items-center gap-3 pb-4 border-b border-slateb">
          <Edit className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-slate1">Generated Article</h2>
        </div>

        {!content ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-slate4">
            <Edit className="w-10 h-10 mb-4 opacity-50 text-blue-500" />
            <p className="text-sm">Enter a topic and click “Generate Article” to get started.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mt-4 pr-2 text-sm leading-relaxed text-slate3 prose max-w-none">
            <div className="reset-tw">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
