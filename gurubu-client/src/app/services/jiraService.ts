import { Board, Issue, ServiceResponse } from "@/shared/interfaces";
import axios, { AxiosRequestConfig } from "axios";

export class JiraService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getJiraUrl(): string {
    const jiraUrl =
      localStorage.getItem("jiraUrl") ||
      JSON.stringify(process.env.NEXT_PUBLIC_JIRA_URL);

    if (!jiraUrl) {
      throw new Error("Jira URL not found in local storage.");
    }

    let parsedJiraUrl: string;
    try {
      parsedJiraUrl = JSON.parse(jiraUrl);
    } catch (error) {
      throw new Error("Invalid format for Jira URL in local storage.");
    }
    if (
      !parsedJiraUrl.startsWith("http://") &&
      !parsedJiraUrl.startsWith("https://")
    ) {
      parsedJiraUrl = `https://${parsedJiraUrl}`;
    }
    return parsedJiraUrl;
  }

  async getBoardId(name: string): Promise<ServiceResponse<string>> {
    try {
      const response = await axios.get(
        `${
          this.baseUrl
        }/jira/fetch?endpoint=${this.getJiraUrl()}/rest/agile/1.0/board?name=${encodeURIComponent(
          name
        )}`
      );

      return { isSuccess: true, data: response.data.values[0].id };
    } catch (error) {
      return { isSuccess: false };
    }
  }

  async searchBoards(name: string): Promise<ServiceResponse<Board[]>> {
    try {
      const url = `${
        this.baseUrl
      }/jira/fetch?endpoint=${this.getJiraUrl()}/rest/agile/1.0/board?name=${encodeURIComponent(
        name
      )}`;
      const response = await axios.get(url);
      const boardNames = response.data.values.map((item: Board) => ({
        id: item.id,
        name: item.name,
      }));
      return { isSuccess: true, data: boardNames };
    } catch (error) {
      return { isSuccess: false };
    }
  }

  async getSprints(boardId: string): Promise<ServiceResponse<any[]>> {
    try {
      const url = `${
        this.baseUrl
      }/jira/fetch?endpoint=${this.getJiraUrl()}/rest/agile/1.0/board/${encodeURIComponent(
        boardId
      )}/sprint?state=future`;
      const response = await axios.get(url);

      const sprintNames = response.data.values.map((item: Board) => ({
        id: item.id,
        name: item.name,
      }));
      return { isSuccess: true, data: sprintNames };
    } catch (error) {
      return { isSuccess: false };
    }
  }

  async getSprintIssues(sprintId: string): Promise<ServiceResponse<Issue[]>> {
    try {
      const url = `${
        this.baseUrl
      }/jira/fetch?endpoint=${this.getJiraUrl()}/rest/agile/1.0/sprint/${encodeURIComponent(
        sprintId
      )}/issue`;
      const response = await axios.get(url);

      const sprintIssues = response.data.issues.map((issue: Issue) => ({
        id: issue.id,
        key: issue.key,
        url: `${this.getJiraUrl()}/browse/${issue.key}`,
        summary: issue.fields.summary,
        point:
          issue.fields[
            process.env.NEXT_PUBLIC_STORY_POINT_CUSTOM_FIELD ?? ""
          ] ?? issue.fields["customfield_14209"],
        testPoint:
          issue.fields[
            process.env.NEXT_PUBLIC_TEST_STORY_POINT_CUSTOM_FIELD ?? ""
          ] ?? "",
        description: issue.fields.description,
        reporter: issue.fields.creator,
      }));
      return { isSuccess: true, data: sprintIssues };
    } catch (error) {
      return { isSuccess: false };
    }
  }

  async getBoardsByProjectKey(key: string): Promise<ServiceResponse<Board[]>> {
    try {
      const url = `${
        this.baseUrl
      }/jira/fetch?endpoint=${this.getJiraUrl()}/rest/agile/1.0/board?projectKeyOrId=${encodeURIComponent(
        key
      )}`;

      const response = await axios.get(url);
      return { isSuccess: true, data: response.data.values };
    } catch (error) {
      return { isSuccess: false };
    }
  }

  async setEstimation(
    issueId: string,
    value: number,
    customFieldName: string
  ): Promise<any> {
    try {
      const url = `${
        this.baseUrl
      }/jira/fetch?endpoint=${this.getJiraUrl()}/rest/api/2/issue/${encodeURIComponent(
        issueId
      )}`;
      const body = {
        fields: {
          [customFieldName]: Number(value),
        },
      };
      await axios.put(url, body);
      return { isSuccess: true };
    } catch (error) {
      return { isSuccess: false };
    }
  }
}
