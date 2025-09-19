const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

router.get("/", serviceController.list);
router.get("/:id", serviceController.details);

module.exports = router;
