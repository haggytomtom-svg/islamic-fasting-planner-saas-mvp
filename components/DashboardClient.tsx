"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, categoryColors, months, type CalendarDay } from "@/lib/calendar";

declare global {
  interface Window {
    ISLAMIC_FASTING_DATA?: CalendarDay[];
  }
}

const views = ["All Dates", "Overlap Dates Only", "Non-Overlap Dates", "Prohibited / Override Dates"];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function DashboardClient() {
  const [data, setData] = useState<CalendarDay[]>([]);
  const [year, setYear] = useState(2027);
  const [category, setCategory] = useState("Ayyam al-Beed");
  const [month, setMonth] = useState("All Months");
  const [view, setView] = useState("All Dates");

  useEffect(() => {
    if (window.ISLAMIC_FASTING_DATA) {
      setData(window.ISLAMIC_FASTING_DATA);
      return;
    }
    const script = document.createElement("script");
    script.src = `${basePath}/calendar-data.js`;
    script.onload = () => setData(window.ISLAMIC_FASTING_DATA || []);
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  const rows = useMemo(() => {
    return data.filter((row) => {
      if (row.gy !== year) return false;
      if (month !== "All Months" && row.gm !== month) return false;
      if (category !== "All Categories" && !row.cats.includes(category)) return false;
      if (view === "Overlap Dates Only" && row.oc < 2) return false;
      if (view === "Non-Overlap Dates" && row.oc !== 1) return false;
      if (view === "Prohibited / Override Dates" && row.os !== "OVERRIDE / NO FASTING" && row.pc !== "No Fasting") return false;
      return true;
    });
  }, [category, data, month, view, year]);

  const overlaps = rows.filter((row) => row.oc >= 2).length;
  const overrides = rows.filter((row) => row.os === "OVERRIDE / NO FASTING").length;

  return (
    <>
      <section className="panel">
        <div className="form-grid">
          <label>
            Year
            <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
              {Array.from({ length: 24 }, (_, index) => 2027 + index).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Fast Type
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Month
            <select value={month} onChange={(event) => setMonth(event.target.value)}>
              {months.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            View
            <select value={view} onChange={(event) => setView(event.target.value)}>
              {views.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span>Matching Days</span><strong>{rows.length}</strong></div>
        <div className="card"><span>Overlap Days</span><strong>{overlaps}</strong></div>
        <div className="card danger"><span>No-Fasting Overrides</span><strong>{overrides}</strong></div>
        <div className="card"><span>Projected Dates</span><strong>{rows.filter((row) => row.vs === "PROJECTED").length}</strong></div>
      </section>

      <section className="panel">
        <h2>Monthly Timeline</h2>
        <div className="timeline">
          {months.slice(1).map((name) => {
            const monthRows = rows.filter((row) => row.gm === name && row.pc !== "Ordinary Day");
            const days = daysInMonth(year, months.indexOf(name));
            return (
              <div className="timeline-row" key={name}>
                <strong>{name}</strong>
                <div className="track">
                  {monthRows.map((row) => {
                    const day = Number(row.gd.slice(8, 10));
                    const color = category === "All Categories" ? categoryColors[row.pc] : categoryColors[category];
                    return (
                      <span
                        key={row.gd + row.pc}
                        className="seg"
                        title={`${category === "All Categories" ? row.pc : category}: Hijri day ${row.hd}; Gregorian ${row.gd}`}
                        style={{
                          left: `${((day - 1) / days) * 100}%`,
                          width: `${Math.max(1.6, 100 / days)}%`,
                          background: color,
                        }}
                      />
                    );
                  })}
                </div>
                <span className="muted">{monthRows.length} days</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2>Projected Date Register</h2>
        <div className="grid two">
          {rows.slice(0, 80).map((row) => (
            <div className="card" key={row.gd + row.pc} style={{ borderLeft: `5px solid ${categoryColors[category] || categoryColors[row.pc]}` }}>
              <strong>{row.hd} {row.hm} {row.hy} AH</strong>
              <span>{row.gd} - {row.dow} - {row.pc}</span>
              <span>{row.cats}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function daysInMonth(year: number, monthNumber: number) {
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
}
