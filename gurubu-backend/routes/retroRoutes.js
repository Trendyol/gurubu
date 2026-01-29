const express = require("express");
const router = express.Router();
const retroController = require("../controllers/retroController");

router.get("/templates", retroController.getTemplates);
router.post("/create", retroController.createRetro);
router.post("/:retroId", retroController.joinRetro);
router.get("/:retroId", retroController.getRetro);

module.exports = router;
