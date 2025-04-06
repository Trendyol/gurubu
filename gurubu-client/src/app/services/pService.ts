import axios from "axios";
import { ServiceResponse } from "@/shared/interfaces";
import { Assignee } from "types/planner";

export class PService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getOrganizations(): Promise<ServiceResponse<string[]>> {
    try {
      const response = await axios.get(`${this.baseUrl}/p/organizations`);
      return {
        isSuccess: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error getting organizations:", error);
      return {
        isSuccess: false,
        error: "Failed to get organizations",
      };
    }
  }

  async searchOrganizations(query: string): Promise<ServiceResponse<string[]>> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/p/organizations/search`,
        {
          params: { query },
        }
      );
      return {
        isSuccess: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error searching organizations:", error);
      return {
        isSuccess: false,
        error: "Failed to search organizations",
      };
    }
  }

  async getOrganizationDetails(
    name: string
  ): Promise<ServiceResponse<Record<string, Assignee>>> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/p/organization/${name}`
      );

      return {
        isSuccess: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error getting organization details:", error);
      return {
        isSuccess: false,
        error: "Failed to get organization details",
      };
    }
  }

  async getJiraProjectByOrganization(
    name: string
  ): Promise<ServiceResponse<string>> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/p/organization/${name}/jira-projects`
      );

      return {
        isSuccess: true,
        data: response.data.key,
      };
    } catch (error) {
      console.error("Error getting boards by organization:", error);
      return {
        isSuccess: false,
        error: "Failed to get boards by organization",
      };
    }
  }
}
