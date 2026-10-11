const pool = require("../db");

// Toggle like for a group
exports.toggleLike = async (req, res) => {
  const userId = req.user.id;
  const groupId = Number(req.params.groupId);

  if (!Number.isInteger(groupId) || groupId <= 0) {
    return res.status(400).json({
      message: "Invalid group ID",
    });
  }

  try {
    // Check that the group exists and is accessible
    const groupResult = await pool.query(
      `SELECT id
       FROM card_groups
       WHERE id = $1
         AND (is_public = TRUE OR user_id = $2)`,
      [groupId, userId],
    );

    if (groupResult.rowCount === 0) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Remove an existing like; otherwise create one
    const result = await pool.query(
      `WITH removed AS (
         DELETE FROM group_likes
         WHERE user_id = $1 AND group_id = $2
         RETURNING id
       ),
       inserted AS (
         INSERT INTO group_likes (user_id, group_id)
         SELECT $1, $2
         WHERE NOT EXISTS (SELECT 1 FROM removed)
         ON CONFLICT (user_id, group_id) DO NOTHING
         RETURNING id
       )
       SELECT EXISTS (
         SELECT 1 FROM inserted
       ) AS liked`,
      [userId, groupId],
    );

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS likes_count
       FROM group_likes
       WHERE group_id = $1`,
      [groupId],
    );

    return res.status(200).json({
      liked: result.rows[0].liked,
      likesCount: countResult.rows[0].likes_count,
    });
  } catch (error) {
    console.error("Toggle like error:", error);

    return res.status(500).json({
      message: "Failed to update like",
    });
  }
};
