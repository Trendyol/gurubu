import type { Metadata } from "next";
import { OverviewPage } from "./risk-dashboard-views";

export const metadata: Metadata = {
  title: "MR Risk Dashboard | Gurubu",
  description: "Track merge duration, review speed and risk from your CSV.",
};

export default function Page() {
  return <OverviewPage />;
}
