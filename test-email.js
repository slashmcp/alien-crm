const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

const emails = ['sentilabs01@gmail.com', 'sentilabs02@gmail.com', 'sentilabs03@gmail.com'];

async function sendTests() {
  for (const email of emails) {
    try {
      const data = await resend.emails.send({
        from: 'Will <will@automationalien.com>',
        reply_to: 'will@automationalien.com',
        to: [email],
        subject: 'Quick question about your Google listing',
        html: '<p style="font-family: sans-serif; white-space: pre-wrap;">Hi team,\n\nI noticed your spot gets awesome reviews, but you\'re missing out on hungry locals because you don\'t have a website linked to your Google listing. Setting up a basic online menu would easily drive way more weekly foot traffic, so grab a time here and I\'ll show you how we can set this up for you: https://calendar.app.google/9rNbxDT4tvcSAyk1A\n\nBest,\nWill\nautomationalien.com</p>'
      });
      console.log(`Success sending to ${email}:`, data);
    } catch (err) {
      console.error(`Error sending to ${email}:`, err);
    }
  }
}

sendTests();
