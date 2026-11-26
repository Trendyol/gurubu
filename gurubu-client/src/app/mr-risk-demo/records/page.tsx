import type { Metadata } from "next";
import { RecordsPage } from "../risk-dashboard-views";

export const metadata: Metadata = {
  title: "Merge requests | Gurubu",
  description: "Search and inspect individual merge requests from the selected CSV.",
};

export default function Page() {
  return <RecordsPage />;
}
