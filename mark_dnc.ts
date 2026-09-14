import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function markDNC() {
  const leads = await prisma.lead.findMany({
    where: {
      name: {
        contains: "Hedberg"
      }
    }
  });

  if (leads.length > 0) {
    for (const lead of leads) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { 
          status: "DNC",
          email: null // Wiping the email completely for compliance
        }
      });
      console.log(`✅ Marked ${lead.name} as DNC and wiped email.`);
    }
  } else {
    console.log("❌ Could not find Hedberg in the database.");
  }
}

markDNC().catch(console.error).finally(() => prisma.$disconnect());
