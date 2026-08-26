import { AppShell } from "@/components/AppShell";
import { Hero } from "@/components/Hero";
import { TrackerClient } from "@/components/TrackerClient";

export default function TrackerPage() {
  return (
    <AppShell>
      <Hero
        eyebrow="Saved fasting history"
        title="Personal Tracker"
        text="Record planned, completed, missed, exempt, and make-up fasting activity. The demo uses browser storage; production persists by authenticated user ID."
      />
      <div className="content">
        <TrackerClient />
      </div>
    </AppShell>
  );
}
