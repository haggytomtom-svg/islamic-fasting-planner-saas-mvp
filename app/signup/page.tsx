import Link from "next/link";
import { Hero } from "@/components/Hero";
import { SignupClient } from "@/components/SignupClient";

export default function SignupPage() {
  return (
    <>
      <Hero
        eyebrow="Create profile"
        title="Start Planning"
        text="Create a profile for saved fasting history, regional settings, moon-sighting preferences, and export tools."
      />
      <main className="content auth-layout">
        <section className="panel auth-panel">
          <h2>Create Account</h2>
          <SignupClient />
          <p className="muted">The API route is scaffolded. Final production form handling should use a server action or auth provider SDK.</p>
        </section>
        <section className="panel">
          <h2>After Signup</h2>
          <ol className="readiness-list">
            <li>Verify email address.</li>
            <li>Select region and Hijri methodology.</li>
            <li>Enable MFA.</li>
            <li>Choose Free or Pro plan.</li>
            <li>Open onboarding checklist.</li>
          </ol>
          <div className="button-row"><Link className="button secondary" href="/login">Already have an account</Link></div>
        </section>
      </main>
    </>
  );
}
