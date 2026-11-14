const buildJiraRequestOptions = (extra = {}) => {
  const token = process.env.JIRA_API_TOKEN || "";
  const username = process.env.JIRA_USERNAME || "";
  const authType = String(process.env.JIRA_AUTH_TYPE || "basic").toLowerCase();
  const headers = {
    Accept: "application/json",
    ...(extra.headers || {}),
  };

  if (authType === "bearer") {
    return {
      ...extra,
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }

  return {
    ...extra,
    headers,
    auth: {
      username,
      password: token,
    },
  };
};

module.exports = {
  buildJiraRequestOptions,
};
