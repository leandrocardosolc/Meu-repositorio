const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

router.get("/create", appointmentController.createForm);
router.post("/create", appointmentController.create);
router.get("/confirmation/:id", appointmentController.confirmation);

module.exports = router;
