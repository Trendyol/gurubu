function readAllowedNicknames(): string[] {
  const raw = process.env.NEXT_PUBLIC_AGENT_ESTIMATION_ALLOWED_NICKNAMES || "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function resolveNickname(nickname?: string): string {
  if (nickname && nickname.trim()) {
    return nickname.trim();
  }
  if (typeof window === "undefined") {
    return "";
  }
  return (window.localStorage.getItem("nickname") || "").trim();
}

export function isAgentEstimationActive(nickname?: string): boolean {
  const envEnabled =
    String(process.env.NEXT_PUBLIC_AGENT_ESTIMATION_ACTIVE || "").toLowerCase() ===
    "true";
  if (!envEnabled) {
    return false;
  }

  const allowedNicknames = readAllowedNicknames();
  if (allowedNicknames.length === 0) {
    return false;
  }

  const currentNickname = resolveNickname(nickname);
  return allowedNicknames.includes(currentNickname);
}
