exports.fetchGet = async (req, res) => {
  const { endpoint } = req.query;
  if (!endpoint || endpoint.trim() === '') {
    return res.status(400).json({ error: "Endpoint is required and must be a non-empty" });
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
      search: "?state=future"
    },
    {
      regex: /^\/rest\/agile\/1\.0\/board$/,
      search: "?name="
    },
    {
      regex: /^\/rest\/agile\/1\.0\/sprint\/\d+\/issue$/,
      search: ""
    }
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
      Authorization: req.headers.authorization
    }
  };
  try {
    const response = await fetch(apiUrl, options);
    if (response.status == 401) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!response.ok) {
      return res.status(response.status).json({ message: "Failed to fetch data from JIRA API" });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: "Error fetching data from JIRA API" });
  }
};

exports.fetchPut = async (req, res) => {
  const { endpoint } = req.query;
  if (!endpoint || endpoint.trim() === '') {
    return res.status(400).json({ error: "Endpoint is required and must be a non-empty" });
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
      search: ""
    }
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
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: req.headers.authorization
    },
    body: JSON.stringify(req.body)
  };
  try {
    const response = await fetch(apiUrl, options);
    if (response.status == 401) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (response.status != 201) {
      return res.status(response.status).json({ message: "Failed to put data from JIRA API" });
    }
    res.status(response.status);
  } catch (error) {
    res.status(400).json({ message: "Error put operation from JIRA API" });
  }
};
