import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import csv from 'csv-parser';

const prisma = new PrismaClient();

async function importLeads() {
  const results: any[] = [];
  let added = 0;
  let skipped = 0;

  console.log("🚀 Starting Apollo.io CSV Importer...");

  if (!fs.existsSync("apollo_leads.csv")) {
    console.log("❌ Error: Could not find 'apollo_leads.csv'. Please make sure the file is in the alien-crm folder!");
    process.exit(1);
  }

  fs.createReadStream("apollo_leads.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      console.log(`📂 Read ${results.length} rows from CSV. Pumping into CRM...`);

      for (const row of results) {
        // Apollo CSV headers are usually "First Name", "Company", "Email", "Website"
        // If yours are slightly different, just update the names inside the brackets below:
        const email = row["Email"] || row["email"] || row["Email Address"];
        const name = row["Company"] || row["Company Name"] || row["First Name"] || "Local Business";
        const location = row["City"] || row["State"] || "Texas";
        const website = row["Website"] || row["Company Website"] || "";

        if (!email) {
          skipped++;
          continue;
        }

        // Check if the lead already exists in your CRM
        const exists = await prisma.lead.findFirst({ where: { email: email.toLowerCase() } });
        
        if (!exists) {
          await prisma.lead.create({
            data: {
              name,
              location,
              email: email.toLowerCase(),
              website,
              status: "Scraped"
            }
          });
          added++;
          console.log(`   ✅ Imported: ${email}`);
        } else {
          skipped++;
        }
      }

      console.log(`\n🎉 CSV Import Complete! Added ${added} new leads. (Skipped ${skipped} duplicates/empty rows)`);
      console.log(`You can now run 'npx tsx campaign_runner.ts' to start emailing them!`);
      await prisma.$disconnect();
    });
}

importLeads().catch(console.error);
