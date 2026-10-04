const express = require("express");
const router = express.Router();
const savedGroupsController = require("../controllers/savedGroupsController");

// SAVE or UNSAVE group
router.post("/groups/:groupId", savedGroupsController.toggleSave);

// Get user's saved groups
router.get("/user/:userId", savedGroupsController.getSavedGroups);

// Delete by savedId (اختياري)
router.delete("/:savedId", savedGroupsController.deleteSavedGroup);

module.exports = router;
