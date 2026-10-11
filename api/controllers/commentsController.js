const pool = require("../db");

module.exports = {
  // ------------------------
  // Get all comments for a group
  // ------------------------

  getCommentsByGroup: async (req, res) => {
    try {
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

      if (
        !group.is_public &&
        (!req.user || Number(req.user.id) !== Number(group.user_id))
      ) {
        return res.status(404).json({ error: "Group not found" });
      }

      const result = await pool.query(
        `SELECT cm.id, cm.user_id, cm.group_id, cm.content,
              cm.created_at, u.username
       FROM comments cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.group_id = $1
       ORDER BY cm.created_at ASC`,
        [groupId],
      );

      return res.json(result.rows);
    } catch (err) {
      console.error("Get comments error:", err.message);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }
  },

  // ------------------------
  // Add a comment
  // ------------------------

  addComment: async (req, res) => {
    try {
      const userId = req.user.id;
      const groupId = Number(req.body.group_id);
      const { content } = req.body;

      if (!Number.isInteger(groupId) || groupId <= 0) {
        return res.status(400).json({ error: "Invalid group_id" });
      }

      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({ error: "content is required" });
      }

      if (content.trim().length > 2000) {
        return res.status(400).json({
          error: "Comment must not exceed 2000 characters",
        });
      }

      // Verify that the group exists and is accessible.
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

      if (!group.is_public && Number(group.user_id) !== Number(userId)) {
        return res.status(404).json({ error: "Group not found" });
      }

      const result = await pool.query(
        `INSERT INTO comments (user_id, group_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
        [userId, groupId, content.trim()],
      );

      return res.status(201).json({
        message: "Comment added",
        comment: result.rows[0],
      });
    } catch (err) {
      console.error("Add comment error:", err.message);
      return res.status(500).json({ error: "Failed to add comment" });
    }
  },

  // ------------------------
  // Delete a comment
  // ------------------------

  deleteComment: async (req, res) => {
    try {
      const commentId = Number(req.params.commentId);
      const userId = req.user.id;

      if (!Number.isInteger(commentId) || commentId <= 0) {
        return res.status(400).json({ error: "Invalid comment ID" });
      }

      const result = await pool.query(
        `DELETE FROM comments
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
        [commentId, userId],
      );

      if (result.rowCount === 0) {
        const existingComment = await pool.query(
          `SELECT id FROM comments WHERE id = $1`,
          [commentId],
        );

        if (existingComment.rowCount === 0) {
          return res.status(404).json({ error: "Comment not found" });
        }

        return res.status(403).json({
          error: "You are not allowed to delete this comment",
        });
      }

      return res.json({ message: "Comment deleted" });
    } catch (err) {
      console.error("Delete comment error:", err.message);
      return res.status(500).json({ error: "Failed to delete comment" });
    }
  },
};
