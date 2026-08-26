"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { defaultUser, readDemoUser, saveDemoUser } from "./DemoAuth";

export function LoginClient() {
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const existing = readDemoUser();
    saveDemoUser({
      ...defaultUser,
      ...existing,
      email: String(form.get("email") || existing?.email || ""),
      fullName: existing?.fullName || "Demo User",
    });
    router.push("/dashboard");
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <label>Email<input type="email" name="email" placeholder="email@example.com" required /></label>
      <label>Password<input type="password" name="password" placeholder="Password" required /></label>
      <label className="check-row"><input type="checkbox" /> Remember this device</label>
      <button className="button" type="submit">Sign In To Demo</button>
    </form>
  );
}
