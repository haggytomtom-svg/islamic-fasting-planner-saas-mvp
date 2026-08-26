import { AppShell } from "@/components/AppShell";
import { DashboardClient } from "@/components/DashboardClient";
import { Hero } from "@/components/Hero";

export default function DashboardPage() {
  return (
    <AppShell>
      <Hero
        eyebrow="Calendar intelligence"
        title="Planner Dashboard"
        text="Filter projected fasting opportunities, inspect monthly timing, review overlaps, and prepare saved-user experiences for the hosted SaaS."
      />
      <div className="content">
        <DashboardClient />
      </div>
    </AppShell>
  );
}
