import { PrismaClient } from "@prisma/client";
import * as dns from "dns";
import { promisify } from "util";

const prisma = new PrismaClient();
const resolveMx = promisify(dns.resolveMx);

async function verifyLeads() {
  console.log("🔍 Starting Email MX Verification...");

  const leads = await prisma.lead.findMany({
    where: {
      status: "Scraped",
      email: { not: null }
    }
  });

  if (leads.length === 0) {
    console.log("✅ No scraped leads with emails found.");
    return;
  }

  console.log(`Checking ${leads.length} leads for valid MX records...\n`);

  let validCount = 0;
  let invalidCount = 0;

  for (const lead of leads) {
    if (!lead.email) continue;
    
    const domain = lead.email.split("@")[1];
    if (!domain) {
      await markInvalid(lead.id, "Malformed email");
      invalidCount++;
      continue;
    }

    try {
      const records = await resolveMx(domain);
      if (records && records.length > 0) {
        // Has valid mail servers
        validCount++;
        process.stdout.write("✅ ");
      } else {
        await markInvalid(lead.id, "No MX records found");
        invalidCount++;
        process.stdout.write("❌ ");
      }
    } catch (e: any) {
      // Domain doesn't exist or DNS failed
      await markInvalid(lead.id, "Domain dead or no MX");
      invalidCount++;
      process.stdout.write("❌ ");
    }
  }

  console.log(`\n\n🎉 Verification Complete!`);
  console.log(`✅ Passed: ${validCount}`);
  console.log(`❌ Failed (Deleted): ${invalidCount}`);
  console.log("The dead emails have been purged from your CRM to protect your domain reputation.");
}

async function markInvalid(id: string, reason: string) {
  // We can either mark them as "Invalid" or just delete them to keep the database clean.
  // For cold email, it's safer to just delete the dead lead.
  await prisma.lead.delete({
    where: { id }
  });
}

verifyLeads().catch(console.error).finally(() => prisma.$disconnect());
