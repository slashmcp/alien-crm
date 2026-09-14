const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTest() {
  try {
    const data = await resend.emails.send({
      from: 'Will <will@automationalien.com>',
      to: ['ali@museaestheticstudio.com'],
      reply_to: 'williamtflynn@gmail.com', // Putting this back temporarily for this specific test
      subject: 'Quick question about your site',
      html: '<p style="font-family: sans-serif; white-space: pre-wrap;">Hi Ali,\n\nI was doing some research on local businesses in Ankeny and came across your website. I noticed a few quick wins where you could capture more leads from Google, specifically regarding your mobile layout. \n\nInstead of just asking if you are open to a chat, you can book a time directly on my calendar here: https://calendar.app.google/9rNbxDT4tvcSAyk1A\n\nBest,\nWill\nautomationalien.com</p>'
    });
    console.log(`Success sending to ali@museaestheticstudio.com:`, data);
  } catch (err) {
    console.error(`Error:`, err);
  }
}

sendTest();
