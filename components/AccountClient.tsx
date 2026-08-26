"use client";

import { FormEvent, useEffect, useState } from "react";
import { defaultUser, DemoUser, readDemoUser, saveDemoUser } from "./DemoAuth";

export function AccountClient() {
  const [user, setUser] = useState<DemoUser>(defaultUser);

  useEffect(() => {
    setUser(readDemoUser() || defaultUser);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveDemoUser(user);
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>Full Name<input value={user.fullName} onChange={(event) => setUser({ ...user, fullName: event.target.value })} /></label>
      <label>Email<input type="email" value={user.email} onChange={(event) => setUser({ ...user, email: event.target.value })} /></label>
      <label>Country / Region<input value={user.countryRegion} onChange={(event) => setUser({ ...user, countryRegion: event.target.value })} /></label>
      <label>Plan<select value={user.plan} onChange={(event) => setUser({ ...user, plan: event.target.value as DemoUser["plan"] })}><option>Free</option><option>Pro</option><option>Admin</option></select></label>
      <label>Hijri Methodology<select value={user.methodology} onChange={(event) => setUser({ ...user, methodology: event.target.value })}><option>Projected civil/tabular baseline</option><option>Nigeria moon-sighting adjusted</option><option>Umm al-Qura reference</option></select></label>
      <label>Language<select value={user.language} onChange={(event) => setUser({ ...user, language: event.target.value })}><option>English</option><option>Arabic / English</option></select></label>
      <button className="button" type="submit">Save Account</button>
    </form>
  );
}
