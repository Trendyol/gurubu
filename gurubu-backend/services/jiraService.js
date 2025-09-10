const axios = require("axios");
const dotenv = require("dotenv");

// Ensure dotenv is configured
dotenv.config();

class JiraService {
  baseUrl;
  auth;

  constructor() {
    // Validate required environment variables
    const requiredEnvVars = {
      JIRA_BASE_URL: process.env.JIRA_BASE_URL,
      JIRA_USERNAME: process.env.JIRA_USERNAME,
      JIRA_API_TOKEN: process.env.JIRA_API_TOKEN
    };

    const missingVars = [];
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value || value.trim() === '') {
        missingVars.push(key);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables for JIRA service: ${missingVars.join(', ')}. ` +
        'Please check your .env file and ensure all JIRA configuration variables are set.'
      );
    }

    // Validate JIRA_BASE_URL format
    try {
      new URL(this.baseUrl = process.env.JIRA_BASE_URL);
    } catch (error) {
      throw new Error(`Invalid JIRA_BASE_URL format: ${process.env.JIRA_BASE_URL}. Must be a valid URL.`);
    }

    this.auth = {
      username: process.env.JIRA_USERNAME,
      password: process.env.JIRA_API_TOKEN,
    };

    // Warn about optional JIRA project keys if not set
    const optionalKeys = ['JIRA_PROJECT_KEY_ONE', 'JIRA_PROJECT_KEY_TWO', 'JIRA_PROJECT_KEY_THREE', 'JIRA_PROJECT_KEY_FOUR'];
    const missingOptionalKeys = optionalKeys.filter(key => !process.env[key]);

    if (missingOptionalKeys.length > 0) {
      console.warn(
        `Warning: Optional JIRA project keys not configured: ${missingOptionalKeys.join(', ')}. ` +
        'Some features may not work correctly without these configurations.'
      );
    }
  }

  mapIssueResponse(response) {
    let pairAssignee = null;
    let testAssignee = null;
    let testStoryPoint = null;
    let storyPoint = null;

    return {
      maxResults: response.maxResults,
      startAt: response.startAt,
      total: response.total,
      issues: response.issues.map((issue) => {
        if (process.env.JIRA_PROJECT_KEY_ONE) {
          pairAssignee = issue.fields[process.env.JIRA_PROJECT_KEY_ONE];
        }

        if (process.env.JIRA_PROJECT_KEY_TWO) {
          testAssignee = issue.fields[process.env.JIRA_PROJECT_KEY_TWO];
        }

        if (process.env.JIRA_PROJECT_KEY_THREE) {
          testStoryPoint = issue.fields[process.env.JIRA_PROJECT_KEY_THREE];
        }

        if (process.env.JIRA_PROJECT_KEY_FOUR) {
          storyPoint = issue.fields[process.env.JIRA_PROJECT_KEY_FOUR];
        }

        return {
          key: issue.key,
          assignee: issue.fields.assignee
            ? {
              self: `${this.baseUrl}/rest/api/2/user?username=${issue.fields.assignee.name}`,
              name: issue.fields.assignee.name,
              key: `JIRAUSER_${issue.fields.assignee.name}`,
              emailAddress: issue.fields.assignee.emailAddress,
              displayName: issue.fields.assignee.displayName,
              active: true,
              timeZone: "Europe/Istanbul",
            }
            : null,
          pairAssignee,
          testAssignee,
          testStoryPoint,
          storyPoint,
        };
      }),
    };
  }

  calculateSprintStatistics(sprintId, issues, assignees) {
    const statisticsMap = new Map();

    // Initialize statistics for all known assignees
    assignees.forEach((assignee) => {
      statisticsMap.set(assignee, {
        assignee,
        totalStoryPoints: 0,
        totalPairStoryPoints: 0,
        totalTestStoryPoints: 0,
        pairedTasks: [],
        testTasks: [],
        assignedTasks: [],
      });
    });

    let totalStoryPoints = 0;
    let totalTestStoryPoints = 0;
    let totalAssignedStoryPoints = 0;

    // Process each issue
    issues.forEach((issue) => {
      const storyPoint = issue.storyPoint || 0;
      // If storyPoint is 0, force testStoryPoint to be 0 as well
      const testStoryPoint = !storyPoint || storyPoint === 0 ? 0 : (issue.testStoryPoint || 0);

      totalStoryPoints += storyPoint;
      totalTestStoryPoints += testStoryPoint;

      // Process main assignee
      if (issue.assignee?.name) {
        const stats = statisticsMap.get(issue.assignee.name);
        if (stats) {
          totalAssignedStoryPoints += storyPoint;
          stats.totalStoryPoints += storyPoint;
          stats.assignedTasks.push({
            key: issue.key,
            storyPoint,
          });
        }
      }

      // Process pair assignee (don't add to totalStoryPoints, only to totalPairStoryPoints)
      if (issue.pairAssignee?.name) {
        const stats = statisticsMap.get(issue.pairAssignee.name);
        if (stats) {
          stats.totalPairStoryPoints += storyPoint;
          stats.pairedTasks.push({
            key: issue.key,
            storyPoint,
            mainAssignee: issue.assignee || {
              name: "unknown",
              displayName: "Unknown",
            },
          });
        }
      }

      // Process test assignee
      if (issue.testAssignee?.name) {
        const stats = statisticsMap.get(issue.testAssignee.name);
        if (stats) {
          stats.totalTestStoryPoints += testStoryPoint;
          stats.testTasks.push({
            key: issue.key,
            testStoryPoint,
          });
        }
      }
    });

    // Convert map to array and sort by points
    const statistics = Array.from(statisticsMap.values()).sort(
      (a, b) =>
        // Sort by total story points (excluding pair points) first
        b.totalStoryPoints - a.totalStoryPoints ||
        // If equal, sort by total test points
        b.totalTestStoryPoints - a.totalTestStoryPoints ||
        // If still equal, sort by pair points
        b.totalPairStoryPoints - a.totalPairStoryPoints
    );

    return {
      sprintId,
      statistics,
      totalStoryPoints,
      totalTestStoryPoints,
      totalAssignedStoryPoints,
    };
  }

  async getFutureSprints(boardId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/agile/1.0/board/${boardId}/sprint`,
        {
          params: {
            state: "future",
          },
          auth: this.auth,
          headers: {
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        throw new Error(`Failed to fetch sprints: ${error.message}`);
      }
      throw error;
    }
  }

