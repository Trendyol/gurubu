import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import classNames from "classnames";
import "@/styles/globals.scss";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: '--font-space-grotesk' });

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
        <link rel="icon" href="/gamepad.svg" type="image/x-icon" sizes="7x10" />
      </head>
      <body className={classNames([inter.className, spaceGrotesk.variable, inter.variable])}>{children}</body>
    </html>
  );
}
