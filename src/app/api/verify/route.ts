import { NextResponse } from "next/server";
import { verifyEmail } from "@/lib/verifier/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support batch verification: { emails: string[] }
    if (Array.isArray(body.emails)) {
      const emails: string[] = body.emails.slice(0, 50); // Cap batch at 50 per request
      const results = await Promise.all(emails.map(e => verifyEmail(e)));
      return NextResponse.json({
        total: results.length,
        safe_count: results.filter(r => r.verdict === "SAFE_TO_SEND").length,
        results
      });
    }

    // Single verification: { email: string }
    const { email } = body;
    if (!email || typeof email !== "string") {
      return NextResponse.json({ 
        valid: false, 
        error: "Missing required 'email' or 'emails' parameter in JSON payload." 
      }, { status: 400 });
    }

    const result = await verifyEmail(email);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Verification API Error:", error);
    return NextResponse.json({ 
      valid: false, 
      error: "Internal Server Error during verification." 
    }, { status: 500 });
  }
}
