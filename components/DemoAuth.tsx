"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type DemoUser = {
  fullName: string;
  email: string;
  countryRegion: string;
  methodology: string;
  language: string;
  plan: "Free" | "Pro" | "Admin";
  mfaEmail: boolean;
  mfaTotp: boolean;
  loginAlerts: boolean;
};

const defaultUser: DemoUser = {
  fullName: "",
  email: "",
  countryRegion: "Nigeria",
  methodology: "Projected civil/tabular baseline",
  language: "English",
  plan: "Free",
  mfaEmail: false,
  mfaTotp: false,
  loginAlerts: true,
};

export function readDemoUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem("ifp-saas-user");
    return value ? ({ ...defaultUser, ...JSON.parse(value) } as DemoUser) : null;
  } catch {
    return null;
  }
}

export function saveDemoUser(user: DemoUser) {
  window.localStorage.setItem("ifp-saas-user", JSON.stringify(user));
  window.dispatchEvent(new Event("ifp-user-change"));
}

export function clearDemoUser() {
  window.localStorage.removeItem("ifp-saas-user");
  window.dispatchEvent(new Event("ifp-user-change"));
}

export function AuthBadge() {
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    const sync = () => setUser(readDemoUser());
    sync();
    window.addEventListener("ifp-user-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ifp-user-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!user?.email) {
    return (
      <div className="auth-badge">
        <Link href="/login">Sign in</Link>
        <Link href="/signup">Create account</Link>
      </div>
    );
  }

  return (
    <div className="auth-badge signed-in">
      <span>{user.fullName || user.email}</span>
      <strong>{user.plan}</strong>
      <button type="button" onClick={() => clearDemoUser()}>Sign out</button>
    </div>
  );
}

export { defaultUser };
