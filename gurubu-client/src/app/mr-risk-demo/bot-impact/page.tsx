import type { Metadata } from "next";
import { BotImpactPage } from "../risk-dashboard-views";

export const metadata: Metadata = {
  title: "Bot approvals & review duration | Gurubu",
  description: "Compare median and average merge and second approval times by bot status.",
};

export default function Page() {
  return <BotImpactPage />;
}
