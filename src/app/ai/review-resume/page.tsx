'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Sparkles, Upload } from 'lucide-react';
import { useAiStore } from '@/store/aiStore';

export default function ReviewResume() {
  const [input, setInput] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { reviewresume, buttonLoading } = useAiStore();

  const onsubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    await reviewresume(input, setLoading, setContent);
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
            <Sparkles className="w-5 h-5 text-teal-500" />
            <h1 className="text-xl font-bold text-slate1">Resume Review</h1>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate3">Upload Resume (Max 5MB)</label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slateb rounded-xl cursor-pointer bg-slate95 hover:bg-slate9 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <Upload className="w-8 h-8 text-slate3 mb-2" />
                  <p className="text-xs font-semibold text-slate3">
                    {input ? input.name : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-[10px] text-slate4 mt-1">
                    Supports PDF format only
                  </p>
                </div>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  required 
                  onChange={(e) => setInput(e.target.files?.[0] || null)} 
                />
              </label>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-900 hover:from-teal-700 hover:to-emerald-600 text-white px-5 py-3 mt-8 text-sm font-semibold rounded-xl cursor-pointer shadow-md shadow-teal-500/10 hover:shadow-lg disabled:opacity-50 transition" 
          disabled={buttonLoading}
        >
          {loading ? (
            <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          Review Resume
        </button>
      </form>

      {/* Analysis Results Display */}
      <div className="flex-1 p-6 bg-primary rounded-2xl border border-slateb shadow-sm flex flex-col min-h-[400px]">
        <div className="flex items-center gap-3 pb-4 border-b border-slateb ">
          <FileText className="w-5 h-5 text-teal-500" />
          <h2 className="text-xl font-bold text-slate1">Analysis Results</h2>
        </div>

        {!content ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-slate4">
            <FileText className="w-10 h-10 mb-4 opacity-50 text-teal-500" />
            <p className="text-sm">Upload a PDF resume and click “Review Resume” to receive AI feedback.</p>
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
