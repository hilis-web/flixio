const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groupsController");

// Get all public groups (timeline)
router.get("/public", groupsController.getPublicGroups);

// Create group
router.post("/", groupsController.createGroup);

// Get groups by user
router.get("/user/:userId", groupsController.getUserGroups);

// Get single group + cards
router.get("/:groupId", groupsController.getGroupWithCards);

// Delete group
router.delete("/:groupId", groupsController.deleteGroup);

module.exports = router;
