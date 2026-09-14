import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The best Texas cities for blue-collar work
const CITIES = ['austin', 'dallas', 'houston', 'sanantonio', 'killeen', 'collegestation', 'waco', 'corpuschristi'];
// The services we are targeting
const QUERIES = ['mobile detailing', 'tree service', 'fence', 'pressure washing', 'landscaping'];

// Regex to pull raw emails directly out of the ad text
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runCraigslistScraper() {
  console.log('🚀 Starting the Free Craigslist RSS Scraper...');
  let totalSaved = 0;

  for (const city of CITIES) {
    for (const query of QUERIES) {
      console.log(`\n🔍 Scanning Craigslist: ${city.toUpperCase()} for '${query}'...`);
      const url = `https://${city}.craigslist.org/search/bbb?format=rss&query=${encodeURIComponent(query)}`;
      
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        
        if (!res.ok) {
           console.log(`   [!] Blocked by Craigslist (Status: ${res.status})`);
           continue;
        }

        const xml = await res.text();
        const items = xml.split('<item>');
        items.shift();

        let foundInCity = 0;
        for (const item of items) {
          const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
          const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
          const linkMatch = item.match(/<link>(.*?)<\/link>/);

          const title = titleMatch ? titleMatch[1] : 'Unknown Service';
          const desc = descMatch ? descMatch[1] : '';
          const link = linkMatch ? linkMatch[1] : '';

          // Find raw emails in the description text
          const emails = desc.match(emailRegex) || title.match(emailRegex);

          if (emails && emails.length > 0) {
            const email = emails[0].toLowerCase();
            // Ignore Craigslist's automated proxy emails
            if (email.includes('craigslist.org')) continue;

            const exists = await prisma.lead.findFirst({ where: { email } });
            
            if (!exists) {
              await prisma.lead.create({
                data: {
                  name: title.substring(0, 50),
                  location: city,
                  email: email,
                  website: link,
                  status: 'Scraped'
                }
              });
              console.log(`      ✅ Found Email: ${email}`);
              foundInCity++;
              totalSaved++;
            }
          }
        }
        if (foundInCity > 0) console.log(`      💾 Saved ${foundInCity} new leads to CRM!`);
        else console.log(`      ❌ No raw emails found in this batch.`);
      } catch (e: any) {
        console.error(`   [!] Error scraping ${city}:`, e.message);
      }
      // Wait 3 seconds to avoid IP block
      await delay(3000);
    }
  }
  console.log(`\n🎉 Craigslist Sweep Complete! Extracted and saved ${totalSaved} 100% free leads.`);
}

runCraigslistScraper().catch(console.error).finally(() => prisma.$disconnect());
