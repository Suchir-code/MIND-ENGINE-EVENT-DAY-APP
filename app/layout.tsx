import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mind-engine-event-day-app.vercel.app"),
  title: "MIND ENGINE Expo 2026 | Team Tracker",
  description: "Live company engagement tracker for the MIND ENGINE Expo 2026 team.",
  openGraph: {
    title: "MIND ENGINE Expo 2026 | Team Tracker",
    description: "Every conversation. One shared pulse.",
    images: [{ url: "/og.png", width: 1672, height: 941 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIND ENGINE Expo 2026 | Team Tracker",
    description: "Every conversation. One shared pulse.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
