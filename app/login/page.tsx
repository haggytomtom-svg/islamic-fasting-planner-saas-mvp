import Link from "next/link";
import { Hero } from "@/components/Hero";
import { LoginClient } from "@/components/LoginClient";

export default function LoginPage() {
  return (
    <>
      <Hero
        eyebrow="Secure access"
        title="Sign In"
        text="Access saved fasting records, profile settings, exports, and account security controls."
      />
      <main className="content auth-layout">
        <section className="panel auth-panel">
          <h2>Welcome Back</h2>
          <LoginClient />
          <p className="muted">Production build connects this form to Auth.js/Clerk/Supabase Auth with MFA challenge handling.</p>
        </section>
        <section className="panel">
          <h2>Security Flow</h2>
          <ol className="readiness-list">
            <li>Email and password verification.</li>
            <li>MFA challenge when enabled.</li>
            <li>Session created with secure HttpOnly cookie.</li>
            <li>Login alert and audit log recorded.</li>
          </ol>
          <div className="button-row"><Link className="button secondary" href="/signup">Create Account</Link></div>
        </section>
      </main>
    </>
  );
}
