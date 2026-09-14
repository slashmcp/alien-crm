# Product Requirements Document (PRD): Automation Alien CRM

## 1. Product Vision
The **Automation Alien CRM** is not a traditional, cluttered dashboard. It is a "Zen Workspace"—a highly minimalist, collapsible, and natural-language-driven command center. Instead of clicking through complex menus, the user interacts with an AI Concierge via text or voice to automate lead prospecting, research, and outreach.

## 2. Core User Experience (UX/UI)
*   **Zen Interface:** Ultra-minimalist design. All traditional sidebars and tables are collapsible. 
*   **Light/Dark Toggle:** Fluid switching between dark mode and a clean light mode.
*   **Conversational First:** The primary interface is a chat/voice command prompt (e.g., *"Find 10 roofers in Austin, analyze their sites, and send the audit pitch"*).
*   **Voice Commands:** Web Speech API integration to allow hands-free operation.
*   **Mobile-First Design:** The entire CRM will be fully responsive so you can command it via voice from your phone while on the go.

## 3. Core Capabilities

### A. The Prospector (Interactive Maps & MCP)
*   **Interactive Visual Map:** A sleek, interactive map UI where you can drop a pin, draw a radius, and visually see scraped leads populate in real-time.
*   **Scraping:** Triggered visually or via natural language, it scrapes local businesses, website URLs, and contact info.

### B. The Brain (AI Personalization Engine)
*   **Custom LLM Integration:** Uses a provided API key (e.g., OpenAI, Anthropic, or Gemini).
*   **Intelligent Research & Vision:** The AI agent visits the scraped URLs to identify weaknesses. *(Feature idea: Pass a screenshot of their site to the Vision model so the AI can provide hyper-specific design feedback, like "your CTA button is hard to read on mobile").*
*   **Copywriting:** Automatically drafts highly personalized outreach emails using the CRM Blueprint "Message 2" template.

### C. The Outreach Engine (Resend & ElevenLabs)
*   **Automated Email:** Automatically schedule and fire personalized emails via Resend (`greetings@automationalien.com`).
*   **Voice AI Agents:** Integration with your existing ElevenLabs account to deploy autonomous inbound/outbound voice agents when leads require a phone call follow-up.

### D. Scalability (Future-Proofing)
*   **OAuth Integration:** Built with Auth.js (NextAuth) so you can safely invite team members later.
*   **Cloud Deployment Ready:** Architected to be easily deployed to Vercel or AWS Amplify.

## 4. Technical Stack
*   **Frontend:** Next.js (App Router), Tailwind CSS (Zen theme).
*   **Backend/API:** Next.js Server Actions.
*   **AI/Voice:** Web Speech API + External LLM API connection.
*   **Email:** Resend SDK.
*   **Database:** Local SQLite / Prisma (invisible to the user).

## 5. Next Steps for Implementation
1.  **Refactor UI:** Strip the current dashboard into a collapsible "Zen" layout with a central AI command prompt and theme toggle.
2.  **Connect The Brain:** Plug in the user's AI API key to enable intelligent lead analysis.
3.  **Connect Resend:** Build the automated email blasting pipeline.
4.  **Connect Maps:** Finalize the lead generation MCP hook.
