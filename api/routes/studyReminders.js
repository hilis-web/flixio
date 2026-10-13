const express = require("express");
const router = express.Router();

const studyRemindersController = require("../controllers/studyRemindersController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, studyRemindersController.getSettings);

router.put("/", authMiddleware, studyRemindersController.updateSettings);

module.exports = router;
