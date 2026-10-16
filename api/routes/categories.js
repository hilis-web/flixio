const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all categories
router.get("/", categoriesController.getAllCategories);

// Create category
// Category management is disabled for regular users until an explicit admin
// role/permission model exists. The controller also rejects these requests.
router.post("/", authMiddleware, categoriesController.createCategory);

// Delete category
router.delete("/:id", authMiddleware, categoriesController.deleteCategory);

module.exports = router;
