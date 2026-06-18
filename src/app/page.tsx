'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useClerk, UserButton, PricingTable } from '@clerk/nextjs';
import {
  Sun,
  Moon,
  ArrowRight,
  Check,
  Sparkles,
  Star,
  ChevronDown,
  Flame,
  Heart,
  Cpu,
  Layers,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { AiToolsData, dummyTestimonialData, faqData, assets } from '@/assets/tools-data';
import { useTheme } from 'next-themes';


export default function Home() {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const { theme: nextTheme, setTheme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme ?? nextTheme ?? "dark";

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen relative overflow-hidden bg-primarybg text-slate2 transition-colors duration-300">

      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-primary border-b border-slateb transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2">
            <span className="font-sans font-extrabold text-2xl tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              NextFlow AI
            </span>
          </Link>

          <div className="flex items-center gap-6">

            <button
              onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full cursor-pointer bg-slate8"
              aria-label="Toggle theme"
            >
              {currentTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 " /> : <Moon className="w-4 h-4 text-slate-900" />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/ai"
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full shadow-md hover:shadow-lg transition"
                >
                  Dashboard
                </Link>
                <UserButton />
              </div>
            ) : (
              <button
                onClick={() => openSignIn()}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-full transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center px-6">
        
        {/* Premium Background Gradient Glows */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
          {/* Blue/Indigo Glow */}
          <div className="absolute top-[10%] left-[5%] md:left-[15%] w-[350px] md:w-[550px] h-[350px] md:h-[550px] rounded-full bg-blue-500/20 dark:bg-blue-600/15 blur-[80px] md:blur-[120px]" />
          {/* Purple/Pink Glow */}
          <div className="absolute top-[20%] right-[5%] md:right-[15%] w-[350px] md:w-[550px] h-[350px] md:h-[550px] rounded-full bg-purple-500/20 dark:bg-purple-600/15 blur-[80px] md:blur-[120px]" />
        </div>

        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${currentTheme === 'dark' ? 'bg-blue-900/30 border-blue-800/40 text-blue-400' : 'bg-blue-50 border-blue-200/50 text-blue-600'} text-xs font-semibold uppercase tracking-wider mb-6`}>
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Rebuilt with Next.js & Redis Caching
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-extrabold tracking-tight leading-[1.1] mb-6">
            Create amazing content <br />
            with{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Tools
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate4 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Transform your content workflow with our suite of premium AI tools. Write articles, synthesize images, remove objects, and audit resumes instantly.
          </p>

          <div className="flex flex-wrap justify-center gap-5 text-sm font-semibold mb-12">
            <button
              onClick={() => (user ? window.location.href = '/ai' : openSignIn())}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-indigo-500/30 hover:scale-[1.03] active:scale-[0.98] transition cursor-pointer"
            >
              Start Creating Now
            </button>
            <a
              href="#showcase"
              className="px-8 py-4 bg-secondary text-primary border border-slateb rounded-xl hover:scale-[1.03] active:scale-[0.98] transition"
            >
              Explore Tools
            </a>
          </div>

          <div className="flex justify-center items-center gap-4 text-sm text-slate5">
            <Image src={assets.user_group} alt="user group" className="h-8 w-auto dark:opacity-80" />
            <span>Trusted by <strong className="text-slate4">10k+</strong> creators worldwide</span>
          </div>
        </motion.div>

      </section>

      {/* AI Tools Showcase */}
      <section id="showcase" className="py-24  border-y border-slate7">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-sans font-bold mb-4">Powerful AI Tools</h2>
            <p className="text-slate4">
              Everything you need to create, enhance, and optimize your content with cutting-edge AI technology.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {AiToolsData.map((tool, idx) => (
              <motion.div
                key={idx}
                className="p-8 rounded-2xl bg-slate95 border border-slateb shadow-sm hover:shadow-md cursor-pointer group relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
                onClick={() => (user ? window.location.href = tool.path : openSignIn())}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: idx * 0.05 }}
              >
                <div
                  className="size-12 rounded-xl text-white flex items-center justify-center transition group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${tool.bg.from}, ${tool.bg.to})` }}
                >
                  <tool.Icon className="w-5 h-5" />
                </div>

                <h3 className="text-xl font-bold mt-6 mb-2 group-hover:text-blue-500 transition">{tool.title}</h3>
                <p className="text-sm text-slate5 leading-relaxed mb-6">{tool.description}</p>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 group-hover:translate-x-1 transition duration-300">
                  Try Tool <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-sans font-bold mb-4">Choose Your Plan</h2>
          <p className="text-slate4">
            Start for free and scale up as you grow. Find the perfect plan for your content creation needs.
          </p>
        </div>

        <motion.div
          className="max-w-4xl mx-auto shadow-xl rounded-3xl relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <PricingTable for="user" />
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-y border-slate7">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-sans font-bold mb-4">User Testimonials</h2>
            <p className="text-slate4">
              Read how content writers, designers, and hiring specialists leverage EdgeAI tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dummyTestimonialData.map((test, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate95 border border-slateb shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < test.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-slate4 italic leading-relaxed mb-6">
                    &quot;{test.content}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate7">
                  <div className="size-10 rounded-full bg-slate-200 overflow-hidden relative">
                    <Image src={test.image} alt={test.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{test.name}</h4>
                    <p className="text-xs text-slate4">{test.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-sans font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-slate4">Got questions? We have answers.</p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slateb bg-slate95 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between font-semibold text-left text-sm sm:text-base cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`w-4.5 h-4.5 text-slate4 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-sm text-slate4 leading-relaxed border-t border-slateb pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slateb bg-primary/50 transition duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              NextFlow AI
            </span>
            <p className="text-xs text-slate4 mt-2">© {new Date().getFullYear()} NextFlow AI. All rights reserved.</p>
          </div>

          <div className="flex gap-6 text-xs text-slate4">
            <Link href="/" className="hover:text-blue-500 transition">Privacy Policy</Link>
            <Link href="/" className="hover:text-blue-500 transition">Terms of Service</Link>
            <Link href="/" className="hover:text-blue-500 transition">Support</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
