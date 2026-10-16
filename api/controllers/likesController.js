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
    // Get the group owner and check accessibility
    const groupResult = await pool.query(
      `SELECT id, user_id
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

    const groupOwnerId = groupResult.rows[0].user_id;

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

    const liked = result.rows[0].liked;

    // Notify the owner only when a new like is created.
    // Do not notify users about likes on their own groups.
    if (liked && Number(groupOwnerId) !== Number(userId)) {
      await pool.query(
        `INSERT INTO notifications
          (recipient_id, actor_id, type, entity_id, message)
         VALUES ($1, $2, 'like', $3, $4)`,
        [groupOwnerId, userId, groupId, "liked your group"],
      );
    }

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS likes_count
       FROM group_likes
       WHERE group_id = $1`,
      [groupId],
    );

    return res.status(200).json({
      liked,
      likesCount: countResult.rows[0].likes_count,
    });
  } catch (error) {
    console.error("Toggle like error:", error);

    return res.status(500).json({
      message: "Failed to update like",
    });
  }
};
