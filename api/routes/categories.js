const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");

// Get all categories
router.get("/", categoriesController.getAllCategories);

// Create category
router.post("/", categoriesController.createCategory);

// Delete category
router.delete("/:id", categoriesController.deleteCategory);

module.exports = router;
