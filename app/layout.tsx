import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Underlaget — Svenska Skolan Mallorca",
  description:
    "Hjälp att ta fram underlag för statsbidrag vid Svenska Skolan Mallorca.",
  icons: {
    icon: "/LOGO-SVENSKA-SKOLAN.jpg",
    apple: "/LOGO-SVENSKA-SKOLAN.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${raleway.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
