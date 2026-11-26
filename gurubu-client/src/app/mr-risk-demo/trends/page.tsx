import type { Metadata } from "next";
import { TrendsPage } from "../risk-dashboard-views";

export const metadata: Metadata = {
  title: "Trends | Gurubu",
  description: "Follow collection dates and see when each bot first reported a result.",
};

export default function Page() {
  return <TrendsPage />;
}
