/**
 * Alien Verify SDK - Lightweight Email Verification for AI Agents
 * Usage: import { AlienVerifier } from './alien-verify-sdk';
 */

export class AlienVerifier {
  private endpoint: string;

  constructor(endpointUrl: string = "http://localhost:3000/api/verify") {
    this.endpoint = endpointUrl;
  }

  /**
   * Verifies an email address using the Alien Verification API
   */
  async verifyEmail(email: string) {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[Alien Verify SDK] Verification Request Failed:", error);
      return { valid: false, error: "Network or API failure." };
    }
  }
}

// ==========================================
// EXAMPLE USAGE (For R&D Testing)
// ==========================================
async function testSDK() {
  const verifier = new AlienVerifier();
  
  console.log("🛸 Initializing Alien Verify SDK...");
  
  console.log("\nTesting valid email (google.com):");
  const validRes = await verifier.verifyEmail("test@google.com");
  console.log(validRes);

  console.log("\nTesting fake email (fake-alien-domain.xyz):");
  const invalidRes = await verifier.verifyEmail("test@fake-alien-domain.xyz");
  console.log(invalidRes);
}

// Uncomment to run the test
// testSDK();
