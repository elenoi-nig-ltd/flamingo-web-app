// app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient";
import JsonLd from "@/components/seo/JsonLd";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { themeInitScript } from "@/config/theme";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import {
  SITE_URL,
  SITE_NAME,
  SITE_BRAND,
  SITE_DESCRIPTION,
  SITE_OG_IMAGE,
  SITE_TAGLINE,
} from "@/config/site";

const poppins = Plus_Jakarta_Sans({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Flamingo - Online Marketplace in Minna | Buy, Sell, Rent & Find Services",
    template: `%s | ${SITE_BRAND}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_BRAND,
  keywords: [
    "Minna marketplace",
    "buy and sell Minna",
    "houses for rent Minna",
    "houses for rent Gidan Kwano",
    "land for sale Minna",
    "FUT Minna accommodation",
    "cars for sale Minna",
    "phones Minna",
    "Niger State classifieds",
    "Flamingo Minna",
  ],
  authors: [{ name: SITE_BRAND }],
  creator: SITE_BRAND,
  publisher: SITE_BRAND,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: SITE_NAME,
    title:
      "Flamingo - Online Marketplace in Minna | Buy, Sell, Rent & Find Services",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `Flamingo — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flamingo - Online Marketplace in Minna",
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `suppressHydrationWarning` is required because `themeInitScript` adds the
    // `.dark` class to this element before React hydrates it.
    //
    // The font variable class belongs on <html>, NOT <body>. globals.css defines
    // `--font-sans: var(--font-poppins)` inside `@theme`, which emits it on
    // :root, and custom properties substitute their `var()` references at the
    // element where they are *declared*. On <body> the variable is a descendant
    // of :root, so `var(--font-poppins)` resolved to nothing there and the whole
    // font-family declaration fell through to the system stack.
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <ThemeProvider>
          <LayoutClient>{children}</LayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
