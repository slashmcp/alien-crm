import { NextResponse } from "next/server";
import * as dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ 
        valid: false, 
        error: "Invalid email format provided." 
      }, { status: 400 });
    }

    const domain = email.split("@")[1];

    try {
      // Perform the MX Record Lookup
      const records = await resolveMx(domain);
      
      if (records && records.length > 0) {
        // Sort MX records by priority
        records.sort((a, b) => a.priority - b.priority);

        return NextResponse.json({
          email,
          domain,
          valid: true,
          mx_records: records,
          message: "Domain is configured to receive email."
        });
      } else {
        return NextResponse.json({
          email,
          domain,
          valid: false,
          error: "Domain exists but has no mail servers configured."
        });
      }
    } catch (dnsError: any) {
      return NextResponse.json({
        email,
        domain,
        valid: false,
        error: "DNS resolution failed. Domain is likely dead or unregistered."
      });
    }

  } catch (error: any) {
    return NextResponse.json({ 
      valid: false, 
      error: "Internal Server Error" 
    }, { status: 500 });
  }
}
