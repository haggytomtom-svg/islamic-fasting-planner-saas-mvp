# Publishing Checklist

## Staging

- Create GitHub repository.
- Push `islamic-fasting-planner-saas-mvp`.
- Create Vercel project from the GitHub repository.
- Set staging environment variables:
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `AUTH_URL`
  - `NEXT_PUBLIC_APP_URL`
- Create PostgreSQL database.
- Run Prisma migration.
- Seed calendar data.
- Confirm `/api/health` returns `{ "ok": true }`.
- Confirm `/dashboard`, `/login`, `/signup`, `/tracker`, `/account`, `/security`, `/billing`, and `/admin/moon-sighting`.

## Production Gate

- Auth provider connected.
- Email verification enabled.
- MFA enrollment and verification completed server-side.
- Recovery codes stored only as hashes.
- Tracker/profile records saved by authenticated user ID.
- Admin routes protected by role checks.
- Stripe checkout and webhook verified.
- Email provider configured.
- Database backups enabled.
- Monitoring and error reporting enabled.
- Domain and HTTPS configured.
- Projection disclaimer visible on dashboard, exports, onboarding, and guide pages.

## Recommended Launch Order

1. Private staging.
2. Internal beta.
3. Invite-only Pro beta.
4. Public Free tier.
5. Paid Pro launch.
