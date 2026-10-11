const express = require("express");
const router = express.Router();

const commentsController = require("../controllers/commentsController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

// Read comments — public groups are accessible to everyone
router.get(
  "/group/:groupId",
  optionalAuthMiddleware,
  commentsController.getCommentsByGroup,
);

// Add a comment — authentication required
router.post("/", authMiddleware, commentsController.addComment);

// Delete a comment — authentication required
router.delete("/:commentId", authMiddleware, commentsController.deleteComment);

module.exports = router;
