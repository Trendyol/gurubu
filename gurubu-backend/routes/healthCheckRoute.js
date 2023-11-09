const express = require("express");
const router = express.Router();
const healthCheckController = require("../controllers/healthCheckContoller");

router.get("/", healthCheckController.check);

module.exports = router;
