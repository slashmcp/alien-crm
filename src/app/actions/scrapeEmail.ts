'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function scrapeEmailForLead(lead: any) {
  console.log("Hunting for email for:", lead.name);
  let foundEmail: string | null = null;

  // Tier 1: Regex scraping the website if it exists
  if (lead.website) {
    try {
      console.log("Tier 1: Fetching website HTML", lead.website);
      const res = await fetch(lead.website, { signal: AbortSignal.timeout(5000) });
      const html = await res.text();
      
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
      const matches = html.match(emailRegex);
      
      if (matches && matches.length > 0) {
        // Filter out common image extensions that look like emails
        const validEmails = matches.filter(e => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.webp'));
        if (validEmails.length > 0) {
          foundEmail = validEmails[0].toLowerCase();
          console.log("Tier 1 Success:", foundEmail);
        }
      }
    } catch (e: any) {
      console.log("Tier 1 Website fetch failed or timed out:", e.message);
    }
  }

  // Tier 2: Gemini Google Search Grounding (if no email found yet)
  if (!foundEmail) {
    console.log("Tier 2: Falling back to Gemini SERP Search...");
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.5-flash",
        tools: [{
           googleSearch: {}
        }]
      });

      const prompt = `Search the web to find the public contact email address for the business named "${lead.name}" located in or near ${lead.location}. 
      Check their Facebook page, Better Business Bureau listing, Yelp, or local directories.
      If you find an email address, return ONLY the email address as a single string. If you absolutely cannot find any email address, return exactly "NOT_FOUND".`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      if (text && text !== "NOT_FOUND" && text.includes("@")) {
         foundEmail = text.toLowerCase();
         console.log("Tier 2 Success:", foundEmail);
      } else {
         console.log("Tier 2 failed to find email.");
      }
    } catch (e: any) {
      console.log("Tier 2 Gemini Search failed:", e.message);
    }
  }

  return { email: foundEmail };
}
