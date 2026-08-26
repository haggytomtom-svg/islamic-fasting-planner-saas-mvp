import { AppShell } from "@/components/AppShell";
import { Hero } from "@/components/Hero";
import { AccountClient } from "@/components/AccountClient";

export default function AccountPage() {
  return (
    <AppShell>
      <Hero eyebrow="User profile" title="Account" text="The hosted version persists regional settings, methodology choices, saved filters, and subscription state per user." />
      <div className="content">
        <section className="panel">
          <AccountClient />
        </section>
      </div>
    </AppShell>
  );
}
