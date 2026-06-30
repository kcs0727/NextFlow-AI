'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Hash, Sparkles } from 'lucide-react';
import { useAiStore } from '@/store/aitoolsStore';
import { blogtitles } from '@/services/aitools';
const blogCategories = [
  'General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food'
];

export default function BlogTitles() {
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { buttonLoading } = useAiStore();

  const onsubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await blogtitles(input, selectedCategory, setLoading, setContent);
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
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h1 className="text-xl font-bold text-slate1">AI Title Generator</h1>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate3">Keyword</label>
            <input
              type="text"
              className="w-full p-3 mt-2 outline-none text-sm rounded-xl border border-slateb bg-slate95 text-slate3 focus:border-purple-950 focus:ring-1 focus:ring-purple-500 transition duration-200"
              placeholder="e.g., SEO, weight loss, budget traveling..."
              required
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate3">Category</label>
            <div className="mt-3 flex gap-3 flex-wrap">
              {blogCategories.map((item) => (
                <span
                  key={item}
                  className={`text-xs px-4 py-2 border rounded-full cursor-pointer transition font-medium
                    ${selectedCategory === item
                      ? "dark:bg-purple-950/20 dark:border-purple-900/50 bg-purple-50 border-purple-300 text-purple-700 font-bold"
                      : 'text-slate4 border-slateb hover:bg-slate9'}`}
                  onClick={() => setSelectedCategory(item)}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-500 text-white px-5 py-3 mt-8 text-sm font-semibold rounded-xl cursor-pointer shadow-md shadow-purple-500/10 hover:shadow-lg disabled:opacity-50 transition"
          disabled={buttonLoading}
        >
          {loading ? (
            <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Hash className="w-4 h-4" />
          )}
          Generate Titles
        </button>
      </form>

      {/* Generated Titles Display */}
      <div className="flex-1 p-6 bg-primary rounded-2xl border border-slateb shadow-sm flex flex-col min-h-[400px]">
        <div className="flex items-center gap-3 pb-4 border-b border-slateb">
          <Hash className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-bold text-slate1">Generated Titles</h2>
        </div>

        {!content ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-slate4 ">
            <Hash className="w-10 h-10 mb-4 opacity-50 text-purple-500" />
            <p className="text-sm">Enter a keyword topic and click “Generate Titles” to get started.</p>
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
