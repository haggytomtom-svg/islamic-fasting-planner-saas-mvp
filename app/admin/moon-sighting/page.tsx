import { AppShell } from "@/components/AppShell";
import { Hero } from "@/components/Hero";

export default function MoonSightingAdminPage() {
  return (
    <AppShell>
      <Hero eyebrow="Admin workflow" title="Moon-Sighting Console" text="Admin-only workflow for publishing confirmed Ramadan, Shawwal, Muharram, and Dhul-Hijjah adjustments." />
      <div className="content">
        <section className="panel">
          <div className="form-grid">
            <label>Hijri Month<select><option>Ramadan</option><option>Shawwal</option><option>Muharram</option><option>Dhul-Hijjah</option></select></label>
            <label>Hijri Year<input type="number" min="1400" max="1600" /></label>
            <label>Confirmed Start Date<input type="date" /></label>
            <label>Authority / Source<input placeholder="Recognized authority" /></label>
            <label>Region<input defaultValue="Nigeria" /></label>
            <label>Adjustment vs Projection<select><option>-1</option><option>0</option><option>+1</option></select></label>
          </div>
          <div className="button-row"><button className="button">Publish Confirmation</button></div>
        </section>
      </div>
    </AppShell>
  );
}
