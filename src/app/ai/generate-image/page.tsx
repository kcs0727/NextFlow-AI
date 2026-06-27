'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { useAiStore } from '@/store/aitoolsStore';
import { useTheme } from 'next-themes';

const imageStyleOptions = [
  'Realistic', 'Ghibli style', 'Anime style', 'Cartoon style', 'Fantasy style', '3D style', 'Portrait style'
];

export default function GenerateImg() {
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [input, setInput] = useState('');
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const { theme: nextTheme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme ?? nextTheme ?? "dark";

  const { generateimg, buttonLoading } = useAiStore();

  const onsubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await generateimg(input, publish, selectedStyle, setLoading, setContent);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full text-slate3">

      {/* Configuration Form */}
      <form
        onSubmit={onsubmitHandler}
        className="w-full lg:max-w-md p-6 bg-primary rounded-2xl border border-slateb shadow-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-bold text-slate1">AI Image Generator</h1>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate3">Describe Your Image</label>
            <textarea
              rows={4}
              className="w-full p-3 mt-2 outline-none text-sm rounded-xl border border-slateb bg-slate95 text-slate3 focus:border-emerald-950 focus:ring-1 focus:ring-emerald-500 transition duration-200 resize-none"
              placeholder="e.g., A golden retriever wearing sunglasses sitting on a beach chair, cinematic lighting..."
              required
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate3">Style</label>
            <div className="mt-3 flex gap-3 flex-wrap">
              {imageStyleOptions.map((item) => (
                <span
                  key={item}
                  className={`text-xs px-4 py-2 border rounded-full cursor-pointer transition font-medium
                    ${selectedStyle === item
                      ? `${currentTheme === 'dark' ? 'bg-green-950/20 border-green-900/50' : 'bg-green-50 border-green-300'} text-green-500 font-bold`
                      : 'text-slate4 border-slateb hover:bg-slate9'}`}
                  onClick={() => setSelectedStyle(item)}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Toggle Public Visibility */}
          <div className="my-6 flex items-center gap-3 bg-slate95 p-3 rounded-xl border border-slateb">
            <label className="relative cursor-pointer inline-flex items-center">
              <input
                type="checkbox"
                onChange={(e) => setPublish(e.target.checked)}
                checked={publish}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate8 rounded-full peer-checked:bg-green-500 transition-colors"></div>
              <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
            </label>
            <span className="text-xs sm:text-sm text-slate4">Make this image public on Community Feed</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-600 to-green-900 hover:from-green-700 hover:to-green-500 text-white px-5 py-3 mt-4 text-sm font-semibold rounded-xl cursor-pointer shadow-md shadow-green-500/10 hover:shadow-lg disabled:opacity-50 transition"
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
      <div className="flex-1 p-6 bg-primary rounded-2xl border border-slateb shadow-sm flex flex-col min-h-[400px]">
        <div className="flex items-center gap-3 pb-4 border-b border-slateb ">
          <ImageIcon className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold text-slate1">Generated Visual</h2>
        </div>

        {!content ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-slate4">
            <ImageIcon className="w-10 h-10 mb-4 opacity-50 text-emerald-500" />
            <p className="text-sm">Describe an image and click “Generate Image” to get started.</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center mt-6">
            <div className="rounded-xl overflow-hidden border border-slateb max-w-md bg-slate95 shadow-inner">
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
