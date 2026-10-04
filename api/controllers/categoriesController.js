const pool = require("../db");

module.exports = {
  // -------------------------
  // Get all categories
  // -------------------------
  getAllCategories: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM categories ORDER BY id ASC`
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
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const result = await pool.query(
        `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
        [name]
      );

      res.json({
        message: "Category created",
        category: result.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create category" });
    }
  },

  // -------------------------
  // Delete category
  // -------------------------
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);

      res.json({ message: "Category deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete category" });
    }
  },
};
