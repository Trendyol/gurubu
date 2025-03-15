import { Metadata } from "next";
import { Suspense } from "react";
import "@/styles/jira-pdf/style.scss";

export const metadata: Metadata = {
  title: "GuruBu - Jira PDF Downloader",
  description: "Download PDF reports from Jira boards with story point analysis",
};

export default function JiraPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="jira-pdf-layout">{children}</main>
    </Suspense>
  );
} 