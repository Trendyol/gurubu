const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

class PService {
  constructor() {
    // Validate required environment variables
    const requiredEnvVars = {
      P_GATEWAY_URL: process.env.P_GATEWAY_URL
    };

    const missingVars = [];
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value || value.trim() === '') {
        missingVars.push(key);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables for P service: ${missingVars.join(', ')}. ` +
        'Please check your .env file and ensure P_GATEWAY_URL is set.'
      );
    }

    // Validate P_GATEWAY_URL format
    try {
      new URL(this.baseUrl = process.env.P_GATEWAY_URL);
    } catch (error) {
      throw new Error(`Invalid P_GATEWAY_URL format: ${process.env.P_GATEWAY_URL}. Must be a valid URL.`);
    }
  }

  async getOrganizations() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/organization/names`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting organizations:", error);
    }
  }

  async searchOrganizations(searchQuery, page = 1, size = 10) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/organization/list`,
        {
          params: {
            autocomplete: searchQuery,
            fields: "metadata.name,metadata.description",
            order: "asc",
            page,
            size,
            tab: "all",
          },
        }
      );

      const teamNames = response.data
        ? response.data.map((item) => item.metadata.name)
        : [];

      return teamNames;
    } catch (error) {
      console.error("Error searching organizations:", error);
    }
  }

  async getOrganization(name) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/organization/search`,
        {
          params: {
            name,
          },
        }
      );

      const teamData = response.data[0];
      if (!teamData) {
        return {};
      }

      return teamData;
    } catch (error) {
      console.error("Error getting organization details:", error);
    }
  }

  async searchUsers(name) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/users/search`,
        {
          params: {
            name,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error searching users:", error);
    }
  }
}

module.exports = new PService();
