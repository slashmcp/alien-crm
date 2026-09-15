# 🛸 alien-verify-sdk

Lightweight, ultra-fast email verification SDK designed specifically for **autonomous AI agent loops**, scrapers, and high-volume cold outreach engines.

Powered by [Automation Alien](https://automationalien.com/verify).

## Features
- ⚡ **Zero Bloat**: Lightweight HTTP client with native TypeScript types.
- 🛡️ **Comprehensive Checks**: Syntax (RFC 5322), MX DNS records, Disposable/Burner domains, Free mailboxes (Gmail/Yahoo), and Role inboxes (`info@`, `admin@`).
- 🎯 **Deliverability Scoring**: Instant 0–100 score and verdict (`SAFE_TO_SEND`, `RISKY`, `DO_NOT_SEND`).
- 📦 **Parallel Batching**: Check up to 50 emails simultaneously with `verifyBatch()`.

## Installation

```bash
npm install alien-verify-sdk
# or
pnpm add alien-verify-sdk
```

## Quick Start

```typescript
import { AlienVerifier } from 'alien-verify-sdk';

// Initialize client (pass your API key, or use 'sandbox' for testing)
const verifier = new AlienVerifier('your_api_key');

async function run() {
  // 1. Verify a single email
  const res = await verifier.verifyEmail('elon@spacex.com');
  console.log(res.verdict); // "SAFE_TO_SEND"
  console.log(res.score);   // 100
  console.log(res.details);
  // { formatValid: true, mxFound: true, isDisposable: false, isFreeProvider: false, isRoleAccount: false, primaryMxServer: "..." }

  // 2. Batch verification for lead lists
  const batch = await verifier.verifyBatch([
    'lead1@company.com',
    'burner@tempmail.com',
    'office@roofing.org'
  ]);
  console.log(`Verified ${batch.safe_count} of ${batch.total} leads.`);

  // 3. Fast filter safe emails
  const cleanList = await verifier.filterSafe([
    'elon@spacex.com',
    'fake@invaliddeadsite.xyz'
  ]);
  console.log(cleanList); // ['elon@spacex.com']
}

run();
```

## API Response Schema

```typescript
interface VerificationResponse {
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
```

## License
MIT
