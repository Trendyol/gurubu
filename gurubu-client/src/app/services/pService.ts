import axios from "axios";
import { ServiceResponse, pProfile } from "@/shared/interfaces";
import { PandoraOrganization } from "types/pandora";

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

  async getOrganization(
    name: string
  ): Promise<ServiceResponse<PandoraOrganization>> {
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

  async searchUser(): Promise<ServiceResponse<{spec: {profile: pProfile}}[]>> {
    try {
      const response = await axios.get(`${this.baseUrl}/p/users/search`, {
        withCredentials: true,
      });
      
      return {
        isSuccess: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error searching user:", error);
      return {
        isSuccess: false,
        error: "Failed to search user",
      };
    }
  }
}
