const pool = require("../db");

module.exports = {
  // Toggle Save (Save / Unsave)

  toggleSave: async (req, res) => {
    try {
      const userId = req.user.id;
      const groupId = Number(req.params.groupId);

      if (!Number.isInteger(groupId) || groupId <= 0) {
        return res.status(400).json({ error: "Invalid group ID" });
      }

      const groupResult = await pool.query(
        `SELECT id, user_id, is_public
       FROM card_groups
       WHERE id = $1`,
        [groupId],
      );

      if (groupResult.rowCount === 0) {
        return res.status(404).json({ error: "Group not found" });
      }

      const group = groupResult.rows[0];

      // Only the owner can save a private group.
      if (!group.is_public && Number(group.user_id) !== Number(userId)) {
        return res.status(404).json({ error: "Group not found" });
      }

      const check = await pool.query(
        `SELECT id
       FROM saved_groups
       WHERE user_id = $1 AND group_id = $2`,
        [userId, groupId],
      );

      if (check.rowCount > 0) {
        await pool.query(
          `DELETE FROM saved_groups
         WHERE user_id = $1 AND group_id = $2`,
          [userId, groupId],
        );

        return res.json({ saved: false, message: "Group unsaved" });
      }

      const result = await pool.query(
        `INSERT INTO saved_groups (user_id, group_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, group_id) DO NOTHING
       RETURNING *`,
        [userId, groupId],
      );

      if (result.rowCount === 0) {
        return res.json({ saved: true, message: "Group already saved" });
      }

      return res.status(201).json({
        saved: true,
        savedRow: result.rows[0],
      });
    } catch (err) {
      console.error("Toggle saved group error:", err.message);
      return res.status(500).json({ error: "Failed to toggle save" });
    }
  },

  // Get saved groups

  getSavedGroups: async (req, res) => {
    try {
      // Always use the authenticated user's ID.
      const userId = req.user.id;

      const result = await pool.query(
        `SELECT
         sg.id,
         sg.user_id,
         sg.group_id,
         sg.saved_at,
         cg.title,
         cg.description,
         cg.category_id,
         cg.image_url,
         cg.is_public,
         u.username
       FROM saved_groups sg
       JOIN card_groups cg ON cg.id = sg.group_id
       JOIN users u ON u.id = cg.user_id
       WHERE sg.user_id = $1
         AND (
           cg.is_public = TRUE
           OR cg.user_id = $1
         )
       ORDER BY sg.saved_at DESC`,
        [userId],
      );

      return res.json(result.rows);
    } catch (err) {
      console.error("Get saved groups error:", err.message);
      return res.status(500).json({
        error: "Failed to fetch saved groups",
      });
    }
  },

  deleteSavedGroup: async (req, res) => {
    try {
      const savedId = Number(req.params.savedId);
      const userId = req.user.id;

      if (!Number.isInteger(savedId) || savedId <= 0) {
        return res.status(400).json({
          error: "Invalid saved group ID",
        });
      }

      const result = await pool.query(
        `DELETE FROM saved_groups
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
        [savedId, userId],
      );

      if (result.rowCount === 0) {
        const existing = await pool.query(
          `SELECT id FROM saved_groups WHERE id = $1`,
          [savedId],
        );

        if (existing.rowCount === 0) {
          return res.status(404).json({
            error: "Saved group not found",
          });
        }

        return res.status(403).json({
          error: "You are not allowed to delete this saved group",
        });
      }

      return res.json({ message: "Saved group deleted" });
    } catch (err) {
      console.error("Delete saved group error:", err.message);
      return res.status(500).json({
        error: "Failed to delete saved group",
      });
    }
  },
};
