# Deployment Procedure

## Recommended Production Stack

- App hosting: Vercel
- Database: Neon or Supabase PostgreSQL
- Auth: Auth.js, Clerk, or Supabase Auth
- Billing: Stripe
- Email: Resend or Postmark
- Monitoring: Sentry

## Procedure

1. Create a private GitHub repository.
2. Push this project.
3. Create a managed PostgreSQL database.
4. Set `DATABASE_URL`.
5. Set `AUTH_SECRET` and `AUTH_URL`.
6. Configure Stripe products: Free, Pro, Admin.
7. Set Stripe keys and webhook secret.
8. Configure email provider for verification and login alerts.
9. Run Prisma migration.
10. Seed calendar data.
11. Deploy staging.
12. Test signup, login, MFA enrollment, tracker save, billing flow, and admin moon-sighting publishing.
13. Add production domain and HTTPS.
14. Enable database backups.
15. Enable monitoring and audit alerts.
16. Launch beta.

The GitHub repository is already connected at:

```text
https://github.com/haggytomtom-svg/islamic-fasting-planner-saas-mvp
```

Use `VERCEL_STAGING.md` for the first Vercel import.

## Local Preflight

```bash
npm run preflight
```

## Staging Preflight

```bash
npm run preflight:staging
```

## Production Preflight

```bash
npm run preflight:production
```

## Health Check

After deployment, check:

```text
https://YOUR_DOMAIN/api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "islamic-fasting-planner-saas-mvp"
}
```

## Security Gate Before Public Launch

- All privileged routes require role checks.
- All account mutations create audit logs.
- MFA recovery codes are shown once and stored only as hashes.
- Stripe webhook signatures are verified.
- Login and OTP endpoints are rate-limited.
- Session cookies are Secure, HttpOnly, and SameSite.
- Religious projection disclaimer appears on dashboard, exports, onboarding, and guide pages.
