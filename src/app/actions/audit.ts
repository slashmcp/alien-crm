'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function runAudit(lead: any) {
  console.log("Running REAL AI audit for:", lead.name);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `You are a world-class growth consultant named Will. Write a short, punchy, 2-sentence "Value Add / Audit" cold email (Message 2) to a local business.
    
Business Name: ${lead.name}
Location: ${lead.location}
Website (if any): ${lead.website || 'No website listed'}

The goal is to point out one realistic thing they could improve about their online presence or ranking to get more customers. 
Instead of just asking if they are open to a chat, give them a direct call-to-action to book a time on your calendar using this exact link: https://calendar.app.google/9rNbxDT4tvcSAyk1A

Must include a proper greeting like "Hi [First Name]" or "Hi [Business Name] team,"
Keep it highly personalized, very casual, pure text (no subject line). Do not use placeholders like [Your Name]. 
Sign off EXACTLY as:
"Best,
Will
automationalien.com"`;

    const result = await model.generateContent(prompt);
    const draft = result.response.text().trim();

    return {
      success: true,
      draft: draft
    };
  } catch (error: any) {
    console.error("Gemini AI Error:", error.message);
    return {
      success: false,
      draft: `Error running audit: ${error.message}`
    };
  }
}
