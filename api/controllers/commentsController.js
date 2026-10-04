const pool = require("../db");

module.exports = {
  // ------------------------
  // Get all comments for a group
  // ------------------------
  getCommentsByGroup: async (req, res) => {
    try {
      const { groupId } = req.params;
      const result = await pool.query(
        `SELECT cm.*, u.username 
                 FROM comments cm
                 JOIN users u ON u.id = cm.user_id
                 WHERE cm.group_id = $1
                 ORDER BY cm.created_at ASC`,
        [groupId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  },

  // ------------------------
  // Add a comment
  // ------------------------
  addComment: async (req, res) => {
    try {
      const { user_id, group_id, content } = req.body;
      if (!user_id || !group_id || !content) {
        return res
          .status(400)
          .json({ error: "user_id, group_id and content are required" });
      }

      const result = await pool.query(
        `INSERT INTO comments (user_id, group_id, content) VALUES ($1, $2, $3) RETURNING *`,
        [user_id, group_id, content]
      );

      res.json({
        message: "Comment added",
        comment: result.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add comment" });
    }
  },

  // ------------------------
  // Delete a comment
  // ------------------------
  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      await pool.query(`DELETE FROM comments WHERE id = $1`, [commentId]);
      res.json({ message: "Comment deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  },
};
