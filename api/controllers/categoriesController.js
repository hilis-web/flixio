const pool = require("../db");

module.exports = {
  // -------------------------
  // Get all categories
  // -------------------------
  getAllCategories: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM categories ORDER BY id ASC`,
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  },

  // -------------------------
  // Create a new category
  // -------------------------
  createCategory: async (req, res) => {
    // No admin role/permission model exists in the current users schema.
    // Fail closed until category administration can be restricted to admins.
    return res.status(403).json({
      error: "Category management requires admin permissions",
    });
  },

  // -------------------------
  // Delete category
  // -------------------------
  deleteCategory: async (req, res) => {
    // No admin role/permission model exists in the current users schema.
    return res.status(403).json({
      error: "Category management requires admin permissions",
    });
  },
};
