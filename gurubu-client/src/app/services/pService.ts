import axios from "axios";
import { ServiceResponse } from "@/shared/interfaces";
import { Assignee } from "types/planner";

export class PService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async searchOrganizations(query: string): Promise<ServiceResponse<string[]>> {
    try {
      const response = await axios.get(`${this.baseUrl}/p/organizations/search`, {
        params: { query }
      });
      return {
        isSuccess: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error searching organizations:", error);
      return {
        isSuccess: false,
        error: "Failed to search organizations"
      };
    }
  }

  async getOrganizationDetails(name: string): Promise<ServiceResponse<Record<string, Assignee>>> {
    try {
      const response = await axios.get(`${this.baseUrl}/p/organization/${name}`);
      return {
        isSuccess: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error getting organization details:", error);
      return {
        isSuccess: false,
        error: "Failed to get organization details"
      };
    }
  }
}
