import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Islamic Fasting Planner PRO",
  description: "SaaS MVP foundation for Islamic fasting planning intelligence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
