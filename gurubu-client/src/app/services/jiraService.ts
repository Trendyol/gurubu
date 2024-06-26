import { Board, Issue, ServiceResponse } from "@/shared/interfaces";
import axios, { AxiosRequestConfig } from "axios";

export class JiraService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getRequestConfig(): AxiosRequestConfig {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!username || !token) {
      throw new Error("Username or token not found in local storage.");
    }

    const parsedUsername = JSON.parse(username);
    const parsedToken = JSON.parse(token);

    return {
      headers: {
        Authorization: `Basic ${btoa(`${parsedUsername}:${parsedToken}`)}`
      }
    };
  }

  private getJiraUrl(): string {
    const jiraUrl = localStorage.getItem("jiraUrl");

    if (!jiraUrl) {
      throw new Error("Jira URL not found in local storage.");
    }

    let parsedJiraUrl: string;
    try {
      parsedJiraUrl = JSON.parse(jiraUrl);
    } catch (error) {
      throw new Error("Invalid format for Jira URL in local storage.");
    }
    if (!parsedJiraUrl.startsWith("http://") && !parsedJiraUrl.startsWith("https://")) {
      parsedJiraUrl = `https://${parsedJiraUrl}`;
    }
    return parsedJiraUrl;
  }

  async searchBoards(searchQuery: string): Promise<ServiceResponse<Board[]>> {
    try {
      const url = `${this.baseUrl}/jira/fetch?endpoint=${this.getJiraUrl()}/rest/agile/1.0/board?name=${encodeURIComponent(searchQuery)}`;
      const response = await axios.get(url, this.getRequestConfig());
      const boardNames = response.data.values.map((item: Board) => ({ id: item.id, name: item.name }));
      return { isSuccess: true, data: boardNames };
    } catch (error) {
      return { isSuccess: false };
    }
  }

  async getSprints(boardId: string): Promise<ServiceResponse<Board[]>> {
    try {
      const url = `${this.baseUrl}/jira/fetch?endpoint=${this.getJiraUrl()}/rest/agile/1.0/board/${encodeURIComponent(boardId)}/sprint?state=future`;
      const response = await axios.get(url, this.getRequestConfig());
      const sprintNames = response.data.values.map((item: Board) => ({ id: item.id, name: item.name }));
      return { isSuccess: true, data: sprintNames };
    } catch (error) {
      return { isSuccess: false };
    }
  }

  async getSprintIssues(sprintId: string, customFieldName: string): Promise<ServiceResponse<Issue[]>> {
    try {
      const url = `${this.baseUrl}/jira/fetch?endpoint=${this.getJiraUrl()}/rest/agile/1.0/sprint/${encodeURIComponent(sprintId)}/issue`;
      const response = await axios.get(url, this.getRequestConfig());
      customFieldName = customFieldName ?? "customfield_10016"
      const sprintIssues = response.data.issues.map((issue: Issue) => ({
        id: issue.id,
        key: issue.key,
        url: `${this.getJiraUrl()}/browse/${issue.key}`,
        summary: issue.fields.summary,
        point: issue.fields[customFieldName]
      }));
      return { isSuccess: true, data: sprintIssues };
    } catch (error) {
      return { isSuccess: false };
    }
  }

  async setEstimation(issueId: string, value: number, customFieldName: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/jira/fetch?endpoint=${this.getJiraUrl()}/rest/api/2/issue/${encodeURIComponent(issueId)}`;
      const body = {
        fields: {
          [customFieldName]: Number(value)
        }
      };
      await axios.put(url, body, this.getRequestConfig());
      return { isSuccess: true };
    } catch (error) {
      return { isSuccess: false };
    }
  }
}
