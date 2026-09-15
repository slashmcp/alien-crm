import * as dns from "dns";

// Use authoritative resolvers to avoid stale local ISP caches
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Fallback to default resolver if restricted
}

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
  "trashmail.com", "yopmail.com", "sharklasers.com", "dispostable.com",
  "getairmail.com", "throwawaymail.com", "temp-mail.org", "fakeinbox.com",
  "inboxkitten.com", "burnermail.io", "maildrop.cc", "crazymailing.com",
  "mohmal.com", "mytemp.email", "nada.ltd", "tempmailaddress.com"
]);

const FREE_PROVIDERS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "icloud.com", "zoho.com", "protonmail.com", "mail.com", "gmx.com",
  "live.com", "msn.com", "yandex.com", "comcast.net", "sbcglobal.net"
]);

const ROLE_PREFIXES = new Set([
  "admin", "administrator", "info", "support", "sales", "contact",
  "billing", "hello", "office", "help", "jobs", "careers", "marketing",
  "press", "legal", "compliance", "team", "inquiries", "service", "leads",
  "estimates", "quotes"
]);

export interface VerificationResult {
  email: string;
  user: string;
  domain: string;
  valid: boolean;
  score: number; // 0 - 100
  verdict: "SAFE_TO_SEND" | "RISKY" | "DO_NOT_SEND";
  details: {
    formatValid: boolean;
    mxFound: boolean;
    isDisposable: boolean;
    isFreeProvider: boolean;
    isRoleAccount: boolean;
    primaryMxServer: string | null;
  };
  reason: string;
}

export async function verifyEmail(email: string): Promise<VerificationResult> {
  const trimmed = (email || "").trim().toLowerCase();
  
  // 1. Basic Format / Syntax Validation (RFC 5322 subset)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  if (!emailRegex.test(trimmed)) {
    return {
      email: trimmed,
      user: "",
      domain: "",
      valid: false,
      score: 0,
      verdict: "DO_NOT_SEND",
      details: {
        formatValid: false,
        mxFound: false,
        isDisposable: false,
        isFreeProvider: false,
        isRoleAccount: false,
        primaryMxServer: null,
      },
      reason: "Malformed email syntax or invalid domain structure."
    };
  }

  const [user, domain] = trimmed.split("@");

  // 2. Check Disposable
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  if (isDisposable) {
    return {
      email: trimmed,
      user,
      domain,
      valid: false,
      score: 5,
      verdict: "DO_NOT_SEND",
      details: {
        formatValid: true,
        mxFound: false,
        isDisposable: true,
        isFreeProvider: false,
        isRoleAccount: false,
        primaryMxServer: null,
      },
      reason: "Known disposable or burner email domain."
    };
  }

  // 3. Flags for Free Provider & Role Account
  const isFreeProvider = FREE_PROVIDERS.has(domain);
  const isRoleAccount = ROLE_PREFIXES.has(user);

  // 4. DNS MX Lookup
  let mxFound = false;
  let primaryMxServer: string | null = null;

  try {
    const records = await dns.promises.resolveMx(domain);
    if (records && records.length > 0) {
      records.sort((a, b) => a.priority - b.priority);
      mxFound = true;
      primaryMxServer = records[0].exchange;
    }
  } catch (err) {
    mxFound = false;
  }

  if (!mxFound) {
    return {
      email: trimmed,
      user,
      domain,
      valid: false,
      score: 0,
      verdict: "DO_NOT_SEND",
      details: {
        formatValid: true,
        mxFound: false,
        isDisposable: false,
        isFreeProvider,
        isRoleAccount,
        primaryMxServer: null,
      },
      reason: "Domain does not possess valid Mail Exchange (MX) records."
    };
  }

  // 5. Calculate Score & Verdict
  let score = 100;
  if (isRoleAccount) score -= 15; // Role accounts have slightly lower direct response rates
  if (isFreeProvider) score -= 10; // Free mailboxes have less commercial stability than custom domains

  let verdict: "SAFE_TO_SEND" | "RISKY" | "DO_NOT_SEND" = "SAFE_TO_SEND";
  if (score < 80) {
    verdict = "RISKY";
  }

  let reason = "Email passed syntax, DNS, and deliverability checks.";
  if (isRoleAccount && isFreeProvider) {
    reason = "Generic department inbox hosted on a free public provider.";
  } else if (isRoleAccount) {
    reason = "Valid corporate domain, but addressed to a shared role/department inbox.";
  } else if (isFreeProvider) {
    reason = "Valid mailbox hosted on a free email provider (e.g. Gmail/Yahoo).";
  }

  return {
    email: trimmed,
    user,
    domain,
    valid: true,
    score,
    verdict,
    details: {
      formatValid: true,
      mxFound: true,
      isDisposable: false,
      isFreeProvider,
      isRoleAccount,
      primaryMxServer,
    },
    reason
  };
}
