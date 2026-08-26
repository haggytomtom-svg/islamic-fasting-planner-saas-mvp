import { AppShell } from "@/components/AppShell";
import { Hero } from "@/components/Hero";

const steps = [
  ["Profile", "Confirm name, country, language, and time zone."],
  ["Methodology", "Choose projected baseline, Nigeria moon-sighting adjusted, or another supported reference."],
  ["Security", "Enable authenticator app MFA and generate recovery codes."],
  ["Subscription", "Select Free, Pro, or Admin plan based on feature access."],
  ["Tracker", "Import or begin recording personal fasting history."],
  ["Exports", "Enable CSV, ICS, and printable planner outputs."],
];

export default function OnboardingPage() {
  return (
    <AppShell>
      <Hero
        eyebrow="SaaS onboarding"
        title="Setup Checklist"
        text="A production onboarding path for converting a visitor into a secured user with regional settings and saved planner data."
      />
      <div className="content">
        <section className="grid two">
          {steps.map(([title, text], index) => (
            <article className="card" key={title}>
              <span>Step {index + 1}</span>
              <strong>{title}</strong>
              <p className="muted">{text}</p>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
