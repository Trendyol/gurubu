export interface JiraProject {
  key: string;
  id: string;
}

export interface GitlabIssueBoard {
  [key: string]: any;
}

export interface Tool {
  [key: string]: any;
}

export interface Channel {
  [key: string]: any;
}

export interface FourkeyNotification {
  [key: string]: any;
}

export interface Profile {
  displayName: string;
  email: string;
}

export interface PandoraAnnotations {
  "pandora/gitlab-projectPath"?: string;
  "pandora/gitlab-projectId"?: string;
  "pandora/successfactor-path"?: string;
  "scale-engine/tribe-name"?: string;
  [key: string]: string | undefined;
}

export interface PandoraSpec {
  type: "team" | "group" | "department" | string;
  profile: Profile;
  children: string[];
  parent: string;
  tribe: string;
}

export type UserName = string;

export interface GuestDeveloper {
  name: UserName;
  "expiration-date": string;
}

export interface TeamMember {
  userName: UserName;
  role:
    | "lead"
    | "developer"
    | "guest-developer"
    | "security-champion"
    | "qa"
    | "product-manager";
  expirationDate?: string;
}

export interface PandoraMetadata {
  id: string;
  name: string;
  description: string;
  annotations: PandoraAnnotations;
  lead: UserName;
  wiki: string;
  slack: string;
  "private-slack-channel-name": string;
  "product-manager": UserName[];
  developer: UserName[];
  "guest-developer": GuestDeveloper[];
  "security-champion": UserName[];
  qa: UserName[];
  "fourkey-notification": FourkeyNotification;
  "jira-projects": JiraProject[];
  "gitlab-issue-board": GitlabIssueBoard;
  tools: Record<string, Tool>;
  channels: Record<string, Channel>;
  [key: string]: any;
}

export interface PandoraOrganization {
  apiVersion: string;
  kind: string;
  metadata: PandoraMetadata;
  spec: PandoraSpec;
}

export interface Assignee {
  name: string;
  displayName: string;
  id?: string;
  email?: string;
}
