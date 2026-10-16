const pool = require("../db");

// Follow a user

const followUser = async (req, res) => {
  const followerId = req.user.id;
  const followingId = Number(req.params.userId);

  if (!Number.isInteger(followingId) || followingId <= 0) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (followerId === followingId) {
    return res.status(400).json({
      message: "You cannot follow yourself",
    });
  }

  try {
    const userResult = await pool.query("SELECT id FROM users WHERE id = $1", [
      followingId,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Insert the follow only if it does not already exist.
    const followResult = await pool.query(
      `INSERT INTO follows (follower_id, following_id)
       VALUES ($1, $2)
       ON CONFLICT (follower_id, following_id) DO NOTHING
       RETURNING id`,
      [followerId, followingId],
    );

    // Create a notification only for a newly created follow.
    if (followResult.rowCount > 0) {
      await pool.query(
        `INSERT INTO notifications
          (recipient_id, actor_id, type, message)
         VALUES ($1, $2, 'follow', $3)`,
        [followingId, followerId, "started following you"],
      );
    }

    return res.status(200).json({
      message: "Follow status updated",
      following: true,
    });
  } catch (error) {
    console.error("followUser error:", error);
    return res.status(500).json({
      message: "Failed to follow user",
    });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  const followerId = req.user.id;
  const followingId = Number(req.params.userId);

  if (!Number.isInteger(followingId) || followingId <= 0) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (followerId === followingId) {
    return res.status(400).json({
      message: "You cannot unfollow yourself",
    });
  }

  try {
    await pool.query(
      `DELETE FROM follows
       WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId],
    );

    return res.status(200).json({
      message: "Unfollowed successfully",
      following: false,
    });
  } catch (error) {
    console.error("unfollowUser error:", error);
    return res.status(500).json({
      message: "Failed to unfollow user",
    });
  }
};

// Check whether the current user follows another user
const getFollowStatus = async (req, res) => {
  const followerId = req.user.id;
  const followingId = Number(req.params.userId);

  if (!Number.isInteger(followingId) || followingId <= 0) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const result = await pool.query(
      `SELECT 1
       FROM follows
       WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId],
    );

    return res.status(200).json({
      following: result.rows.length > 0,
    });
  } catch (error) {
    console.error("getFollowStatus error:", error);
    return res.status(500).json({
      message: "Failed to get follow status",
    });
  }
};

const getFollowers = async (req, res) => {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.username
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC`,
      [userId],
    );

    return res.status(200).json({
      followers: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("getFollowers error:", error);
    return res.status(500).json({
      message: "Failed to get followers",
    });
  }
};

const getFollowing = async (req, res) => {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.username
       FROM follows f
       JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC`,
      [userId],
    );

    return res.status(200).json({
      following: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("getFollowing error:", error);
    return res.status(500).json({
      message: "Failed to get following",
    });
  }
};

const getFollowCounts = async (req, res) => {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }

  try {
    const userResult = await pool.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const result = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int
          FROM follows
          WHERE following_id = $1) AS followers_count,

         (SELECT COUNT(*)::int
          FROM follows
          WHERE follower_id = $1) AS following_count`,
      [userId],
    );

    return res.status(200).json({
      followersCount: result.rows[0].followers_count,
      followingCount: result.rows[0].following_count,
    });
  } catch (error) {
    console.error("getFollowCounts error:", error);

    return res.status(500).json({
      message: "Failed to get follow counts",
    });
  }
};
module.exports = {
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowers,
  getFollowing,
  getFollowCounts,
};
