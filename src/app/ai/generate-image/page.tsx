'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { useAiStore } from '@/store/aiStore';

const imageStyleOptions = [
  'Realistic', 'Ghibli style', 'Anime style', 'Cartoon style', 'Fantasy style', '3D style', 'Portrait style'
];

export default function GenerateImg() {
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [input, setInput] = useState('');
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { generateimg, buttonLoading } = useAiStore();

  const onsubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await generateimg(input, publish, selectedStyle, setLoading, setContent);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full text-slate-700 dark:text-slate-350">
      
      {/* Configuration Form */}
      <form 
        onSubmit={onsubmitHandler} 
        className="w-full lg:max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI Image Generator</h1>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate-650 dark:text-slate-400">Describe Your Image</label>
            <textarea 
              rows={4} 
              className="w-full p-3 mt-2 outline-none text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200 resize-none"
              placeholder="e.g., A golden retriever wearing sunglasses sitting on a beach chair, cinematic lighting..." 
              required 
              onChange={(e) => setInput(e.target.value)} 
              value={input} 
            />
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate-650 dark:text-slate-400">Style</label>
            <div className="mt-3 flex gap-3 flex-wrap">
              {imageStyleOptions.map((item) => (
                <span 
                  key={item} 
                  className={`text-xs px-4 py-2 border rounded-full cursor-pointer transition font-medium
                    ${selectedStyle === item 
                      ? 'bg-green-50 border-green-300 text-green-605 dark:bg-green-950/35 dark:border-green-900/50 dark:text-green-450 font-bold' 
                      : 'text-slate-505 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'}`} 
                  onClick={() => setSelectedStyle(item)}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Toggle Public Visibility */}
          <div className="my-6 flex items-center gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/60">
            <label className="relative cursor-pointer inline-flex items-center">
              <input 
                type="checkbox" 
                onChange={(e) => setPublish(e.target.checked)} 
                checked={publish} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-800 rounded-full peer-checked:bg-green-500 transition-colors"></div>
              <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
            </label>
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Make this image public on Community Feed</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-600 to-green-450 hover:from-green-700 hover:to-green-500 text-white px-5 py-3 mt-4 text-sm font-semibold rounded-xl cursor-pointer shadow-md shadow-green-500/10 hover:shadow-lg disabled:opacity-50 transition" 
          disabled={buttonLoading}
        >
          {loading ? (
            <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
          Generate Image
        </button>
      </form>

      {/* Generated Image Display */}
      <div className="flex-1 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[400px]">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <ImageIcon className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Generated Visual</h2>
        </div>

        {!content ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-slate-400">
            <ImageIcon className="w-10 h-10 mb-4 opacity-50 text-emerald-500" />
            <p className="text-sm">Describe an image and click “Generate Image” to get started.</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center mt-6">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-md bg-slate-50 dark:bg-slate-950 shadow-inner">
              <img 
                src={content} 
                alt="AI Generated Visual" 
                className="w-full h-auto object-contain max-h-[450px]"
                loading="eager"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
