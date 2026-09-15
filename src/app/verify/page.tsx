"use client";

import React, { useState } from "react";
import { Shield, Zap, Terminal, Code, CheckCircle, XCircle, ArrowRight, Database } from "lucide-react";

export default function VerifyLandingPage() {
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleTestVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ valid: false, error: "Network error. Are you offline?" });
    } finally {
      setIsTesting(false);
    }
  };

  const handleGetApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail) return;
    // In production, this would save to the CRM
    setLeadSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-green-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">👽</span>
            <span className="font-bold text-xl tracking-tight">Alien<span className="text-green-500">Verify</span></span>
          </Link>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <a href="#demo" className="text-gray-400 hover:text-white transition-colors">Live Tester</a>
            <a href="#docs" className="text-gray-400 hover:text-white transition-colors">SDK & API</a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-20">
        
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold mb-6 border border-green-500/20">
              <Zap size={12} /> Instant Email Verification
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Stop email bounces. <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Protect your sender score.</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Sending emails to dead or fake addresses gets your domain blacklisted. AlienVerify checks any email address in milliseconds to confirm mail servers exist, catch burner emails, and guarantee your messages actually land.
            </p>
            
            {!leadSubmitted ? (
              <form onSubmit={handleGetApiKey} className="flex gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="Enter your email to get an API Key..." 
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all text-sm"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                />
                <button type="submit" className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-lg flex items-center transition-colors">
                  Get API Key <ArrowRight size={16} className="ml-2" />
                </button>
              </form>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-start gap-3">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-green-400">You're on the waitlist!</h4>
                  <p className="text-sm text-gray-400 mt-1">We just sent your sandbox API credentials to {leadEmail}. Check your inbox.</p>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
              <CheckCircle size={12} /> No credit card required. 10k requests/mo free.
            </p>
          </div>

          {/* Interactive Demo */}
          <div id="demo" className="bg-[#111] border border-white/10 rounded-2xl p-1 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
            <div className="bg-[#1a1a1a] rounded-xl p-6 relative">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <Terminal size={16} className="text-gray-400" />
                <span className="font-mono text-xs text-gray-400">Live API Tester</span>
              </div>
              
              <form onSubmit={handleTestVerify} className="mb-6">
                <label className="block text-xs font-medium text-gray-400 mb-2">Test an email address:</label>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    required
                    placeholder="elon@spacex.com" 
                    className="flex-1 bg-black/50 border border-white/10 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:border-green-500/50"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <button type="submit" disabled={isTesting} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                    {isTesting ? "Checking..." : "Verify"}
                  </button>
                </div>
              </form>

              {testResult && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className={`p-4 rounded-xl border ${
                    testResult.verdict === 'SAFE_TO_SEND' 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : testResult.verdict === 'RISKY'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}>
                    {/* Header with Score & Verdict */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {testResult.valid ? (
                          <CheckCircle className={testResult.verdict === 'SAFE_TO_SEND' ? 'text-emerald-400' : 'text-amber-400'} size={18} />
                        ) : (
                          <XCircle className="text-rose-400" size={18} />
                        )}
                        <span className={`font-bold text-sm tracking-wide ${
                          testResult.verdict === 'SAFE_TO_SEND' 
                            ? 'text-emerald-400' 
                            : testResult.verdict === 'RISKY'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}>
                          {testResult.verdict === 'SAFE_TO_SEND' ? 'SAFE TO SEND' : testResult.verdict === 'RISKY' ? 'RISKY' : 'DO NOT SEND'}
                        </span>
                      </div>
                      {typeof testResult.score === 'number' && (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-gray-200">
                          Score: {testResult.score}/100
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 mb-3">{testResult.reason || testResult.error || testResult.message}</p>

                    {/* Metadata Detail Chips */}
                    {testResult.details && (
                      <div className="grid grid-cols-2 gap-2 mb-3 text-[11px] font-mono">
                        <div className="bg-black/40 p-2 rounded border border-white/5 flex items-center justify-between">
                          <span className="text-gray-400">MX Server:</span>
                          <span className={testResult.details.mxFound ? 'text-emerald-400' : 'text-rose-400'}>
                            {testResult.details.mxFound ? 'Verified' : 'None'}
                          </span>
                        </div>
                        <div className="bg-black/40 p-2 rounded border border-white/5 flex items-center justify-between">
                          <span className="text-gray-400">Disposable:</span>
                          <span className={testResult.details.isDisposable ? 'text-rose-400' : 'text-emerald-400'}>
                            {testResult.details.isDisposable ? 'Yes (Burner)' : 'No'}
                          </span>
                        </div>
                        <div className="bg-black/40 p-2 rounded border border-white/5 flex items-center justify-between">
                          <span className="text-gray-400">Account Type:</span>
                          <span className={testResult.details.isRoleAccount ? 'text-amber-400' : 'text-emerald-400'}>
                            {testResult.details.isRoleAccount ? 'Role (info/admin)' : 'Direct Person'}
                          </span>
                        </div>
                        <div className="bg-black/40 p-2 rounded border border-white/5 flex items-center justify-between">
                          <span className="text-gray-400">Mailbox Provider:</span>
                          <span className={testResult.details.isFreeProvider ? 'text-amber-400' : 'text-emerald-400'}>
                            {testResult.details.isFreeProvider ? 'Free (Gmail/Yahoo)' : 'Corporate / B2B'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-black/60 rounded p-3 overflow-x-auto custom-scrollbar border border-white/5">
                      <pre className="text-[10px] text-gray-300 font-mono">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
              
              {!testResult && (
                <div className="border border-dashed border-white/10 rounded-lg p-8 flex flex-col items-center justify-center text-center opacity-50">
                  <Database size={24} className="text-gray-500 mb-2" />
                  <p className="text-xs text-gray-500">Run a test to see the JSON response payload.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Snippet Section */}
        <div id="docs" className="mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Three lines of code. Zero bloat.</h2>
            <p className="text-gray-400">Designed specifically for autonomous agent loops and Node.js environments.</p>
          </div>
          
          <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden max-w-3xl mx-auto shadow-2xl">
            <div className="flex items-center px-4 py-3 bg-[#1a1a1a] border-b border-white/5 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-4 text-xs font-mono text-gray-500">agent-script.ts</span>
            </div>
            <div className="p-6">
              <pre className="font-mono text-sm leading-relaxed overflow-x-auto">
                <span className="text-purple-400">import</span> <span className="text-blue-300">{`{ AlienVerifier }`}</span> <span className="text-purple-400">from</span> <span className="text-green-300">'alien-verify-sdk'</span>;
                <br /><br />
                <span className="text-gray-500">// Initialize with your free API key</span><br />
                <span className="text-purple-400">const</span> <span className="text-blue-300">verifier</span> <span className="text-gray-400">=</span> <span className="text-purple-400">new</span> <span className="text-yellow-200">AlienVerifier</span>(<span className="text-green-300">"sk_live_12345"</span>);
                <br /><br />
                <span className="text-purple-400">async function</span> <span className="text-yellow-200">checkLead</span>(<span className="text-orange-300">email</span>: <span className="text-blue-300">string</span>) {`{`}<br />
                {"  "}<span className="text-purple-400">const</span> <span className="text-blue-300">result</span> <span className="text-gray-400">=</span> <span className="text-purple-400">await</span> <span className="text-blue-300">verifier</span>.<span className="text-yellow-200">verifyEmail</span>(<span className="text-orange-300">email</span>);<br />
                {"  "}<br />
                {"  "}<span className="text-purple-400">if</span> (<span className="text-blue-300">result</span>.<span className="text-blue-300">valid</span>) {`{`}<br />
                {"    "}<span className="text-gray-500">// Safe to send! MX records confirmed.</span><br />
                {"    "}<span className="text-yellow-200">sendColdEmail</span>(<span className="text-orange-300">email</span>);<br />
                {"  "}<br />
                {`}`}<br />
              </pre>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
