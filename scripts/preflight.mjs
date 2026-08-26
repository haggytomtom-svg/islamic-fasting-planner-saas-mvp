const requiredByMode = {
  local: ["NEXT_PUBLIC_APP_URL"],
  staging: ["DATABASE_URL", "AUTH_SECRET", "AUTH_URL", "NEXT_PUBLIC_APP_URL"],
  production: [
    "DATABASE_URL",
    "AUTH_SECRET",
    "AUTH_URL",
    "NEXT_PUBLIC_APP_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "RESEND_API_KEY"
  ]
};

const mode = process.argv.includes("--production")
  ? "production"
  : process.argv.includes("--staging")
    ? "staging"
    : "local";

const missing = requiredByMode[mode].filter((key) => !process.env[key]);

console.log(`Preflight mode: ${mode}`);

if (missing.length) {
  console.error("Missing required environment variables:");
  for (const key of missing) console.error(`- ${key}`);
  process.exit(1);
}

console.log("Environment preflight passed.");
