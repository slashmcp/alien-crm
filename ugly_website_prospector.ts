import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();
const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!mapsApiKey) {
  console.error("Missing GOOGLE_MAPS_API_KEY in .env.local");
  process.exit(1);
}

const TARGET_NICHES = ["Roofing", "HVAC", "Tree Service", "Snow Removal"];
const TARGET_CITIES = [
  // Iowa (Completed)
  "Des Moines, IA", "Cedar Rapids, IA", "Davenport, IA", "Sioux City, IA", "Iowa City, IA", "Waterloo, IA", "Ames, IA",
  // Minnesota
  "Minneapolis, MN", "St. Paul, MN", "Rochester, MN", "Duluth, MN", "St. Cloud, MN",
  // Wisconsin
  "Milwaukee, WI", "Madison, WI", "Green Bay, WI", "Kenosha, WI", "Appleton, WI",
  // Illinois
  "Chicago, IL", "Aurora, IL", "Rockford, IL", "Joliet, IL", "Naperville, IL", "Peoria, IL",
  // Nebraska
  "Omaha, NE", "Lincoln, NE", "Bellevue, NE", "Grand Island, NE",
  // Michigan
  "Detroit, MI", "Grand Rapids, MI", "Lansing, MI", "Ann Arbor, MI", "Kalamazoo, MI",
  // Ohio
  "Columbus, OH", "Cleveland, OH", "Cincinnati, OH", "Toledo, OH", "Akron, OH",
  // Indiana
  "Indianapolis, IN", "Fort Wayne, IN", "Evansville, IN", "South Bend, IN",
  // Missouri
  "Kansas City, MO", "St. Louis, MO", "Springfield, MO", "Columbia, MO"
];

const PROGRESS_FILE = "ugly_website_progress.json";

function loadProgress(): Set<string> {
  if (fs.existsSync(PROGRESS_FILE)) {
    return new Set(JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8")));
  }
  return new Set();
}

function saveProgress(progressSet: Set<string>) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(Array.from(progressSet), null, 2));
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const badEmails = ["sentry", "wix", "godaddy", "example", "domain", "jpg", "png", "webp"];

async function scrapeWebsiteForEmail(url: string) {
  try {
    // Timeout so we don't hang on dead websites
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) return null;
    
    const html = await res.text();
    const emails = html.match(emailRegex);
    
    if (emails) {
      for (let email of emails) {
        email = email.toLowerCase();
        // Filter out image extensions or standard platform emails
        const isBad = badEmails.some(bad => email.includes(bad));
        if (!isBad) return email;
      }
    }
  } catch (e) {
    // Ignore fetch errors (timeout, dead link, etc.)
  }
  return null;
}

async function run() {
  console.log("🚀 Starting 'Ugly Website' Prospector...");
  let totalSaved = 0;
  
  const completedQueries = loadProgress();

  for (const niche of TARGET_NICHES) {
    for (const city of TARGET_CITIES) {
      const query = `${niche} in ${city}`;
      
      if (completedQueries.has(query)) {
         console.log(`⏭️ Skipping already completed: ${query}`);
         continue;
      }

      console.log(`\n🔍 Scanning Maps for: ${query}...`);
      
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
        const places = data.places || [];
        
        // We only want businesses WITH websites this time
        const websitePlaces = places.filter((p: any) => p.websiteUri);
        console.log(`   Found ${websitePlaces.length} businesses with websites to scan.`);

        for (const place of websitePlaces) {
          const name = place.displayName?.text || "Unknown";
          const address = place.formattedAddress || city;
          const website = place.websiteUri;
          
          console.log(`   -> Scraping HTML for: ${name}`);
          const email = await scrapeWebsiteForEmail(website);
          
          if (email) {
            console.log(`      ✅ Found email hidden on website: ${email}`);
            const existing = await prisma.lead.findFirst({ where: { email } });
            
            if (!existing) {
               await prisma.lead.create({
                 data: { name, location: address, email, website, status: "Scraped" }
               });
               console.log(`      💾 Saved to CRM!`);
               totalSaved++;
            }
          } else {
            console.log(`      ❌ No email found on website.`);
          }
        }
        
        completedQueries.add(query);
        saveProgress(completedQueries);

      } catch (error: any) {
         console.error(`   [!] Error for ${city}:`, error.message);
      }
      
      await delay(2000); // 2 second delay between cities
    }
  }

  console.log(`\n🎉 Prospecting Complete! Safely extracted and saved ${totalSaved} leads.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
