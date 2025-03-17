const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

class JiraInitialStoryPointService {
  baseUrl;
  auth;
  storyPointFieldName;

  constructor() {
    this.baseUrl = process.env.JIRA_BASE_URL || "";
    this.auth = {
      username: process.env.JIRA_USERNAME || "",
      password: process.env.JIRA_API_TOKEN || "",
    };
    this.storyPointFieldName = process.env.JIRA_PROJECT_KEY_FOUR;
  }

  async getBoardIssues(boardId, startAt = 0, maxResults = 50) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/agile/1.0/board/${boardId}/issue`,
        {
          params: {
            startAt,
            maxResults,
            expand: "changelog",
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
        throw new Error(`Failed to fetch board issues: ${error.message}`);
      }
      throw error;
    }
  }

  async getIssueChangelog(issueKey) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/2/issue/${issueKey}`,
        {
          params: {
            expand: "changelog",
          },
          auth: this.auth,
          headers: {
            Accept: "application/json",
          },
          timeout: 10000,
        }
      );
      return response.data;
    } catch (error) {
      try {
        console.log(`Retrying with direct changelog endpoint for issue ${issueKey}`);
        const changelogResponse = await axios.get(
          `${this.baseUrl}/rest/api/2/issue/${issueKey}/changelog`,
          {
            auth: this.auth,
            headers: {
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );
        
        const issueResponse = await axios.get(
          `${this.baseUrl}/rest/api/2/issue/${issueKey}`,
          {
            auth: this.auth,
            headers: {
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );
        
        issueResponse.data.changelog = changelogResponse.data;
        return issueResponse.data;
      } catch (retryError) {
        console.error(`Failed to get changelog for an issue using both methods`, retryError);
        return {
          key: issueKey,
          fields: {},
          changelog: { histories: [] }
        };
      }
    }
  }

  findInitialStoryPoint(changelog, fieldName) {
    if (!changelog || !changelog.histories || changelog.histories.length === 0) {
      return null;
    }

    const sortedHistories = [...changelog.histories].sort(
      (a, b) => new Date(a.created) - new Date(b.created)
    );

    for (const history of sortedHistories) {
      if (!history.items) continue;
      
      const storyPointChange = history.items.find(
        (item) => item.field === "Story Points" || item.field === fieldName || item.fieldId === fieldName
      );

      if (storyPointChange && storyPointChange.toString) {
        const storyPointValue = parseFloat(storyPointChange.toString);
        if (!isNaN(storyPointValue) && storyPointValue !== null) {
          return storyPointValue;
        }
      }
    }

    return null;
  }

  async processAllBoardIssues(boardId, progressCallback) {
    const result = [];
    let startAt = 0;
    const maxResults = 50;
    let total = 0;
    let processed = 0;

    try {
      const firstBatch = await this.getBoardIssues(boardId, startAt, maxResults);
      total = firstBatch.total;
      
      if (progressCallback) {
        progressCallback({
          total,
          processed: 0,
          currentRange: { start: 1, end: Math.min(maxResults, total) },
          status: 'in_progress'
        }, []);
      }

      let issues = firstBatch.issues;
      
      while (issues.length > 0) {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        let batchProcessedIssues = [];
        
        for (const issue of issues) {
          try {
            let issueWithChangelog;
            
            if (issue.changelog) {
              issueWithChangelog = issue;
            } else {
              await delay(200);
              issueWithChangelog = await this.getIssueChangelog(issue.key);
            }
            
            const initialStoryPoint = this.findInitialStoryPoint(
              issueWithChangelog.changelog,
              this.storyPointFieldName
            );

            const processedIssue = {
              key: issue.key,
              summary: issue.fields.summary,
              description: issue.fields.description,
              initialStoryPoint,
              storyPoint: issue.fields[this.storyPointFieldName] || null,
            };
            
            result.push(processedIssue);
            batchProcessedIssues.push(processedIssue);

            processed++;
            
            if (progressCallback && (processed % 5 === 0 || batchProcessedIssues.length >= 5)) {
              progressCallback({
                total,
                processed,
                currentRange: { 
                  start: startAt + 1, 
                  end: Math.min(startAt + maxResults, total) 
                },
                status: 'in_progress'
              }, batchProcessedIssues);
              
              batchProcessedIssues = [];
            }
          } catch (error) {
            console.error(`Error processing an issue:`, error);
            const errorIssue = {
              key: issue.key,
              summary: issue.fields?.summary || "Unknown",
              description: issue.fields?.description || null,
              initialStoryPoint: null,
              storyPoint: issue.fields?.[this.storyPointFieldName] || null,
              error: error.message
            };
            
            result.push(errorIssue);
            batchProcessedIssues.push(errorIssue);
            
            processed++;
          }
        }
        
        if (progressCallback && batchProcessedIssues.length > 0) {
          progressCallback({
            total,
            processed,
            currentRange: { 
              start: startAt + 1, 
              end: Math.min(startAt + maxResults, total) 
            },
            status: 'in_progress'
          }, batchProcessedIssues);
        }

        startAt += maxResults;
        if (startAt < total) {
          await delay(500);
          const nextBatch = await this.getBoardIssues(boardId, startAt, maxResults);
          issues = nextBatch.issues;
          
          if (progressCallback) {
            progressCallback({
              total,
              processed,
              currentRange: { 
                start: startAt + 1, 
                end: Math.min(startAt + maxResults, total) 
              },
              status: 'in_progress'
            }, []);
          }
        } else {
          issues = [];
        }
      }

      if (progressCallback) {
        progressCallback({
          total,
          processed: total,
          currentRange: { start: 1, end: total },
          status: 'completed'
        }, []);
      }

      return result;
    } catch (error) {
      if (progressCallback) {
        progressCallback({
          total,
          processed,
          currentRange: { 
            start: startAt + 1, 
            end: Math.min(startAt + maxResults, total) 
          },
          status: 'error',
          error: error.message
        }, []);
      }
      throw error;
    }
  }
}

module.exports = new JiraInitialStoryPointService();
