const express = require("express");
const router = express.Router();
const jiraController = require("../controllers/jiraController");

router.get("/fetch", jiraController.fetchGet);
router.put("/fetch", jiraController.fetchPut);

module.exports = router;
