const axios = require("axios");

exports.fetchGet = async (req, res) => {
  const { endpoint } = req.query;
  if (!endpoint || endpoint.trim() === "") {
    return res
      .status(400)
      .json({ error: "Endpoint is required and must be a non-empty" });
  }
  let apiUrl = decodeURIComponent(endpoint);
  if (!apiUrl.match(/^https?:\/\//)) {
    apiUrl = `https://${apiUrl}`;
  }
  const apiUrlPath = new URL(apiUrl).pathname;
  const apiUrlSearch = new URL(apiUrl).search;

  const allowedEndpoints = [
    {
      regex: /^\/rest\/agile\/1\.0\/board\/\d+\/sprint$/,
      search: "?state=future",
    },
    {
      regex: /^\/rest\/agile\/1\.0\/board$/,
      search: "?maxResults=",
    },
    {
      regex: /^\/rest\/agile\/1\.0\/board$/,
      search: "?name=",
    },
    {
      regex: /^\/rest\/agile\/1\.0\/sprint\/\d+\/issue$/,
      search: "",
    },
    {
      regex: /^\/rest\/agile\/1\.0\/board$/,
      search: "?projectKeyOrId=",
    },
  ];

  const isAllowed = allowedEndpoints.some(({ regex, search }) => {
    if (!apiUrlSearch.includes(search)) {
      return false;
    }
    return regex.test(apiUrlPath);
  });

  if (!isAllowed) {
    return res.status(403).json({ message: "Unsupported endpoint" });
  }

  const options = {
    auth: {
      username: process.env.JIRA_USERNAME || "",
      password: process.env.JIRA_API_TOKEN || "",
    },
  };
  try {
    const response = await axios.get(apiUrl, options);
    if (response.status == 401) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!response.data) {
      return res
        .status(response.status)
        .json({ message: "Failed to fetch data from JIRA API" });
    }
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(400).json({ message: "Error fetching data from JIRA API" });
  }
};

exports.fetchPut = async (req, res) => {
  const { endpoint } = req.query;
  if (!endpoint || endpoint.trim() === "") {
    return res
      .status(400)
      .json({ error: "Endpoint is required and must be a non-empty" });
  }
  let apiUrl = decodeURIComponent(endpoint);
  if (!apiUrl.match(/^https?:\/\//)) {
    apiUrl = `https://${apiUrl}`;
  }
  const apiUrlPath = new URL(apiUrl).pathname;
  const apiUrlSearch = new URL(apiUrl).search;

  const allowedEndpoints = [
    {
      regex: /^\/rest\/api\/2\/issue\/\d+$/,
      search: "",
    },
  ];

  const isAllowed = allowedEndpoints.some(({ regex, search }) => {
    if (!apiUrlSearch.includes(search)) {
      return false;
    }
    return regex.test(apiUrlPath);
  });

  if (!isAllowed) {
    return res.status(403).json({ message: "Unsupported endpoint" });
  }

  const options = {
    headers: {
      "Content-Type": "application/json",
    },
    auth: {
      username: process.env.JIRA_USERNAME || "",
      password: process.env.JIRA_API_TOKEN || "",
    },
  };
  try {
    const response = await axios.put(apiUrl, req.body, options);
    if (response.status == 401) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (response.status != 201) {
      return res
        .status(response.status)
        .json({ message: "Failed to put data from JIRA API" });
    }
    res.status(response.status).send();
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { fields } = req.body || {};
      const jiraProjectKeyFour = process.env.JIRA_PROJECT_KEY_FOUR;

      if (!fields?.[jiraProjectKeyFour]) {
        return res.status(400).json({ message: "Vote set failed on retry." });
      }

      const modifiedBody = {
        fields: {
          customfield_14209: fields?.[jiraProjectKeyFour],
        },
      };

      const retryResponse = await axios.put(apiUrl, modifiedBody, options);
      if (retryResponse.status === 201) {
        return res.status(retryResponse.status).send();
      } else {
        return res.status(retryResponse.status).json({
          message: "Failed to put data from JIRA API even after retry",
        });
      }
    } catch (retryError) {
      return res.status(400).json({
        message: "Error in put operation from JIRA API after retry",
        originalError: error.message,
        retryError: retryError.message,
      });
    }
  }
};
