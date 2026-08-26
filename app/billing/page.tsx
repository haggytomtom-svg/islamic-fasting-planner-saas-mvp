import { AppShell } from "@/components/AppShell";
import { Hero } from "@/components/Hero";

export default function BillingPage() {
  return (
    <AppShell>
      <Hero eyebrow="Subscription model" title="Billing" text="Stripe-ready tiers for Free, Pro, and Admin usage, with webhook-backed subscription state." />
      <div className="content">
        <section className="grid">
          <div className="card"><span>Free</span><strong>Calendar</strong><p className="muted">Basic filters and guide.</p></div>
          <div className="card"><span>Pro</span><strong>Tracker</strong><p className="muted">Saved records, exports, reports, and print planner.</p></div>
          <div className="card"><span>Admin</span><strong>Governance</strong><p className="muted">Moon-sighting updates, users, audit logs.</p></div>
          <div className="card"><span>Webhook</span><strong>Required</strong><p className="muted">Stripe event verification before production.</p></div>
        </section>
      </div>
    </AppShell>
  );
}
