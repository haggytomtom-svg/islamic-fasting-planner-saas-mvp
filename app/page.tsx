import Link from "next/link";
import { Hero } from "@/components/Hero";

export default function HomePage() {
  return (
    <>
      <Hero
        eyebrow="SaaS MVP foundation"
        title="Islamic Fasting Planner PRO"
        text="A hosted product foundation for Hijri and Gregorian fasting intelligence, personal tracking, moon-sighting governance, exports, subscriptions, and admin operations."
      />
      <main className="content">
        <section className="grid">
          <div className="card"><span>Calendar Range</span><strong>2027-2050</strong></div>
          <div className="card"><span>Data Rows</span><strong>8,766</strong></div>
          <div className="card"><span>Security</span><strong>MFA-ready</strong></div>
          <div className="card"><span>Billing</span><strong>Stripe-ready</strong></div>
        </section>
        <div className="button-row">
          <Link className="button" href="/signup">Create Account</Link>
          <Link className="button secondary" href="/login">Sign In</Link>
          <Link className="button" href="/dashboard">Open Dashboard</Link>
          <Link className="button secondary" href="/status">MVP Status</Link>
        </div>
      </main>
    </>
  );
}
