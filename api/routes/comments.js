const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");

// Get all comments for a group
router.get("/group/:groupId", commentsController.getCommentsByGroup);

// Add a comment
router.post("/", commentsController.addComment);

// Delete a comment
router.delete("/:commentId", commentsController.deleteComment);

module.exports = router;
