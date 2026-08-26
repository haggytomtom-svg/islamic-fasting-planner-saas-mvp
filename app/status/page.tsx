import { AppShell } from "@/components/AppShell";
import { Hero } from "@/components/Hero";

const ready = [
  "Next.js application shell",
  "Interactive dashboard using generated 2027-2050 data",
  "PostgreSQL Prisma schema",
  "Registration API scaffold",
  "MFA enrollment API scaffold",
  "Tracker API scaffold",
  "Stripe webhook scaffold",
  "Admin moon-sighting page",
];

const blocked = [
  "Production database URL",
  "Auth provider decision and secrets",
  "Email provider API key",
  "Stripe account keys and products",
  "Domain name and hosting account",
];

export default function StatusPage() {
  return (
    <AppShell>
      <Hero
        eyebrow="Build status"
        title="MVP Readiness"
        text="Current engineering status for turning the planner into a deployed SaaS product."
      />
      <div className="content">
        <section className="grid two">
          <div className="panel">
            <h2>Ready In Scaffold</h2>
            <ul className="readiness-list">
              {ready.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="panel danger">
            <h2>Needed For Production</h2>
            <ul className="readiness-list">
              {blocked.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
