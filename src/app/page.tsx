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
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-3xl filter drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">👽</span>
            <span className="font-bold text-xl tracking-tight">Automation<span className="text-green-500 italic">Alien</span></span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#services" className="hover:text-white transition-colors">How It Works</a>
            <Link href="/verify" className="hover:text-white transition-colors flex items-center gap-1"><Shield size={14} className="text-green-500"/> Email Verifier</Link>
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
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Automated Lead Generation & Client Outreach Systems
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            We build systems that <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">
              find new clients while you sleep.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
            Stop wasting hours manually searching for prospects. We set up automated lead finders, verified email lists, and hands-free outreach that book estimates and calls on your calendar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a href="#contact" className="bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-full font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95">
              Get Your System <ChevronRight size={18} className="ml-1" />
            </a>
            <Link href="/verify" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-bold flex items-center justify-center transition-all backdrop-blur-sm">
              <Shield size={18} className="mr-2 text-green-500" /> Try the Free Email Verifier
            </Link>
          </div>
        </section>

        {/* The Pipeline Section */}
        <section id="services" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-gray-400">A complete, hands-off pipeline designed to keep your schedule full of new jobs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
              <div className="w-12 h-12 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:border-green-500/50 transition-colors">
                <Database className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Find Your Ideal Clients</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We automatically pull verified lists of businesses and property owners in your exact target market from Google Maps and verified directories—no manual hunting needed.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
              <div className="w-12 h-12 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:border-green-500/50 transition-colors">
                <Shield className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Verify Every Contact</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Before sending a single message, our built-in verifier confirms every email is real and active. This prevents bounces, keeps you out of spam, and protects your inbox.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
              <div className="w-12 h-12 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:border-green-500/50 transition-colors">
                <Send className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Automated Daily Outreach</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Personalized emails are sent out steadily every single day from your address. Interested prospects reply directly to you or book straight into your calendar.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-32 px-6 max-w-4xl mx-auto text-center border-t border-white/5">
          <span className="text-6xl filter drop-shadow-[0_0_30px_rgba(34,197,94,0.3)] mb-6 block">🛸</span>
          <h2 className="text-4xl font-bold mb-6">Stop paying for shared leads. Own your pipeline.</h2>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
            Instead of fighting other businesses for expensive leads on platforms like Angi or Thumbtack, we build an automated outreach system that brings clients directly to you.
          </p>
          <a href="mailto:will@automationalien.com?subject=I%20want%20to%20set%20up%20an%20automated%20outreach%20system&body=Hey%20Will%2C%0A%0AI%20saw%20your%20site%20and%20want%20to%20learn%20how%20you%20can%20help%20us%20get%20more%20clients%20consistently.%0A%0A" className="inline-flex bg-white hover:bg-gray-200 text-black px-10 py-5 rounded-full font-extrabold items-center justify-center transition-all hover:scale-105 active:scale-95 text-lg">
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
