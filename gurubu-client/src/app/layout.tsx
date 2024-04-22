import { Inter, Space_Grotesk } from "next/font/google";
import classNames from "classnames";
import "@/styles/globals.scss";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/x-icon" sizes="7x10" />
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
