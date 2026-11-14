const DEFAULT_SIDEHUB_PROJECTS_URL = "https://sidehub.tyinternal.com/projects";
const DEFAULT_SIDEHUB_PROJECT_ID = "69";

function buildSideHubGurubuUrl(): string {
  const base = String(
    process.env.NEXT_PUBLIC_SIDEHUB_PROJECTS_URL || DEFAULT_SIDEHUB_PROJECTS_URL
  ).replace(/\/+$/, "");
  const projectId =
    process.env.NEXT_PUBLIC_SIDEHUB_PROJECT_ID || DEFAULT_SIDEHUB_PROJECT_ID;
  return `${base}/${projectId}`;
}

export const SIDEHUB_GURUBU_URL = buildSideHubGurubuUrl();