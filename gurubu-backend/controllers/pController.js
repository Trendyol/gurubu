const pService = require('../services/pService');

exports.searchOrganizations = async (req, res) => {
  try {
    const { query, page = 1, size = 10 } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await pService.searchOrganizations(query, page, size);
    res.json(results);
  } catch (error) {
    console.error('Error in searchOrganizations controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOrganizationDetails = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    const results = await pService.getOrganizationDetails(name);
    res.json(results);
  } catch (error) {
    console.error('Error in getOrganizationDetails controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
