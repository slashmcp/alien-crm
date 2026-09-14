"use client";
import React, { useState, useEffect } from 'react';
import { Mic, Search, ChevronRight, MapPin, Send, Zap, Maximize2, Minimize2, Mail, RefreshCw, Edit2, Database } from "lucide-react";
import { processCommand } from "./actions/command";
import { runAudit } from "./actions/audit";
import { getLeads, saveLead } from "./actions/leads";
import { scrapeEmailForLead } from "./actions/scrapeEmail";
import { markLeadAsDNC } from "./actions/dnc";

export default function ZenDashboard() {
  const [command, setCommand] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);

  const [commandResponse, setCommandResponse] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [mapLocation, setMapLocation] = useState("Des Moines, IA");

  useEffect(() => {
    // Load leads from SQLite on mount
    getLeads().then(setLeads).catch(e => console.error("Failed to load leads:", e));
  }, []);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command) return;
    
    setCommandResponse("Processing...");
    const response = await processCommand(command);
    setCommandResponse(response.message);
    
    if (response.intent === 'prospecting') {
      if (response.rawEntities?.location) {
         setMapLocation(response.rawEntities.location);
      }
      
      let incomingLeads = response.data && Array.isArray(response.data) ? response.data : [
        { id: 'm1', name: "Apex " + (response.rawEntities?.industry || "Businesses"), location: response.rawEntities?.location || "Unknown", status: "Scraped" },
        { id: 'm2', name: "Zenith " + (response.rawEntities?.industry || "Services"), location: response.rawEntities?.location || "Unknown", status: "Scraped" },
        { id: 'm3', name: "Pro " + (response.rawEntities?.industry || "Contractors"), location: response.rawEntities?.location || "Unknown", status: "Scraped" },
      ];

      // Save each to DB and update state
      const savedLeads = await Promise.all(incomingLeads.map((l: any) => saveLead(l)));
      
      setLeads(prev => {
        // Merge without duplicates by ID
        const merged = [...savedLeads, ...prev];
        return Array.from(new Map(merged.map(item => [item.id, item])).values());
      });
    }

    setCommand("");
  };

  const handleDragStart = (e: React.DragEvent, lead: any) => {
    e.dataTransfer.setData("leadId", lead.id.toString());
  };

  const handleDropToAudit = async (e: React.DragEvent) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    
    // Optimistically update
    setLeads(prev => prev.map(l => l.id.toString() === leadId ? { ...l, status: "Auditing", isDrafting: true } : l));
    
    const leadToAudit = leads.find(l => l.id.toString() === leadId);
    if (!leadToAudit) return;

    // 1. Hunt for Email
    const { email } = await scrapeEmailForLead(leadToAudit);
    const updatedLead = { ...leadToAudit, email };

    // 2. Draft Pitch
    const auditResult = await runAudit(updatedLead);
    
    // 3. Save to DB
    const finalLead = await saveLead({
      ...updatedLead,
      status: "Auditing",
      auditDraft: auditResult.draft
    });
    
    // 4. Update UI
    setLeads(prev => prev.map(l => l.id === finalLead.id ? { ...finalLead, isDrafting: false } : l));
  };

  const handleReroll = async (lead: any) => {
    // Set to drafting state
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, isDrafting: true } : l));
    
    // Draft a new pitch
    const auditResult = await runAudit(lead);
    
    // Save new draft to DB
    const updatedLead = await saveLead({
      ...lead,
      auditDraft: auditResult.draft
    });

    // Update UI
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...updatedLead, isDrafting: false } : l));
  };

  const handleApproveAndSend = async (lead: any) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: "Outreach Sent" } : l));
    await saveLead({ ...lead, status: "Outreach Sent" });
    
    try {
      await fetch('/api/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: lead.email || "test@example.com", 
          subject: "A quick question about your site",
          message: lead.auditDraft
        })
      });
    } catch (e) {
      console.error("Failed to send email", e);
    }
  };

  return (
    <div className="h-full flex flex-col items-center p-8 bg-background relative overflow-auto">
      
      {/* Background ambient glow (Alien vibe) */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Command Center */}
      <div className={`w-full max-w-3xl relative z-10 flex flex-col items-center transition-all duration-500 ${mapExpanded ? 'mt-4' : 'mt-24'}`}>
        
        {/* Brand */}
        <div className={`text-center transition-all duration-500 ${mapExpanded ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto mb-12'}`}>
          <h1 className="text-4xl font-serif tracking-tight text-foreground mb-2">How can I help you?</h1>
          <p className="text-muted font-sans font-light">Command your leads, trigger agents, or analyze websites.</p>
        </div>

        {/* The Prompt Box */}
        <form 
          onSubmit={handleCommandSubmit}
          className="w-full bg-card border border-border rounded-2xl shadow-xl flex items-center p-2 mb-6 transition-all focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-accent"
        >
          <button 
            type="button"
            onClick={() => setIsListening(!isListening)}
            className={`p-4 rounded-xl transition-colors ${isListening ? 'bg-red-500/10 text-red-500' : 'text-muted hover:text-foreground hover:bg-background'}`}
          >
            <Mic size={24} className={isListening ? "animate-pulse" : ""} />
          </button>
          
          <input 
            type="text" 
            autoFocus
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g. Find 5 roofers in Dallas and draft audits..." 
            className="flex-1 bg-transparent font-sans border-none text-lg px-4 text-foreground focus:outline-none focus:ring-0 placeholder:text-muted/50"
          />
          
          <button 
            type="submit" 
            className="p-4 bg-foreground text-background rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </form>

        {commandResponse && (
          <div className="w-full text-center mb-6 text-accent animate-pulse font-medium">
            {commandResponse}
          </div>
        )}

        {/* Interactive Map Prospector */}
        <div id="prospector" className={`w-full bg-card border border-border rounded-2xl shadow-lg overflow-hidden transition-all duration-500 flex flex-col relative ${mapExpanded ? 'h-[60vh]' : 'h-64'}`}>
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button 
              onClick={() => setMapExpanded(!mapExpanded)}
              className="p-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg text-foreground hover:bg-background transition-colors shadow-sm"
            >
              {mapExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
          
          {/* Live Map iframe */}
          <div className="flex-1 w-full bg-[#e5e3df] dark:bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center">
             <iframe
               width="100%"
               height="100%"
               frameBorder="0"
               style={{ border: 0, filter: "grayscale(100%) invert(90%) hue-rotate(180deg)" }} // Alien Dark Mode Map Filter
               referrerPolicy="no-referrer-when-downgrade"
               src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(mapLocation)}&zoom=10`}
               allowFullScreen
             ></iframe>
             
             {/* Mock Targeting Radius overlay */}
             <div className="absolute w-48 h-48 bg-accent/10 border border-accent/50 rounded-full flex items-center justify-center animate-pulse pointer-events-none">
             </div>

             <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border p-3 rounded-xl shadow-lg pointer-events-none">
                <p className="text-sm font-medium font-sans">Targeting Radius: <span className="text-accent">25 Miles</span></p>
                <p className="text-xs text-muted">Currently viewing: {mapLocation}</p>
             </div>
          </div>
        </div>

        {/* Kanban Pipeline */}
        {leads.length > 0 && (
          <div id="pipeline" className="w-full mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-serif tracking-tight text-foreground mb-6">Prospecting Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Column 1: Scraped */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-medium text-foreground">Scraped</h3>
                  <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-full">{leads.filter(l => l.status === "Scraped").length}</span>
                </div>
                <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                  {leads.filter(l => l.status === "Scraped").map(lead => (
                    <div 
                      key={lead.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, lead)}
                      className="bg-background border border-border rounded-lg p-4 shadow-sm hover:border-accent/50 transition-colors cursor-grab active:cursor-grabbing shrink-0"
                    >
                      <h4 className="font-medium text-sm text-foreground">{lead.name}</h4>
                      <p className="text-xs text-muted flex items-center mt-2"><MapPin size={12} className="mr-1 flex-shrink-0" /> <span className="truncate">{lead.location}</span></p>
                      {lead.website && (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline mt-1 block truncate">
                          {lead.website}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Auditing */}
              <div 
                className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-4 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropToAudit}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-medium text-foreground">AI Drafts / Approval</h3>
                  <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-full">{leads.filter(l => l.status === "Auditing").length}</span>
                </div>
                <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                  {leads.filter(l => l.status === "Auditing").map(lead => (
                    <div key={lead.id} className="bg-background border border-border rounded-lg p-4 shadow-sm transition-all duration-500 shrink-0">
                      <h4 className="font-medium text-sm text-foreground mb-2">{lead.name}</h4>
                      
                      {lead.email && (
                        <p className="text-[10px] text-green-500 flex items-center mb-2 font-medium">
                          <Mail size={10} className="mr-1" /> Found: {lead.email}
                        </p>
                      )}
                      
                      {!lead.auditDraft || lead.isDrafting ? (
                        <p className="text-xs text-accent mt-2 flex items-center animate-pulse"><Zap size={12} className="mr-1" /> Analyzing site & hunting email...</p>
                      ) : (
                        <div className="mt-3 space-y-3">
                          <textarea 
                            value={lead.auditDraft}
                            onChange={(e) => {
                              setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, auditDraft: e.target.value } : l));
                            }}
                            className="w-full bg-muted/10 p-3 rounded text-xs text-muted border border-border/50 italic leading-relaxed resize-y min-h-[120px] focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all custom-scrollbar"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleReroll(lead)}
                              className="flex-1 bg-muted/20 hover:bg-muted/30 text-muted-foreground text-xs font-bold py-2 rounded-md transition-colors flex items-center justify-center"
                            >
                              <RefreshCw size={12} className="mr-2" /> Reroll
                            </button>
                            <button 
                              onClick={() => handleApproveAndSend(lead)}
                              className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold py-2 rounded-md transition-colors flex items-center justify-center"
                            >
                              <Send size={12} className="mr-2" /> Send
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {leads.filter(l => l.status === "Auditing").length === 0 && (
                    <div className="flex-1 border-2 border-dashed border-border rounded-lg flex items-center justify-center p-8 min-h-[200px]">
                      <p className="text-xs text-muted text-center">Drag leads here to trigger AI audits</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full Width Outreach History Table */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-sans font-medium text-foreground text-lg">Outreach History Log</h3>
                  <p className="text-xs text-muted mt-1">Live feed of all emails dispatched via Zoho Mail.</p>
                </div>
                <span className="bg-green-500/10 text-green-500 text-sm font-bold px-4 py-2 rounded-full border border-green-500/20 shadow-sm flex items-center">
                  <Send size={14} className="mr-2" /> {leads.filter(l => l.status === "Outreach Sent").length} Total Sent
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border/50 text-muted font-sans text-xs uppercase tracking-wider">
                      <th className="pb-3 px-4 font-medium">Business / Lead</th>
                      <th className="pb-3 px-4 font-medium">Recipient</th>
                      <th className="pb-3 px-4 font-medium">Date & Time Sent</th>
                      <th className="pb-3 px-4 font-medium">Exact Copy Sent</th>
                      <th className="pb-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {leads
                      .filter(l => l.status === "Outreach Sent")
                      .sort((a, b) => new Date(b.outreachDate || b.updatedAt).getTime() - new Date(a.outreachDate || a.updatedAt).getTime())
                      .map(lead => (
                      <tr key={lead.id} className="hover:bg-muted/5 transition-colors group">
                        <td className="py-4 px-4 font-medium text-foreground">{lead.name}</td>
                        <td className="py-4 px-4 text-muted">{lead.email || "Unknown"}</td>
                        <td className="py-4 px-4 text-muted">
                          {lead.outreachDate 
                            ? new Date(lead.outreachDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                            : new Date(lead.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric' })
                          }
                        </td>
                        <td className="py-4 px-4 max-w-[300px]">
                           <div 
                             className="text-xs text-muted italic truncate cursor-pointer hover:text-foreground hover:whitespace-normal hover:bg-muted/10 p-2 rounded transition-all"
                             dangerouslySetInnerHTML={{ __html: lead.outreachCopy || lead.auditDraft || "(Legacy layout - text unavailable)" }} 
                           />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded-full flex items-center w-max font-bold border border-green-500/20">
                              <Send size={10} className="mr-1" /> Delivered via Zoho
                            </span>
                            <button 
                              onClick={async () => {
                                if(confirm(`Mark ${lead.name} as DNC and wipe their email?`)) {
                                  await markLeadAsDNC(lead.id);
                                  setLeads(prev => prev.filter(l => l.id !== lead.id));
                                }
                              }}
                              className="text-[10px] text-red-500 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-full font-bold transition-colors border border-red-500/20"
                            >
                              Flag DNC
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {leads.filter(l => l.status === "Outreach Sent").length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted text-xs">
                          No outreach sent yet. Run the campaign script to populate this log.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
