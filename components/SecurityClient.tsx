"use client";

import { useEffect, useState } from "react";
import { defaultUser, DemoUser, readDemoUser, saveDemoUser } from "./DemoAuth";

export function SecurityClient() {
  const [user, setUser] = useState<DemoUser>(defaultUser);
  const [codes, setCodes] = useState<string[]>([]);

  useEffect(() => {
    setUser(readDemoUser() || defaultUser);
  }, []);

  function update(next: DemoUser) {
    setUser(next);
    saveDemoUser(next);
  }

  function generateCodes() {
    setCodes(Array.from({ length: 8 }, () => `${token()}-${token()}`));
  }

  return (
    <section className="panel">
      <h2>MFA Settings</h2>
      <div className="security-options">
        <label className="check-row"><input type="checkbox" checked={user.mfaTotp} onChange={(event) => update({ ...user, mfaTotp: event.target.checked })} /> Authenticator app</label>
        <label className="check-row"><input type="checkbox" checked={user.mfaEmail} onChange={(event) => update({ ...user, mfaEmail: event.target.checked })} /> Email OTP fallback</label>
        <label className="check-row"><input type="checkbox" checked={user.loginAlerts} onChange={(event) => update({ ...user, loginAlerts: event.target.checked })} /> Login alerts</label>
      </div>
      <div className="button-row"><button className="button" type="button" onClick={generateCodes}>Generate Recovery Codes</button></div>
      <div className="code-grid">
        {codes.map((code) => <code key={code}>{code}</code>)}
      </div>
      <p className="muted">Demo only. Production must store hashed recovery codes and TOTP secrets server-side.</p>
    </section>
  );
}

function token() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}
