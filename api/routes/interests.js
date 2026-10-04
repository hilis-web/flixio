const express = require("express");
const router = express.Router();
const interestsController = require("../controllers/interestsController");

// Get all categories
router.get("/categories", interestsController.getAllCategories);

// Save user's selected interests
router.post("/save", interestsController.saveUserInterests);

// Get user's interests
router.get("/user/:userId", interestsController.getUserInterests);

module.exports = router;
