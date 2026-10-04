const pool = require("../db");

module.exports = {
  // ------------------------------------------------
  // حفظ اهتمامات المستخدم (اختيار الفئات)
  // ------------------------------------------------
  saveUserInterests: async (req, res) => {
    try {
      console.log("saveUserInterests");
      const { user_id, category_ids } = req.body;

      if (!user_id || !Array.isArray(category_ids)) {
        return res
          .status(400)
          .json({ error: "user_id and category_ids required" });
      }

      // حذف الاهتمامات السابقة قبل حفظ الجديدة
      await pool.query(`DELETE FROM user_interests WHERE user_id = $1`, [
        user_id,
      ]);

      // إدخال الاهتمامات الجديدة
      const insertQuery = `
        INSERT INTO user_interests (user_id, category_id)
        VALUES ($1, $2)
      `;

      for (const categoryId of category_ids) {
        await pool.query(insertQuery, [user_id, categoryId]);
      }

      res.json({ message: "Interests saved successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save interests" });
    }
  },

  // ------------------------------------------------
  // جلب فئات المستخدم الحالية (اختياره السابق)
  // ------------------------------------------------
  getUserInterests: async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await pool.query(
        `
        SELECT category_id 
        FROM user_interests
        WHERE user_id = $1
      `,
        [userId]
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
