export interface VerificationDetails {
  formatValid: boolean;
  mxFound: boolean;
  isDisposable: boolean;
  isFreeProvider: boolean;
  isRoleAccount: boolean;
  primaryMxServer: string | null;
}

export interface VerificationResponse {
  email: string;
  user: string;
  domain: string;
  valid: boolean;
  score: number; // 0 - 100
  verdict: "SAFE_TO_SEND" | "RISKY" | "DO_NOT_SEND";
  details: VerificationDetails;
  reason: string;
}

export interface BatchVerificationResponse {
  total: number;
  safe_count: number;
  results: VerificationResponse[];
}

export class AlienVerifier {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string = "sandbox", endpoint: string = "https://automationalien.com/api/verify") {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  /**
   * Verify a single email address
   */
  async verifyEmail(email: string): Promise<VerificationResponse> {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ email })
    });

    if (!res.ok) {
      throw new Error(`AlienVerifier API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Verify up to 50 emails in a single parallel batch
   */
  async verifyBatch(emails: string[]): Promise<BatchVerificationResponse> {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ emails })
    });

    if (!res.ok) {
      throw new Error(`AlienVerifier API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Filter a list of emails to only return addresses that meet minimum deliverability score
   */
  async filterSafe(emails: string[], minScore: number = 80): Promise<string[]> {
    const batch = await this.verifyBatch(emails);
    return batch.results
      .filter(r => r.valid && r.score >= minScore)
      .map(r => r.email);
  }
}

export default AlienVerifier;
