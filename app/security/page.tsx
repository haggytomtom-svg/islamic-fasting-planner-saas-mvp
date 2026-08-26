import { AppShell } from "@/components/AppShell";
import { Hero } from "@/components/Hero";
import { SecurityClient } from "@/components/SecurityClient";

export default function SecurityPage() {
  return (
    <AppShell>
      <Hero eyebrow="2-way MFA" title="Security" text="Production security requires server-side MFA enrollment, verified email, hashed recovery codes, secure sessions, and audit logs." />
      <div className="content">
        <section className="grid two">
          <SecurityClient />
          <div className="panel danger">
            <h2>Production Controls</h2>
            <p className="muted">Rate limiting, secure cookies, CSRF protection, session revocation, login alerts, and hashed recovery codes are required before launch.</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
