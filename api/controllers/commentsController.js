const pool = require("../db");

module.exports = {
  // Get all comments and replies for a group
  getCommentsByGroup: async (req, res) => {
    try {
      const groupId = Number(req.params.groupId);
      const currentUserId = req.user ? Number(req.user.id) : null;

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
        `SELECT
           cm.id,
           cm.user_id,
           cm.group_id,
           cm.content,
           cm.parent_comment_id,
           cm.created_at,
           u.username,
           COUNT(cl.id)::INTEGER AS "likesCount",
           COALESCE(
             BOOL_OR(cl.user_id = $2),
             FALSE
           ) AS "userLiked"
         FROM comments cm
         JOIN users u ON u.id = cm.user_id
         LEFT JOIN comment_likes cl ON cl.comment_id = cm.id
         WHERE cm.group_id = $1
         GROUP BY
           cm.id,
           cm.user_id,
           cm.group_id,
           cm.content,
           cm.parent_comment_id,
           cm.created_at,
           u.username
         ORDER BY cm.created_at ASC, cm.id ASC`,
        [groupId, currentUserId],
      );

      return res.json(result.rows);
    } catch (err) {
      console.error("Get comments error:", err.message);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }
  },

  // Add a comment or reply
  addComment: async (req, res) => {
    try {
      const userId = Number(req.user.id);
      const groupId = Number(req.body.group_id);
      const { content } = req.body;

      const parentCommentId =
        req.body.parent_comment_id == null || req.body.parent_comment_id === ""
          ? null
          : Number(req.body.parent_comment_id);

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

      if (
        parentCommentId !== null &&
        (!Number.isInteger(parentCommentId) || parentCommentId <= 0)
      ) {
        return res.status(400).json({ error: "Invalid parent_comment_id" });
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

      if (!group.is_public && Number(group.user_id) !== userId) {
        return res.status(404).json({ error: "Group not found" });
      }

      let parentComment = null;

      if (parentCommentId !== null) {
        const parentResult = await pool.query(
          `SELECT id, user_id, group_id, parent_comment_id
           FROM comments
           WHERE id = $1 AND group_id = $2`,
          [parentCommentId, groupId],
        );

        if (parentResult.rowCount === 0) {
          return res.status(404).json({
            error: "Parent comment not found in this group",
          });
        }

        parentComment = parentResult.rows[0];

        if (parentComment.parent_comment_id !== null) {
          return res.status(400).json({
            error: "Replies to replies are not supported",
          });
        }
      }

      const result = await pool.query(
        `INSERT INTO comments
           (user_id, group_id, content, parent_comment_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, groupId, content.trim(), parentCommentId],
      );

      if (parentComment) {
        if (Number(parentComment.user_id) !== userId) {
          await pool.query(
            `INSERT INTO notifications
               (recipient_id, actor_id, type, entity_id, message)
             VALUES ($1, $2, 'comment', $3, $4)`,
            [parentComment.user_id, userId, groupId, "replied to your comment"],
          );
        }
      } else {
        if (Number(group.user_id) !== userId) {
          await pool.query(
            `INSERT INTO notifications
               (recipient_id, actor_id, type, entity_id, message)
             VALUES ($1, $2, 'comment', $3, $4)`,
            [group.user_id, userId, groupId, "commented on your group"],
          );
        }
      }

      return res.status(201).json({
        message: parentComment ? "Reply added" : "Comment added",
        comment: {
          ...result.rows[0],
          likesCount: 0,
          userLiked: false,
        },
      });
    } catch (err) {
      console.error("Add comment error:", err.message);
      return res.status(500).json({ error: "Failed to add comment" });
    }
  },

  // Like or unlike a comment/reply
  toggleCommentLike: async (req, res) => {
    try {
      const commentId = Number(req.params.commentId);
      const userId = Number(req.user.id);

      if (!Number.isInteger(commentId) || commentId <= 0) {
        return res.status(400).json({ error: "Invalid comment ID" });
      }

      const commentResult = await pool.query(
        `SELECT cm.id, cm.user_id, cm.group_id, cg.is_public, cg.user_id AS group_owner_id
         FROM comments cm
         JOIN card_groups cg ON cg.id = cm.group_id
         WHERE cm.id = $1`,
        [commentId],
      );

      if (commentResult.rowCount === 0) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const comment = commentResult.rows[0];

      if (!comment.is_public && Number(comment.group_owner_id) !== userId) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const existingLike = await pool.query(
        `SELECT id
         FROM comment_likes
         WHERE comment_id = $1 AND user_id = $2`,
        [commentId, userId],
      );

      let liked;

      if (existingLike.rowCount > 0) {
        await pool.query(
          `DELETE FROM comment_likes
           WHERE comment_id = $1 AND user_id = $2`,
          [commentId, userId],
        );
        liked = false;
      } else {
        await pool.query(
          `INSERT INTO comment_likes (comment_id, user_id)
           VALUES ($1, $2)
           ON CONFLICT (comment_id, user_id) DO NOTHING`,
          [commentId, userId],
        );
        liked = true;

        // Notify the comment owner, but not when liking your own comment.
        if (Number(comment.user_id) !== userId) {
          await pool.query(
            `INSERT INTO notifications
               (recipient_id, actor_id, type, entity_id, message)
             VALUES ($1, $2, 'like', $3, $4)`,
            [comment.user_id, userId, comment.group_id, "liked your comment"],
          );
        }
      }

      const countResult = await pool.query(
        `SELECT COUNT(*)::INTEGER AS count
         FROM comment_likes
         WHERE comment_id = $1`,
        [commentId],
      );

      return res.json({
        liked,
        likesCount: countResult.rows[0].count,
      });
    } catch (err) {
      console.error("Toggle comment like error:", err.message);
      return res.status(500).json({ error: "Failed to update comment like" });
    }
  },

  // Delete a comment or reply
  deleteComment: async (req, res) => {
    try {
      const commentId = Number(req.params.commentId);
      const userId = Number(req.user.id);

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
