import { PrismaClient } from "@prisma/client";
import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD) {
  console.error("❌ Missing ZOHO_EMAIL or ZOHO_PASSWORD in .env.local");
  process.exit(1);
}

// Configure Zoho SMTP Transporter
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD,
  },
});

// Helper to extract the niche-specific pain point
function getConversionAction(businessName: string) {
  const name = businessName.toLowerCase();
  if (name.includes("detail") || name.includes("wash") || name.includes("clean")) {
    return "get a fast estimate, see your service packages, or text for availability";
  } else if (name.includes("tree") || name.includes("arbor")) {
    return "request an emergency estimate or view your specific service areas";
  } else if (name.includes("fence") || name.includes("build")) {
    return "upload photos for a preliminary estimate or compare your past work";
  } else if (name.includes("roof") || name.includes("exteriors")) {
    return "request a free roof inspection or emergency storm damage estimate";
  } else if (name.includes("hvac") || name.includes("heating") || name.includes("air")) {
    return "request an emergency AC/Furnace repair quote";
  } else if (name.includes("snow") || name.includes("plow") || name.includes("landscape")) {
    return "view your seasonal packages and request a service estimate";
  }
  // Generic fallback for blue collar
  return "view your past work, see your service areas, or request a fast estimate";
}

// Delay helper to avoid hitting Zoho rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runCampaign() {
  console.log("🚀 Starting Daily Drip Campaign via Zoho Mail...");

  // Fetch up to 30 leads that haven't been emailed yet
  const leads = await prisma.lead.findMany({
    where: {
      status: "Scraped",
      email: { not: null }
    },
    take: 30
  });

  if (leads.length === 0) {
    console.log("✅ No new leads to email today. Queue is empty!");
    return;
  }

  console.log(`📬 Found ${leads.length} leads ready for outreach. Sending emails...`);

  let successCount = 0;

  for (const lead of leads) {
    console.log(`   -> Emailing ${lead.name} at ${lead.email}...`);

    const conversionAction = getConversionAction(lead.name);
    
    // Construct the refined hybrid pitch
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.6; max-width: 600px;">
        <p>Hi team,</p>
        <p>I came across ${lead.name} and noticed your strong reputation in ${lead.location}.</p>
        <p>A lot of local contractors we talk with lose potential jobs because property owners want a quick estimate or inspection date without having to play phone tag during work hours.</p>
        <p>I put together a clean, interactive mockup for ${lead.name} showing an automated estimate & lead capture system that lets local customers request quotes and schedule appointments 24/7.</p>
        <p>No pressure at all—I'm happy to send the preview over if you'd like to check it out.</p>
        <p>Would you like me to send the mockup link?</p>
        <p style="margin-top: 24px;">Best,<br><strong>Will</strong><br><a href="https://automationalien.com" style="color: #10b981; text-decoration: none; font-weight: 500;">automationalien.com</a></p>
        
        <div style="margin-top: 45px; border-top: 1px solid #eee; padding-top: 12px; font-size: 11px; color: #888;">
          <p>Automation Alien • Austin, TX<br>
          If you'd prefer not to hear from us, just reply with "unsubscribe" and we won't reach out again.</p>
        </div>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: '"Will" <will@automationalien.com>',
        replyTo: 'will@automationalien.com',
        to: lead.email as string,
        subject: `Quick idea for ${lead.name} (interactive mockup)`,
        html: htmlBody,
      });

      // Mark the lead as Outreach Sent and save the exact copy/date
      await prisma.lead.update({
        where: { id: lead.id },
        data: { 
          status: "Outreach Sent",
          outreachDate: new Date(),
          outreachCopy: htmlBody
        }
      });

      console.log(`      ✅ Sent successfully (ID: ${info.messageId})`);
      successCount++;

      // Wait 10 seconds between emails to keep Zoho account healthy
      await delay(10000);

    } catch (e: any) {
      console.error(`      [!] Error sending to ${lead.email}:`, e.message);
    }
  }

  console.log(`\n🎉 Campaign complete! Successfully delivered ${successCount} emails today via Zoho.`);
}

runCampaign().catch(console.error).finally(() => prisma.$disconnect());
