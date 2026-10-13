const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");

// Get review statistics for the logged-in user
router.get("/stats", authMiddleware, reviewController.getReviewStats);

// Get cards that are new or due for review in a group
router.get(
  "/group/:groupId",
  authMiddleware,
  reviewController.getDueCardsByGroup,
);

router.get("/streak", authMiddleware, reviewController.getLearningStreak);

// Save a review rating for a card
router.post("/:cardId", authMiddleware, reviewController.saveReview);

module.exports = router;
