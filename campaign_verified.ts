import * as dns from "dns";
import { PrismaClient } from "@prisma/client";
import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Use authoritative DNS resolvers
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}

const prisma = new PrismaClient();

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
  "trashmail.com", "yopmail.com", "sharklasers.com", "dispostable.com",
  "getairmail.com", "throwawaymail.com", "temp-mail.org", "fakeinbox.com",
  "inboxkitten.com", "burnermail.io", "maildrop.cc", "crazymailing.com"
]);

const ROLE_PREFIXES = new Set([
  "admin", "administrator", "info", "support", "sales", "contact",
  "billing", "hello", "office", "help", "jobs", "careers", "marketing",
  "press", "legal", "compliance", "team", "inquiries", "service", "leads",
  "estimates", "quotes"
]);

async function verifyEmail(email: string) {
  const trimmed = (email || "").trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) return { email: trimmed, verdict: "DO_NOT_SEND", score: 0, reason: "Bad syntax" };

  const [user, domain] = trimmed.split("@");
  if (DISPOSABLE_DOMAINS.has(domain)) return { email: trimmed, verdict: "DO_NOT_SEND", score: 5, reason: "Disposable domain" };

  const isRole = ROLE_PREFIXES.has(user);
  let mxServer: string | null = null;

  try {
    const records = await dns.promises.resolveMx(domain);
    if (records && records.length > 0) {
      records.sort((a, b) => a.priority - b.priority);
      mxServer = records[0].exchange;
    }
  } catch (err) {}

  if (!mxServer) return { email: trimmed, verdict: "DO_NOT_SEND", score: 0, reason: "No MX records" };

  let score = 100;
  if (isRole) score -= 15;

  return { email: trimmed, verdict: score >= 80 ? "SAFE_TO_SEND" : "RISKY", score, reason: isRole ? "Role inbox" : "Clean", mxServer };
}

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: { user: process.env.ZOHO_EMAIL, pass: process.env.ZOHO_PASSWORD },
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log("\n========================================");
  console.log("  PHASE 1: VERIFY CANDIDATE LEADS");
  console.log("========================================\n");

  const candidates = await prisma.lead.findMany({
    where: { status: "Scraped", email: { not: null } },
    take: 50 // Pull extra in case some fail verification
  });

  console.log(`Found ${candidates.length} uncontacted leads with emails. Verifying...\n`);

  const verified: typeof candidates = [];
  const rejected: { name: string; email: string; reason: string }[] = [];

  for (const lead of candidates) {
    const result = await verifyEmail(lead.email!);
    if (result.verdict === "SAFE_TO_SEND" || result.verdict === "RISKY") {
      verified.push(lead);
      console.log(`  ✅ [${result.verdict}] ${lead.email} (Score: ${result.score}/100) -> ${result.mxServer}`);
    } else {
      rejected.push({ name: lead.name, email: lead.email!, reason: result.reason });
      console.log(`  ❌ [DO_NOT_SEND] ${lead.email} -> ${result.reason}`);
    }

    if (verified.length >= 30) break; // Cap at 30 verified
  }

  console.log(`\n--- Verification Summary ---`);
  console.log(`  Passed: ${verified.length}`);
  console.log(`  Rejected: ${rejected.length}`);
  console.log(`  Sending to: ${Math.min(verified.length, 30)} leads\n`);

  if (verified.length === 0) {
    console.log("No verified leads to send. Exiting.");
    return;
  }

  console.log("========================================");
  console.log("  PHASE 2: SEND OUTREACH EMAILS");
  console.log("========================================\n");

  const batch = verified.slice(0, 30);
  let successCount = 0;

  for (const lead of batch) {
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.6; max-width: 600px;">
        <p>Hi team,</p>
        <p>I came across ${lead.name} and noticed your strong reputation in ${lead.location}.</p>
        <p>A lot of local contractors we talk with lose potential jobs because property owners want a quick estimate or inspection date without having to play phone tag during work hours.</p>
        <p>I put together a clean, interactive mockup for ${lead.name} showing an automated estimate &amp; lead capture system that lets local customers request quotes and schedule appointments 24/7.</p>
        <p>No pressure at all\u2014I'm happy to send the preview over if you'd like to check it out.</p>
        <p>Would you like me to send the mockup link?</p>
        <p style="margin-top: 24px;">Best,<br><strong>Will</strong><br><a href="https://automationalien.com" style="color: #10b981; text-decoration: none; font-weight: 500;">automationalien.com</a></p>
        <div style="margin-top: 45px; border-top: 1px solid #eee; padding-top: 12px; font-size: 11px; color: #888;">
          <p>Automation Alien \u2022 Austin, TX<br>
          If you'd prefer not to hear from us, just reply with "unsubscribe" and we won't reach out again.</p>
        </div>
      </div>
    `;

    try {
      console.log(`  -> Sending to ${lead.name} (${lead.email})...`);
      const info = await transporter.sendMail({
        from: '"Will" <will@automationalien.com>',
        replyTo: 'will@automationalien.com',
        to: lead.email as string,
        subject: `Quick idea for ${lead.name} (interactive mockup)`,
        html: htmlBody,
      });

      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: "Outreach Sent", outreachDate: new Date(), outreachCopy: htmlBody }
      });

      console.log(`     ✅ Delivered (${info.messageId})`);
      successCount++;
      await delay(10000); // 10s cooldown between sends
    } catch (e: any) {
      console.error(`     ❌ Failed: ${e.message}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`  CAMPAIGN COMPLETE: ${successCount}/${batch.length} emails sent`);
  console.log(`========================================\n`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
