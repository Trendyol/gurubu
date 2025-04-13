import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import classNames from "classnames";
import "@/styles/globals.scss";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
        <Script
          id="clarity-script"
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "otaljzsf50");`,
          }}
        />
      </head>
      <body
        className={classNames([
          inter.className,
          inter.variable,
        ])}
      >
        {children}
      </body>
    </html>
  );
}
