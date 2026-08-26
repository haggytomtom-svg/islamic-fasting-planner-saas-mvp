/**
 * Post-deployment setup script.
 * Run AFTER Vercel deploys and the DATABASE_URL is available.
 *
 * Usage:
 *   1. Copy .env.example to .env.local
 *   2. Fill in all real values
 *   3. Run: node scripts/post-deploy-setup.mjs
 */
import { execSync } from "node:child_process";

function run(cmd, label) {
  console.log(`\n=== ${label} ===`);
  try {
    execSync(cmd, { stdio: "inherit", env: process.env });
    console.log(`✅ ${label} complete`);
    return true;
  } catch {
    console.error(`❌ ${label} failed`);
    return false;
  }
}

async function main() {
  console.log("Islamic Fasting Planner PRO — Post-Deployment Setup\n");

  // 1. Validate env vars
  const required = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "AUTH_URL",
    "NEXT_PUBLIC_APP_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "RESEND_API_KEY",
  ];

  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("Missing environment variables:");
    missing.forEach((k) => console.error(`  - ${k}`));
    console.error("\nCopy .env.example to .env.local and fill in all values.");
    process.exit(1);
  }

  console.log("✅ All required environment variables present\n");

  // 2. Push Prisma schema to database
  const schemaPushed = run("npx prisma db push --accept-data-loss", "Prisma schema push");
  if (!schemaPushed) process.exit(1);

  // 3. Generate Prisma client
  run("npx prisma generate", "Prisma client generation");

  // 4. Seed calendar data
  console.log("\n=== Calendar data seed ===");
  console.log("This inserts 8,766 calendar rows (2027–2050). May take a few minutes...");
  const seeded = run("npx tsx scripts/seed-calendar.ts", "Calendar data seed");
  if (!seeded) {
    console.error("Seed failed. You can retry manually: npm run db:seed");
  }

  // 5. Verify health
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  console.log(`\n=== Health check ===`);
  console.log(`Check: ${appUrl}/api/health`);
  console.log("Expected: { ok: true, dbConnected: true }");

  console.log("\n🎉 Post-deployment setup complete!");
  console.log("\nNext steps:");
  console.log("  1. Configure Stripe webhook endpoint → POST ${appUrl}/api/stripe/webhook");
  console.log("  2. Verify Resend sending domain");
  console.log("  3. Test signup → email verification → login → MFA → tracker → billing");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
