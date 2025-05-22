const pService = require("../services/pService");

exports.getOrganizations = async (req, res) => {
  try {
    const results = await pService.getOrganizations();
    res.json(results);
  } catch (error) {
    console.error("Error in getOrganizations controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.searchOrganizations = async (req, res) => {
  try {
    const { query, page = 1, size = 10 } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await pService.searchOrganizations(query, page, size);
    res.json(results);
  } catch (error) {
    console.error("Error in searchOrganizations controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getOrganization = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Organization name is required" });
    }

    const results = await pService.getOrganization(name);
    res.json(results);
  } catch (error) {
    console.error("Error in getOrganization controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { username } = req.pUser;

    if (!username || username.trim() === "") {
      return res.status(400).json({ error: "Search name is required" });
    }

    const results = await pService.searchUsers(username);
    
    if (!results) {
      return res.status(404).json({ error: "No users found" });
    }
    
    res.json(results);
  } catch (error) {
    console.error("Error in searchUsers controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
