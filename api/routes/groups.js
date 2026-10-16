const express = require("express");
const router = express.Router();
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const groupsController = require("../controllers/groupsController");
const authMiddleware = require("../middleware/authMiddleware");
const likesController = require("../controllers/likesController");

// Public groups — available to everyone
router.get("/public", optionalAuthMiddleware, groupsController.getPublicGroups);

// Create group — authenticated
router.post("/", authMiddleware, groupsController.createGroup);

// Get own groups — authenticated
router.get("/me", authMiddleware, groupsController.getMyGroups);

// Update group — authenticated owner only
router.put("/:groupId", authMiddleware, groupsController.updateGroup);

// Delete group — authenticated owner only
router.delete("/:groupId", authMiddleware, groupsController.deleteGroup);

router.get("/following", authMiddleware, groupsController.getFollowingGroups);
// Get single group + cards — visibility protection comes next
router.get(
  "/:groupId",
  optionalAuthMiddleware,
  groupsController.getGroupWithCards,
);

router.post("/:groupId/like", authMiddleware, likesController.toggleLike);
module.exports = router;
