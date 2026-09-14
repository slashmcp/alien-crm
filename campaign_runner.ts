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
    
    // Construct the highly-optimized cold email
    const htmlBody = `
      <div style="font-family: sans-serif; font-size: 15px; color: #333; line-height: 1.5;">
        <p>Hi team,</p>
        <p>I came across ${lead.name} and noticed you have strong Google reviews, but when I clicked through to your website, it was a bit hard to navigate on mobile and missing a clear way for customers to ${conversionAction} without calling.</p>
        <p>I mocked up a fast, modern version of your site that makes it incredibly easy for visitors to request an estimate and turns more of your Google traffic into actual jobs.</p>
        <p>No pressure—I'm happy to send the preview over if you'd like to see it.</p>
        <p>Would you like me to send the mockup link?</p>
        <p>Best,<br>Will<br><a href="https://automationalien.com" style="color: #0066cc;">automationalien.com</a></p>
        
        <div style="margin-top: 50px; font-size: 11px; color: #999;">
          <p>123 Main St, Austin, TX 78701<br>
          If you don't want to receive these emails, simply reply "unsubscribe".</p>
        </div>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: '"Will" <will@automationalien.com>', // sender address
        replyTo: 'will@automationalien.com',
        to: lead.email as string,
        subject: `Quick idea for ${lead.name}'s website`,
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
