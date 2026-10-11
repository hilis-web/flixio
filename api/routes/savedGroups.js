const express = require("express");
const router = express.Router();

const savedGroupsController = require("../controllers/savedGroupsController");
const authMiddleware = require("../middleware/authMiddleware");

// Save or unsave a group — authenticated user only
router.post(
  "/groups/:groupId",
  authMiddleware,
  savedGroupsController.toggleSave,
);

// Get the authenticated user's saved groups
router.get("/me", authMiddleware, savedGroupsController.getSavedGroups);

// Legacy route — temporarily retained and protected
router.get(
  "/user/:userId",
  authMiddleware,
  savedGroupsController.getSavedGroups,
);

// Delete a saved group — authenticated user only
router.delete(
  "/:savedId",
  authMiddleware,
  savedGroupsController.deleteSavedGroup,
);

module.exports = router;
