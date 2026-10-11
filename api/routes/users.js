const express = require("express");
const router = express.Router();

const usersController = require("../controllers/usersController");
const authMiddleware = require("../middleware/authMiddleware");

// Get the authenticated user's profile
router.get("/me", authMiddleware, usersController.getUserProfile);

// Update the authenticated user's profile
router.put("/me", authMiddleware, usersController.updateUserProfile);

// Update the authenticated user's interests
router.put(
  "/me/interests",
  authMiddleware,
  usersController.updateUserInterests,
);

module.exports = router;
