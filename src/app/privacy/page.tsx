"use client";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-[#111] p-10 rounded-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
        <p className="mb-4">
          When you use Automation Alien or the AlienVerify API, we collect information you provide directly to us (such as your email address when signing up for an API key via Google OAuth or Credentials).
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to provide, maintain, and improve our autonomous infrastructure services, and to communicate with you regarding your API usage.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Data Security</h2>
        <p className="mb-4">
          We implement appropriate technical and organizational measures designed to protect the security of any personal information we process.
        </p>
      </div>
    </div>
  );
}
