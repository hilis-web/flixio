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

// Like or unlike a comment/reply — authentication required
router.post(
  "/:commentId/like",
  authMiddleware,
  commentsController.toggleCommentLike,
);

// Delete a comment — authentication required
router.delete("/:commentId", authMiddleware, commentsController.deleteComment);

module.exports = router;
