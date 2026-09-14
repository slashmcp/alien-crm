"use client";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-[#111] p-10 rounded-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using the Automation Alien API, CRM, or associated services, you agree to be bound by these Terms.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Acceptable Use</h2>
        <p className="mb-4">
          You agree not to use the AlienVerify API for any unlawful purpose, or to verify emails in violation of the CAN-SPAM Act or GDPR regulations. Our API is intended for list cleaning and autonomous agent data verification.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your access to the API immediately, without prior notice or liability, for any reason, including breach of these Terms.
        </p>
      </div>
    </div>
  );
}
