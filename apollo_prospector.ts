import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();
const APOLLO_API_KEY = process.env.APOLLO_API_KEY;

if (!APOLLO_API_KEY) {
  console.error("❌ Missing APOLLO_API_KEY in .env.local!");
  console.log("Go to Apollo.io -> Settings -> Integrations -> API -> Create Key");
  process.exit(1);
}

// Search parameters
const KEYWORDS = "landscaping, tree service, fence, pressure washing, mobile detailing";
const LOCATION = "Texas, US";
const TARGET_PAGES = 3; // How many pages to scrape per run (approx 20 per page)

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runApolloProspector() {
  console.log("🚀 Starting Apollo.io API Prospector...");
  let totalSaved = 0;

  for (let page = 1; page <= TARGET_PAGES; page++) {
    console.log(`\n🔍 Fetching Page ${page} from Apollo database...`);
    
    try {
      const response = await fetch("https://api.apollo.io/v1/mixed_people/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "X-Api-Key": APOLLO_API_KEY,
        },
        body: JSON.stringify({
          q_keywords: KEYWORDS,
          person_locations: [LOCATION],
          contact_email_status: ["verified"], // Only pull people with verified emails
          page: page,
        })
      });

      if (!response.ok) {
        console.error(`   [!] Apollo API Error: ${response.status}`);
        const errorData = await response.text();
        console.error(`       ${errorData}`);
        break;
      }

      const data = await response.json();
      const people = data.people || [];

      console.log(`   Found ${people.length} contacts on this page.`);

      for (const person of people) {
        // Apollo masks emails unless you explicitly "unlock" them, but sometimes they provide them directly
        // on the free tier if the contact status is already public. 
        const email = person.email || person.contact_email;
        const name = person.organization?.name || person.name || "Local Business";
        const location = person.city ? `${person.city}, TX` : "Texas";
        const website = person.organization?.website_url || "";

        if (!email) {
          console.log(`      ⚠️ Email masked/missing for ${name}. Skipping...`);
          continue;
        }

        const exists = await prisma.lead.findFirst({ where: { email: email.toLowerCase() } });
        
        if (!exists) {
          await prisma.lead.create({
            data: {
              name: name,
              location: location,
              email: email.toLowerCase(),
              website: website,
              status: "Scraped"
            }
          });
          console.log(`      ✅ Saved: ${email} (${name})`);
          totalSaved++;
        }
      }

    } catch (e: any) {
      console.error(`   [!] Fatal Request Error:`, e.message);
    }
    
    // 5-second delay to respect Apollo API rate limits
    await delay(5000);
  }

  console.log(`\n🎉 Apollo Prospecting Complete! Extracted and saved ${totalSaved} leads.`);
}

runApolloProspector().catch(console.error).finally(() => prisma.$disconnect());
