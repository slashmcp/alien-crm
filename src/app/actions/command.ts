'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function processCommand(command: string) {
  console.log("Processing command on server:", command);
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    // Phase 3: True AI Intent Parsing
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `You are the brain of the Alien CRM. 
Parse the following user command and extract the intent, the target industry/business type, and the location.
If the user is asking to find, list, search for, or scrape businesses, the intent is "prospecting".
If they are asking to audit or email, the intent is "outreach".
Otherwise, the intent is "unknown".

Command: "${command}"

Respond strictly with a JSON object in this exact format, with no markdown formatting or backticks:
{
  "intent": "prospecting" | "outreach" | "unknown",
  "industry": "Extracted industry (e.g. Roofers, Aesthetics Studios, Plumbers) or null",
  "location": "Extracted location (e.g. Dallas, TX, Ankeny) or null",
  "requiresNoWebsite": boolean (true if they explicitly ask for businesses without websites)
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    const parsed = JSON.parse(responseText);

    console.log("Gemini parsed intent:", parsed);

    if (parsed.intent === 'prospecting' && parsed.industry && parsed.location) {
      
      const mockEntities = {
        action: 'prospect',
        industry: parsed.industry,
        location: parsed.location,
        radius: 25
      };

      const query = `${mockEntities.industry} in ${mockEntities.location}`;
      
      const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!mapsApiKey) throw new Error("Missing Maps API Key");

      // Direct REST call to Google Places API (New)
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": mapsApiKey,
          "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.websiteUri"
        },
        body: JSON.stringify({
          textQuery: query,
          maxResultCount: 20
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
         throw new Error(data.error?.message || "Places API Error");
      }

      // Map the Google Places data
      let rawLeads = (data.places || []).map((place: any, index: number) => ({
        id: index.toString(),
        name: place.displayName?.text || "Unknown Business",
        location: place.formattedAddress || mockEntities.location,
        website: place.websiteUri || null,
        status: "Scraped"
      }));

      // If user specifically wanted businesses without websites, filter them!
      if (parsed.requiresNoWebsite) {
        rawLeads = rawLeads.filter((l: any) => !l.website);
      }
      
      // Limit to 5 for UI performance (or take all if filtered down)
      const leads = rawLeads.slice(0, 5);
      
      return {
        status: 'success',
        intent: 'prospecting',
        data: leads,
        message: parsed.requiresNoWebsite 
          ? `Found ${leads.length} ${mockEntities.industry} in ${mockEntities.location} WITHOUT websites!` 
          : `Found ${leads.length} leads for ${mockEntities.industry} in ${mockEntities.location}!`,
        rawEntities: mockEntities
      };
    } else if (parsed.intent === 'outreach') {
       return {
         status: 'success',
         intent: 'outreach',
         message: 'Preparing to run AI audits and queue "Message 2" outreach emails.'
       };
    } else {
       return {
         status: 'success',
         intent: 'unknown',
         message: `I analyzed your command but didn't detect a prospecting or outreach request. How else can I assist?`
       };
    }

  } catch (error: any) {
    console.error("AI/Maps API Error:", error.message);
    return {
      status: 'error',
      intent: 'unknown',
      message: `Error processing command: ${error.message}`
    };
  }
}
