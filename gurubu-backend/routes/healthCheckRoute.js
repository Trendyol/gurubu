const express = require("express");
const router = express.Router();
const healthCheckController = require("../controllers/healthCheckController");

router.get("/", healthCheckController.check);

module.exports = router;
