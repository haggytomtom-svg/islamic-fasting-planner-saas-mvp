import Link from "next/link";
import { AuthBadge } from "./DemoAuth";

const links = [
  ["Dashboard", "/dashboard"],
  ["Tracker", "/tracker"],
  ["Onboarding", "/onboarding"],
  ["Account", "/account"],
  ["Security", "/security"],
  ["Billing", "/billing"],
  ["Moon Admin", "/admin/moon-sighting"],
  ["MVP Status", "/status"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          <strong>Fasting Planner PRO</strong>
          <span>SaaS MVP</span>
        </div>
        <AuthBadge />
        <nav>
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="side-note">
          Projected Hijri dates are planning aids. Confirm religious month starts through recognized moon-sighting authorities.
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
