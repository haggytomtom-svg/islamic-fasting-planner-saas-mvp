"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { defaultUser, saveDemoUser } from "./DemoAuth";

export function SignupClient() {
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    saveDemoUser({
      ...defaultUser,
      fullName: String(form.get("fullName") || ""),
      email: String(form.get("email") || ""),
      countryRegion: String(form.get("countryRegion") || "Nigeria"),
    });
    router.push("/onboarding");
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <label>Full Name<input name="fullName" placeholder="Full name" /></label>
      <label>Email<input type="email" name="email" placeholder="email@example.com" required /></label>
      <label>Password<input type="password" name="password" placeholder="At least 10 characters" required minLength={10} /></label>
      <label>Country / Region<input name="countryRegion" defaultValue="Nigeria" /></label>
      <button className="button" type="submit">Create Demo Account</button>
    </form>
  );
}
