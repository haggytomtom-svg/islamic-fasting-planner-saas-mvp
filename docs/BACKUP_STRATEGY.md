# Backup Strategy

## Database Backups

### Provider-Managed Backups (Primary)

**Neon (Recommended)**:
- Point-in-time recovery (PITR) is enabled by default on paid plans.
- Retention: 7 days on Pro, 30 days on Scale.
- Branching: Create instant database branches for testing migrations.

**Supabase (Alternative)**:
- Daily automated backups on Pro plan.
- Point-in-time recovery available on Team/Enterprise.
- Backups accessible via Supabase Dashboard → Database → Backups.

### Manual Backup Procedure

For additional safety or migration purposes:

```bash
# Export using pg_dump (requires PostgreSQL client tools)
pg_dump "$DATABASE_URL" --format=custom --file=backup-$(date +%Y%m%d-%H%M%S).dump

# Restore
pg_restore --dbname="$DATABASE_URL" --clean backup-YYYYMMDD-HHMMSS.dump
```

### Calendar Data Re-Seeding

If the calendar_day table needs rebuilding:

```bash
# The seed script reads from public/calendar-data.js and upserts 8,766 rows
npm run db:seed
```

This is idempotent (uses upsert) and safe to run multiple times.

---

## Application Backups

### Source Code

- All source code is version-controlled in Git.
- Repository: `https://github.com/haggytomtom-svg/islamic-fasting-planner-saas-mvp`
- Vercel auto-deploys from the main branch.

### Environment Variables

- Production secrets are stored in Vercel's environment variable system.
- Keep a secure offline copy of all production environment variables.
- Never commit `.env` files to the repository.

### Static Assets

- `public/calendar-data.js` (1.7 MB) is the canonical calendar dataset.
- `public/assets/planner-visual.png` is the hero image.
- Both are version-controlled.

---

## Backup Verification Checklist

Run quarterly:

- [ ] Verify provider dashboard shows recent backups.
- [ ] Download a manual `pg_dump` and verify it restores to a test database.
- [ ] Confirm calendar data seed script runs cleanly on a fresh database.
- [ ] Verify Sentry is capturing errors (send a test error).
- [ ] Confirm Vercel health check cron is running (`/api/health`).
- [ ] Review audit logs for any anomalies.

---

## Disaster Recovery

1. **Database loss**: Restore from Neon/Supabase PITR or latest `pg_dump`.
2. **Application failure**: Vercel auto-rolls back to previous deployment.
3. **Calendar data corruption**: Re-seed from `public/calendar-data.js`.
4. **Secret compromise**: Rotate all secrets in Vercel dashboard, redeploy.

---

## Data Retention

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| User accounts | Indefinite | Until user requests deletion |
| Fasting records | Indefinite | User-owned data |
| Audit logs | 1 year | Archive older logs to cold storage |
| Password reset tokens | Auto-expire | 1 hour TTL, cleaned on use |
| Email verification tokens | Auto-expire | 24 hour TTL, cleaned on use |
| Email OTPs | Auto-expire | 10 minute TTL, cleaned on use |
| Recovery codes | Until used | One-time use, stored as hashes |
