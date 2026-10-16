const pool = require("../db");

module.exports = {
  // ------------------------------------------------
  // حفظ اهتمامات المستخدم (اختيار الفئات)
  // ------------------------------------------------
  saveUserInterests: async (req, res) => {
    const userId = req.user.id;
    const { category_ids: categoryIds } = req.body || {};

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ error: "category_ids must be an array" });
    }

    const normalizedIds = categoryIds.map(Number);
    if (normalizedIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      return res.status(400).json({ error: "Invalid category IDs" });
    }
    const uniqueIds = [...new Set(normalizedIds)];

    let client;
    try {
      client = await pool.connect();
      if (uniqueIds.length) {
        const categories = await client.query(
          "SELECT id FROM categories WHERE id = ANY($1::int[])",
          [uniqueIds],
        );
        if (categories.rowCount !== uniqueIds.length) {
          return res
            .status(400)
            .json({ error: "One or more categories do not exist" });
        }
      }

      await client.query("BEGIN");
      await client.query("DELETE FROM user_interests WHERE user_id = $1", [
        userId,
      ]);
      for (const categoryId of uniqueIds) {
        await client.query(
          "INSERT INTO user_interests (user_id, category_id) VALUES ($1, $2)",
          [userId, categoryId],
        );
      }
      await client.query("COMMIT");
      return res.json({
        message: "Interests saved successfully",
        interests: uniqueIds,
      });
    } catch (err) {
      if (client) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackError) {
          console.error("Interests rollback error:", rollbackError.message);
        }
      }
      console.error("Save interests error:", err.message);
      return res.status(500).json({ error: "Failed to save interests" });
    } finally {
      if (client) client.release();
    }
  },

  // ------------------------------------------------
  // جلب فئات المستخدم الحالية (اختياره السابق)
  // ------------------------------------------------
  getUserInterests: async (req, res) => {
    try {
      const { userId } = req.params;
      if (String(userId) !== String(req.user.id)) {
        return res
          .status(403)
          .json({ error: "You can only access your own interests" });
      }

      const result = await pool.query(
        `
        SELECT category_id 
        FROM user_interests
        WHERE user_id = $1
      `,
        [userId],
      );

      res.json(result.rows.map((r) => r.category_id));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load user interests" });
    }
  },

  // ------------------------------------------------
  // جلب جميع الفئات من جدول categories
  // ------------------------------------------------
  getAllCategories: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM categories ORDER BY name ASC
      `);

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load categories" });
    }
  },
};
