"use client";

import { useState } from "react";
import { Search, MapPin, Globe, Phone, PlusCircle } from "lucide-react";

export default function ProspectorPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    // TODO: Actually call the Google Maps MCP / Places API here.
    // For now, simulate a network request.
    setTimeout(() => {
      setLeads([
        { id: 1, name: "Texas Premium Roofing", address: "123 Main St, Austin, TX", website: "texaspremiumroofing.com", phone: "555-0101" },
        { id: 2, name: "Austin Roof Ninjas", address: "400 5th Ave, Austin, TX", website: "austinroofninjas.com", phone: "555-0102" },
        { id: 3, name: "Lone Star Plumbing", address: "800 Elm St, Dallas, TX", website: "lonestarplumb.com", phone: "555-0103" },
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Google Maps Prospector</h2>
        <p className="text-muted mt-1">Search Google Maps to automatically import local businesses into your CRM.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-muted" size={20} />
            <input 
              type="text" 
              placeholder="e.g. Roofers in Austin, TX" 
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Find Leads"}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-auto">
        {leads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map(lead => (
              <div key={lead.id} className="bg-card border border-border rounded-xl p-6 flex flex-col group hover:border-accent transition-colors">
                <h3 className="font-semibold text-lg mb-2">{lead.name}</h3>
                
                <div className="space-y-2 mt-2 mb-6">
                  <div className="flex items-center text-sm text-muted gap-2">
                    <MapPin size={16} />
                    <span>{lead.address}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted gap-2">
                    <Globe size={16} />
                    <a href={`https://${lead.website}`} target="_blank" className="hover:text-accent underline-offset-4 hover:underline">{lead.website}</a>
                  </div>
                  <div className="flex items-center text-sm text-muted gap-2">
                    <Phone size={16} />
                    <span>{lead.phone}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <button className="w-full border border-border bg-background hover:bg-border text-foreground py-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2">
                    <PlusCircle size={16} />
                    Import to Pipeline
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 text-center text-muted">
            <MapPin size={48} className="mb-4 opacity-20" />
            <p className="text-lg">No leads searched yet.</p>
            <p className="text-sm mt-1">Enter a query above to scrape Google Maps.</p>
          </div>
        )}
      </div>
    </div>
  );
}
