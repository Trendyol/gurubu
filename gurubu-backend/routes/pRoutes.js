const express = require("express");
const router = express.Router();
const pController = require("../controllers/pController");

router.get("/organizations", pController.getOrganizations);
router.get("/organizations/search", pController.searchOrganizations);
router.get("/organization/:name", pController.getOrganizationDetails);
router.get(
  "/organization/:name/jira-projects",
  pController.getJiraProjectByOrganization
);
module.exports = router;
