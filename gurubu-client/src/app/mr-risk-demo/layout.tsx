import type { ReactNode } from "react";
import RiskDashboard from "./risk-dashboard";

export default function RiskDemoLayout({ children }: { children: ReactNode }) {
  return <RiskDashboard>{children}</RiskDashboard>;
}
