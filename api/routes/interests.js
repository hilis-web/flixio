const express = require("express");
const router = express.Router();
const interestsController = require("../controllers/interestsController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all categories
router.get("/categories", interestsController.getAllCategories);

// Save user's selected interests
router.post("/save", authMiddleware, interestsController.saveUserInterests);

// Get user's interests
router.get(
  "/user/:userId",
  authMiddleware,
  interestsController.getUserInterests,
);

module.exports = router;
