import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Make sure to set RESEND_API_KEY in .env.local
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(request: Request) {
  try {
    const { to, subject, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: 'Will <will@automationalien.com>',
      reply_to: 'will@automationalien.com',
      to: [to],
      subject: subject || "Quick question",
      html: `<p style="font-family: sans-serif; white-space: pre-wrap;">${message}</p>`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
