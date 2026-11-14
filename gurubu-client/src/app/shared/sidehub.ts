const DEFAULT_SIDEHUB_PROJECTS_URL = "";
const DEFAULT_SIDEHUB_PROJECT_ID = "";

function buildSideHubGurubuUrl(): string {
  const base = String(
    process.env.NEXT_PUBLIC_SIDEHUB_PROJECTS_URL ?? DEFAULT_SIDEHUB_PROJECTS_URL
  ).replace(/\/+$/, "");
  const projectId =
    process.env.NEXT_PUBLIC_SIDEHUB_PROJECT_ID ?? DEFAULT_SIDEHUB_PROJECT_ID;
  if (!base || !projectId) {
    return "";
  }
  return `${base}/${projectId}`;
}

export const SIDEHUB_GURUBU_URL = buildSideHubGurubuUrl();