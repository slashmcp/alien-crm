"use client";

import React from "react";
import { Terminal, Database, Send, Zap, ChevronRight, BarChart, Shield } from "lucide-react";
import Link from "next/link";

export default function AutomationAlienHome() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30 overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">👽</span>
            <span className="font-bold text-xl tracking-tight">Automation<span className="text-green-500 italic">Alien</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#services" className="hover:text-white transition-colors">Infrastructure</a>
            <Link href="/verify" className="hover:text-white transition-colors flex items-center gap-1"><Shield size={14} className="text-green-500"/> Verification API</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Client Login</Link>
            <a href="#contact" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">Book Strategy Call</a>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-bold mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> B2B Cold Email Infrastructure & Autonomous Agents
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            We build machines that <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">
              hunt leads while you sleep.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
            Stop manually prospecting. We engineer custom AI agents, scraping infrastructure, and high-volume cold email systems for elite B2B sales teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a href="#contact" className="bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-full font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95">
              Deploy Your System <ChevronRight size={18} className="ml-1" />
            </a>
            <Link href="/verify" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-bold flex items-center justify-center transition-all backdrop-blur-sm">
              <Terminal size={18} className="mr-2 text-green-500" /> Explore our Developer APIs
            </Link>
          </div>
        </section>

        {/* The Pipeline Section */}
        <section id="services" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Alien Infrastructure</h2>
            <p className="text-gray-400">An end-to-end autonomous pipeline engineered for relentless volume.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
              <div className="w-12 h-12 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:border-green-500/50 transition-colors">
                <Database className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Targeted Scraping</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We build headless scripts that bypass anti-bot protections to scrape thousands of hyper-targeted B2B leads from Google Maps, Apollo, and hidden directories.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
              <div className="w-12 h-12 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:border-green-500/50 transition-colors">
                <Shield className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">API Verification</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We pass every lead through our proprietary AlienVerify API. We aggressively filter out dead MX records and spam traps to protect your domain reputation.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
              <div className="w-12 h-12 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:border-green-500/50 transition-colors">
                <Send className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Automated Outreach</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Leads are automatically dumped into a custom CRM and dripped out via Zoho or Google Workspace SMTP with perfectly aligned DKIM/SPF/DMARC records.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-32 px-6 max-w-4xl mx-auto text-center border-t border-white/5">
          <span className="text-6xl filter drop-shadow-[0_0_30px_rgba(34,197,94,0.3)] mb-6 block">🛸</span>
          <h2 className="text-4xl font-bold mb-6">Stop buying leads. Start harvesting them.</h2>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
            If you have a B2B offer that converts, but you don't have enough volume, we will build the machine that feeds you. Let's talk architecture.
          </p>
          <a href="mailto:will@automationalien.com" className="inline-flex bg-white hover:bg-gray-200 text-black px-10 py-5 rounded-full font-extrabold items-center justify-center transition-all hover:scale-105 active:scale-95 text-lg">
            Email will@automationalien.com <Zap size={20} className="ml-2 text-green-600" />
          </a>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/50 py-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Automation Alien. All rights reserved.</p>
      </footer>
    </div>
  );
}
