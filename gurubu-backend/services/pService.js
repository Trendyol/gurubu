const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

class PService {
  constructor() {
    this.baseUrl = process.env.P_GATEWAY_URL;
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
