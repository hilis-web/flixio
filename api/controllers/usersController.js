const pool = require("../db");

// جلب بيانات المستخدم واهتماماته

const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const userRes = await pool.query(
      `SELECT id, username, email
       FROM users
       WHERE id = $1`,
      [userId],
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const interestsRes = await pool.query(
      `SELECT ui.category_id, c.name
       FROM user_interests ui
       JOIN categories c ON ui.category_id = c.id
       WHERE ui.user_id = $1`,
      [userId],
    );

    return res.json({
      user: userRes.rows[0],
      interests: interestsRes.rows,
    });
  } catch (err) {
    console.error("Get user profile error:", err.message);
    return res.status(500).json({
      error: "Failed to load user profile",
    });
  }
};

// تعديل بيانات المستخدم

const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, email } = req.body;

  if (
    typeof username !== "string" ||
    !username.trim() ||
    typeof email !== "string" ||
    !email.trim()
  ) {
    return res.status(400).json({
      error: "Valid username and email are required",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET username = $1, email = $2
       WHERE id = $3
       RETURNING id, username, email, created_at`,
      [username.trim(), email.trim(), userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      message: "User updated",
      user: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Username or email is already in use",
      });
    }

    console.error("Update user profile error:", err.message);
    return res.status(500).json({ error: "Failed to update user" });
  }
};

// تعديل اهتمامات المستخدم

const updateUserInterests = async (req, res) => {
  const userId = req.user.id;
  let { interests } = req.body;

  // Keep the existing behavior: missing interests means an empty list.
  if (interests === undefined || interests === null) {
    interests = [];
  } else if (!Array.isArray(interests)) {
    interests = [interests];
  }

  // Validate category IDs.
  const categoryIds = interests.map(Number);

  if (categoryIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    return res.status(400).json({
      error: "Interests must contain valid category IDs",
    });
  }

  // Remove duplicate category IDs.
  const uniqueCategoryIds = [...new Set(categoryIds)];

  let client;

  try {
    client = await pool.connect();

    // Confirm that every category exists.
    if (uniqueCategoryIds.length > 0) {
      const categoriesResult = await client.query(
        `SELECT id
         FROM categories
         WHERE id = ANY($1::int[])`,
        [uniqueCategoryIds],
      );

      if (categoriesResult.rowCount !== uniqueCategoryIds.length) {
        return res.status(400).json({
          error: "One or more categories do not exist",
        });
      }
    }

    // Use a transaction so the update is all-or-nothing.
    await client.query("BEGIN");

    await client.query("DELETE FROM user_interests WHERE user_id = $1", [
      userId,
    ]);

    for (const categoryId of uniqueCategoryIds) {
      await client.query(
        `INSERT INTO user_interests (user_id, category_id)
         VALUES ($1, $2)`,
        [userId, categoryId],
      );
    }

    await client.query("COMMIT");

    return res.json({
      message: "Interests updated successfully",
      interests: uniqueCategoryIds,
    });
  } catch (err) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Interests rollback error:", rollbackError.message);
      }
    }

    console.error("Update user interests error:", err.message);

    return res.status(500).json({
      error: "Failed to update interests",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = { getUserProfile, updateUserProfile, updateUserInterests };
