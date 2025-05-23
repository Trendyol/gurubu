const express = require("express");
const router = express.Router();
const pController = require("../controllers/pController");

router.get("/organizations", pController.getOrganizations);
router.get("/organizations/search", pController.searchOrganizations);
router.get("/organization/:name", pController.getOrganization);
router.get("/users/search", pController.searchUsers);

module.exports = router;
