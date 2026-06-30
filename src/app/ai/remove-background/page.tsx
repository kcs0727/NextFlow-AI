'use client';

import React, { useState } from 'react';
import { Eraser, Sparkles, Upload } from 'lucide-react';
import { useAiStore } from '@/store/aitoolsStore';
import { removebg } from '@/services/aitools';

export default function RemoveBg() {
  const [input, setInput] = useState<File | null>(null);
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { buttonLoading } = useAiStore();

  const onsubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    await removebg(input, publish, setLoading, setContent);
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
            <Sparkles className="w-5 h-5 text-red-500" />
            <h1 className="text-xl font-bold text-slate1">Background Removal</h1>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate3">Upload Image</label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slateb rounded-xl cursor-pointer bg-slate95 hover:bg-slate9 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <Upload className="w-8 h-8 text-slate3 mb-2" />
                  <p className="text-xs font-semibold text-slate3">
                    {input ? input.name : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-[10px] text-slate4 mt-1">
                    Supports PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  required
                  onChange={(e) => setInput(e.target.files?.[0] || null)}
                />
              </label>
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
              <div className="w-9 h-5 bg-slate8 rounded-full peer-checked:bg-red-500 transition-colors"></div>
              <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
            </label>
            <span className="text-xs sm:text-sm text-slate4">Make this image public on Community Feed</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-red-600 to-orange-900 hover:from-red-700 hover:to-orange-600 text-white px-5 py-3 text-sm font-semibold rounded-xl cursor-pointer shadow-md shadow-red-500/10 hover:shadow-lg disabled:opacity-50 transition"
          disabled={buttonLoading}
        >
          {loading ? (
            <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Eraser className="w-4 h-4" />
          )}
          Remove Background
        </button>
      </form>

      {/* Processed Image Display */}
      <div className="flex-1 p-6 bg-primary rounded-2xl border border-slateb shadow-sm flex flex-col min-h-[400px]">
        <div className="flex items-center gap-3 pb-4 border-b border-slateb ">
          <Eraser className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-slate1">Processed Image</h2>
        </div>

        {!content ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-slate4">
            <Eraser className="w-10 h-10 mb-4 opacity-50 text-red-500" />
            <p className="text-sm">Upload an image and click “Remove Background” to get started.</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center mt-6">
            <div className="rounded-xl overflow-hidden border border-slateb max-w-md bg-slate95 shadow-inner">
              <img
                src={content}
                alt="AI Processed Result"
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