  async getSprintIssues(sprintId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/agile/1.0/sprint/${sprintId}/issue`,
        {
          auth: this.auth,
          headers: {
            Accept: "application/json",
          },
        }
      );
      return this.mapIssueResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        throw new Error(`Failed to fetch sprint issues: ${error.message}`);
      }
      throw error;
    }
  }

  async getSprintStatistics(sprintId) {
    try {
      const issues = await this.getSprintIssues(sprintId);
      const assigneesData = req.body.assignees;
      return this.calculateSprintStatistics(
        sprintId,
        issues.issues,
        assigneesData
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        throw new Error(
          `Failed to calculate sprint statistics: ${error.message}`
        );
      }
      throw error;
    }
  }

  async getBoardByName(name) {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/agile/1.0/board`, {
        params: {
          name,
        },
        auth: this.auth,
        headers: {
          Accept: "application/json",
        },
      });

      const board = response.data.values.find((board) => board.name === name);
      if (!board) {
        throw new Error(`Board with name ${name} not found`);
      }

      return {
        id: board.id,
        name: board.name,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        throw new Error(`Failed to fetch board: ${error.message}`);
      }
      throw error;
    }
  }

  async getBoardsByProjectKey(projectKey) {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/agile/1.0/board`, {
        params: {
          projectKeyOrId: projectKey,
          type: "scrum",
        },
        auth: this.auth,
        headers: {
          Accept: "application/json",
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch board: ${error.message}`);
    }
  }

  async searchIssuesByStoryPoints(projectKey, storyPoints, maxResults = 20, excludeDone = true) {
    try {
      const storyPointCustomField = process.env.JIRA_PROJECT_KEY_FOUR || "";
      const customFieldIdMatch = storyPointCustomField.match(/customfield_(\d+)/);
      const cfId = customFieldIdMatch ? customFieldIdMatch[1] : null;

      const storyPointClause = cfId ? `cf[${cfId}] = ${storyPoints}` : `'Story Points' = ${storyPoints}`;
      const baseClauses = [`project = ${projectKey}`, storyPointClause];
      if (excludeDone) {
        baseClauses.push("statusCategory != Done");
      }
      const jql = `${baseClauses.join(" AND ")} ORDER BY updated DESC`;

      const response = await axios.get(`${this.baseUrl}/rest/api/2/search`, {
        params: {
          jql,
          maxResults,
          fields: [
            "summary",
            "issuetype",
            "status",
            "assignee",
          ].join(","),
        },
        auth: this.auth,
        headers: {
          Accept: "application/json",
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        throw new Error(`Failed to search issues by story points: ${error.message}`);
      }
      throw error;
    }
  }
}

module.exports = new JiraService();
