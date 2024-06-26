import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import classNames from "classnames";
import "@/styles/globals.scss";
import Script from 'next/script'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Gurubu | Simple, fast and practical grooming",
  description: "Simple, fast and practical grooming.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/x-icon" sizes="7x10" />
        <Script src="https://scripts.simpleanalyticscdn.com/latest.js"  />
      </head>
      <body
        className={classNames([
          inter.className,
          spaceGrotesk.variable,
          inter.variable,
        ])}
      >
        {children}
      </body>
    </html>
  );
}
