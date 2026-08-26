"use client";

import { FormEvent, useEffect, useState } from "react";
import { categories } from "@/lib/calendar";

type RecordItem = {
  id: number;
  date: string;
  category: string;
  status: string;
  notes: string;
};

export function TrackerClient() {
  const [records, setRecords] = useState<RecordItem[]>([]);

  useEffect(() => {
    setRecords(readRecords());
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = [
      {
        id: Date.now(),
        date: String(form.get("date") || ""),
        category: String(form.get("category") || ""),
        status: String(form.get("status") || ""),
        notes: String(form.get("notes") || ""),
      },
      ...records,
    ];
    setRecords(next);
    localStorage.setItem("ifp-saas-tracker", JSON.stringify(next));
    event.currentTarget.reset();
  }

  function remove(id: number) {
    const next = records.filter((record) => record.id !== id);
    setRecords(next);
    localStorage.setItem("ifp-saas-tracker", JSON.stringify(next));
  }

  return (
    <section className="panel">
      <form className="tracker-form" onSubmit={submit}>
        <input type="date" name="date" required />
        <select name="category">{categories.filter((item) => item !== "All Categories").map((item) => <option key={item}>{item}</option>)}</select>
        <select name="status"><option>Planned</option><option>Completed</option><option>Missed</option><option>Exempt</option><option>Make-up Needed</option></select>
        <input name="notes" placeholder="Notes" />
        <button className="button" type="submit">Add</button>
      </form>
      <div className="tracker-list">
        {records.length ? records.map((record) => (
          <div className="tracker-entry" key={record.id}>
            <strong>{record.date}</strong>
            <span>{record.category} - {record.notes || "No notes"}</span>
            <span>{record.status}</span>
            <button type="button" onClick={() => remove(record.id)}>x</button>
          </div>
        )) : <p className="muted">No tracker records yet.</p>}
      </div>
    </section>
  );
}

function readRecords(): RecordItem[] {
  try {
    return JSON.parse(localStorage.getItem("ifp-saas-tracker") || "[]");
  } catch {
    return [];
  }
}
