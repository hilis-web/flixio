const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowers,
  getFollowing,
  getFollowCounts,
} = require("../controllers/followsController");

// Follow a user
router.post("/:userId", authMiddleware, followUser);

// Unfollow a user
router.delete("/:userId", authMiddleware, unfollowUser);

// Check follow status
router.get("/:userId/followers", authMiddleware, getFollowers);
router.get("/:userId/following", authMiddleware, getFollowing);
router.get("/:userId/status", authMiddleware, getFollowStatus);
router.get("/:userId/counts", authMiddleware, getFollowCounts);
module.exports = router;
