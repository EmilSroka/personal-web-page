import type { Metadata } from "next";
import { Hanken_Grotesk, Caveat, Fraunces } from "next/font/google";
import { getLocale } from "next-intl/server";
import { getLocaleDir } from "@/i18n/routing";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin", "latin-ext"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "latin-ext"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: "Emil",
  description: " ",
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      dir={getLocaleDir(locale)}
      className={`${hanken.variable} ${caveat.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
