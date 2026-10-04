const pool = require("../db");

module.exports = {
  // Toggle Save (Save / Unsave)
  toggleSave: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { user_id } = req.body;

      if (!user_id || !groupId)
        return res.status(400).json({ error: "user_id and groupId required" });

      // check if already saved
      const check = await pool.query(
        `SELECT * FROM saved_groups WHERE user_id = $1 AND group_id = $2`,
        [user_id, groupId]
      );

      if (check.rows.length > 0) {
        // Unsave
        await pool.query(
          `DELETE FROM saved_groups WHERE user_id = $1 AND group_id = $2`,
          [user_id, groupId]
        );

        return res.json({ saved: false, message: "Group unsaved" });
      }

      // Save
      const result = await pool.query(
        `INSERT INTO saved_groups (user_id, group_id) VALUES ($1, $2) RETURNING *`,
        [user_id, groupId]
      );

      res.json({ saved: true, savedRow: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to toggle save" });
    }
  },

  // Get saved groups
  getSavedGroups: async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await pool.query(
        `
        SELECT sg.*, cg.title, cg.description, cg.category_id, u.username
        FROM saved_groups sg
        JOIN card_groups cg ON cg.id = sg.group_id
        JOIN users u ON u.id = cg.user_id
        WHERE sg.user_id = $1
        ORDER BY sg.saved_at DESC
        `,
        [userId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch saved groups" });
    }
  },

  deleteSavedGroup: async (req, res) => {
    try {
      const { savedId } = req.params;
      await pool.query(`DELETE FROM saved_groups WHERE id = $1`, [savedId]);
      res.json({ message: "Saved group deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete saved group" });
    }
  },
};
