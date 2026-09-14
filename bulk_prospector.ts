import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Load environment variables
dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();
const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!mapsApiKey || !geminiApiKey) {
  console.error("Missing GOOGLE_MAPS_API_KEY or GEMINI_API_KEY in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

// --- CONFIGURATION ---
const TARGET_NICHES = [
  "Roofing",
  "HVAC", 
  "Tree Service",
  "Snow Removal"
];

const TARGET_CITIES = [
  "Des Moines, IA", "Cedar Rapids, IA", "Davenport, IA",
  "Sioux City, IA", "Iowa City, IA", "Waterloo, IA", "Ames, IA"
];

// Progress tracking file
const PROGRESS_FILE = "prospector_progress.json";

function loadProgress(): Set<string> {
  if (fs.existsSync(PROGRESS_FILE)) {
    const data = fs.readFileSync(PROGRESS_FILE, "utf-8");
    return new Set(JSON.parse(data));
  }
  return new Set();
}

function saveProgress(progressSet: Set<string>) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(Array.from(progressSet), null, 2));
}

// Delay between searches to respect rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function findEmailViaGemini(name: string, location: string) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash"
    });
    
    const prompt = `Search the web to find the public contact email address for the local business named "${name}" located in or near ${location}. Check their Facebook page, Yelp, BBB, or local directories. 
    If you find an email address, return ONLY the email address as a single string. 
    If you absolutely cannot find any email address, return exactly "NOT_FOUND".`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    if (text && text !== "NOT_FOUND" && text.includes("@")) {
       return text.toLowerCase();
    }
  } catch (e: any) {
    console.log(`      [!] Gemini search failed: ${e.message}`);
    // If we hit a quota error, throw it up to pause the script
    if (e.message.includes("429") || e.message.includes("quota")) {
      throw new Error("QUOTA_EXCEEDED");
    }
  }
  return null;
}

async function run() {
  console.log("🚀 Starting Bulk Prospector Engine...");
  let totalSaved = 0;
  
  const completedQueries = loadProgress();
  console.log(`📂 Loaded ${completedQueries.size} previously completed searches. They will be skipped to save quota!`);

  for (const niche of TARGET_NICHES) {
    for (const city of TARGET_CITIES) {
      const query = `${niche} in ${city}`;
      
      if (completedQueries.has(query)) {
         console.log(`⏭️ Skipping already completed: ${query}`);
         continue;
      }

      console.log(`\n🔍 Scanning Google Maps for: ${query}...`);
      
      try {
        const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": mapsApiKey,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.websiteUri",
            "Referer": "http://localhost:3000"
          },
          body: JSON.stringify({ textQuery: query, maxResultCount: 20 })
        });
        
        const data = await res.json();
        if (data.error) {
           console.log(`   [!] Google API Error:`, data.error.message);
        }
        
        const places = data.places || [];
        const noWebsitePlaces = places.filter((p: any) => !p.websiteUri);
        console.log(`   Found ${places.length} total, ${noWebsitePlaces.length} without websites.`);

        for (const place of noWebsitePlaces) {
          const name = place.displayName?.text || "Unknown";
          const address = place.formattedAddress || city;
          
          console.log(`   -> Hunting email via Gemini for: ${name}`);
          const email = await findEmailViaGemini(name, address);
          
          if (email) {
            console.log(`      ✅ Found email: ${email}`);
            
            const existing = await prisma.lead.findFirst({ where: { email } });
            
            if (!existing) {
               await prisma.lead.create({
                 data: { name, location: address, email, status: "Scraped" }
               });
               console.log(`      💾 Saved to database!`);
               totalSaved++;
            } else {
               console.log(`      ⚠️ Already in database, skipping.`);
            }
          } else {
            console.log(`      ❌ No email found, skipping.`);
          }
          
          // Wait 30 seconds between Gemini calls to stay perfectly below the free tier limits
          await delay(30000);
        }
        
        // Mark this specific query (niche + city) as fully completed and save to disk
        completedQueries.add(query);
        saveProgress(completedQueries);

      } catch (error: any) {
         if (error.message === "QUOTA_EXCEEDED") {
           console.log(`\n🛑 HARD STOP: Gemini Quota Exceeded. Script is pausing to prevent burning API calls.`);
           console.log(`   Your progress is saved! Next time you run the script, it will pick up exactly here.`);
           return;
         }
         console.error(`   [!] Error for ${city}:`, error.message);
      }
      
      // Wait 5 seconds between cities
      await delay(5000);
    }
  }

  console.log(`\n🎉 Prospecting Complete! Safely extracted and saved ${totalSaved} highly qualified leads to your CRM.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
