# Vercel Staging Setup

## Import

1. Open Vercel.
2. Choose **Add New Project**.
3. Import:

   ```text
   haggytomtom-svg/islamic-fasting-planner-saas-mvp
   ```

4. Framework preset should detect **Next.js**.
5. Keep build command:

   ```text
   npm run build
   ```

6. Keep output directory empty/default.

## Minimum Staging Environment Variables

```text
DATABASE_URL
AUTH_SECRET
AUTH_URL
NEXT_PUBLIC_APP_URL
```

Temporary staging values:

```text
AUTH_URL=https://YOUR-VERCEL-STAGING-URL
NEXT_PUBLIC_APP_URL=https://YOUR-VERCEL-STAGING-URL
```

Use a real PostgreSQL URL for `DATABASE_URL`. Use a strong random value for `AUTH_SECRET`.

## After First Deploy

Check:

```text
https://YOUR-VERCEL-STAGING-URL/api/health
```

Expected:

```json
{
  "ok": true,
  "service": "islamic-fasting-planner-saas-mvp"
}
```

## Staging Test Paths

- `/`
- `/dashboard`
- `/signup`
- `/login`
- `/tracker`
- `/account`
- `/security`
- `/billing`
- `/admin/moon-sighting`
- `/status`

## Production Gate

Do not launch paid public production until real database-backed auth, MFA verification, role checks, Stripe webhook verification, and audit logging are completed.
