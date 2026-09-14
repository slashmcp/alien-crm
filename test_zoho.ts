import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD) {
  console.error("❌ Missing ZOHO_EMAIL or ZOHO_PASSWORD in .env.local");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD,
  },
});

async function testZoho() {
  console.log("🔄 Attempting to log into Zoho SMTP...");
  
  try {
    await transporter.verify();
    console.log("✅ Successfully authenticated with Zoho!");
    
    console.log("📨 Sending warmup emails to sentilabs 1-5...");
    const info = await transporter.sendMail({
      from: `"Will" <${process.env.ZOHO_EMAIL}>`,
      to: "sentilabs01@gmail.com, sentilabs02@gmail.com, sentilabs03@gmail.com, sentilabs04@gmail.com, sentilabs05@gmail.com",
      subject: "Warmup Message - Please mark as NOT SPAM",
      html: "<p>This is a manual warmup email. Please move this to the primary inbox to teach Google that automationalien.com is a highly trusted sender!</p>",
    });

    console.log(`🎉 Success! Email sent (Message ID: ${info.messageId})`);
    console.log("Check your Zoho inbox (and spam folder) to see where it landed!");

  } catch (error: any) {
    console.error("❌ Zoho Authentication Failed:", error.message);
    console.log("\nIf you got an authentication error, you likely need to generate an 'App Password' in Zoho:");
    console.log("1. Log into accounts.zoho.com");
    console.log("2. Go to Security -> App Passwords");
    console.log("3. Generate a new password, and paste it as ZOHO_PASSWORD in .env.local");
  }
}

testZoho();
