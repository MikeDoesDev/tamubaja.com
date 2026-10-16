import type { Metadata } from "next";
import { Inter, Saira_Condensed } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteNotice } from "@/components/SiteNotice";
import { getSite } from "@/lib/content";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const saira = Saira_Condensed({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-saira",
  display: "swap",
});

const site = getSite();

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  // Google ignores meta keywords; Bing and some smaller engines still read them. Harmless either way.
  keywords: [
    "Texas A&M Baja SAE",
    "TAMU Baja",
    "Texas A&M Baja",
    "Aggie Baja",
    "Baja SAE",
    "Texas A&M SAE",
    "collegiate off-road racing",
    "College Station engineering team",
    "Texas A&M engineering student organization",
    "sponsor Texas A&M students",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${saira.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <SiteNotice />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
