import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.scss";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
