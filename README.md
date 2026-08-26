# Islamic Fasting Planner PRO SaaS MVP

This is a SaaS-ready Next.js scaffold for turning the static fasting planner into a hosted product.

## Included

- Next.js app shell
- Product dashboard using the generated 2027-2050 calendar data
- Account/profile page
- Signup and login pages
- Local demo session flow using browser storage
- Onboarding checklist
- MVP readiness status page
- Security/MFA page
- Functional local tracker page
- Billing/subscription page
- Admin moon-sighting console page
- API route stubs for registration, MFA enrollment, tracker records, moon-sighting, and Stripe webhook
- Health endpoint at `/api/health`
- Vercel deployment config with security headers
- Publishing checklist and preflight scripts
- GitHub Actions CI workflow
- Vercel staging instructions
- GitHub connection helper
- PostgreSQL Prisma schema
- Deployment checklist

## Local Setup

```bash
npm install
cp .env.example .env
npm run db:generate
npm run preflight
npm run dev
```

On Windows, if the npm PowerShell wrapper is blocked, use:

```cmd
START_LOCAL_SERVER.cmd
```

Then open:

```text
http://localhost:3000
```

## Production Requirements

Before production launch, complete:

- Real auth session wiring
- Email verification
- TOTP MFA enrollment and verification
- Hashed recovery codes
- Tracker/profile persistence using authenticated user ID
- Admin role enforcement
- Stripe webhook verification
- Database migrations and backups
- HTTPS custom domain
- Monitoring and audit logging

## Publishing

Use `PUBLISHING_CHECKLIST.md` for staging and production gates.
Use `GITHUB_PUBLISHING.md` or `CONNECT_GITHUB_REMOTE.cmd` to attach the local repo to GitHub.
Use `VERCEL_STAGING.md` to import the GitHub repo into Vercel.

## Safeguard

Projected Hijri dates are planning aids, not final religious determinations. Ramadan, Shawwal, Muharram, and Dhul-Hijjah should be confirmed through recognized moon-sighting authorities.
