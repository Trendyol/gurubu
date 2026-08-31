const express = require("express");
const router = express.Router();
const presentationController = require("../controllers/presentationController");

router.get("/templates", presentationController.getTemplates);
router.post("/create", presentationController.createPresentation);
router.post("/check-batch", presentationController.checkPresentationBatch);
router.post("/:presentationId", presentationController.joinPresentation);
router.get("/:presentationId", presentationController.getPresentation);

module.exports = router;
