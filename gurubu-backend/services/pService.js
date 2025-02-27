const axios = require("axios");
const dotenv = require("dotenv");

// Ensure dotenv is configured
dotenv.config();

class PService {
  constructor() {
    this.baseUrl = process.env.P_GATEWAY_URL
  }

  async searchOrganizations(searchQuery, page = 1, size = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/organization/list`, {
        params: {
          autocomplete: searchQuery,
          fields: 'metadata.name,metadata.description',
          order: 'asc',
          page,
          size,
          tab: 'all'
        }
      });

      // Extract team names from the response data
      const teamNames = response.data
        ? response.data.map(item => item.metadata.name)
        : [];

      return teamNames;
    } catch (error) {
      console.error('Error searching organizations:', error);
      throw error;
    }
  }

  async getOrganizationDetails(name) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/organization/search`, {
        params: {
          name
        }
      });

      const teamData = response.data[0];
      if (!teamData) {
        return {};
      }

      const developers = teamData.metadata.developer || [];
      const qaMembers = teamData.metadata.qa || [];
      const allMembers = [...developers, ...qaMembers];

      const result = allMembers.reduce((acc, member) => {
        acc[member] = {
          name: member,
          displayName: member.split('.').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        };
        return acc;
      }, {});

      return result;
    } catch (error) {
      console.error('Error getting organization details:', error);
      throw error;
    }
  }
}

module.exports = new PService();
