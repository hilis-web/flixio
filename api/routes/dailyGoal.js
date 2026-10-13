const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../db");

// Get today's goal and progress
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const goalResult = await pool.query(
      `SELECT target_reviews
       FROM daily_learning_goals
       WHERE user_id = $1`,
      [userId],
    );

    const targetReviews =
      goalResult.rows.length > 0
        ? Number(goalResult.rows[0].target_reviews)
        : 20;

    const progressResult = await pool.query(
      `SELECT COUNT(*)::INTEGER AS completed
       FROM card_review_logs
       WHERE user_id = $1
         AND reviewed_at >= CURRENT_DATE
         AND reviewed_at < CURRENT_DATE + INTERVAL '1 day'`,
      [userId],
    );

    const completed = Number(progressResult.rows[0].completed);

    res.json({
      targetReviews,
      completed,
      remaining: Math.max(0, targetReviews - completed),
      progressPercent: Math.min(
        100,
        Math.round((completed / targetReviews) * 100),
      ),
    });
  } catch (error) {
    console.error("Get daily goal error:", error);
    res.status(500).json({
      message: "Failed to load daily learning goal.",
    });
  }
});

// Update today's daily goal
router.put("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const targetReviews = Number(req.body.targetReviews);

    if (
      !Number.isInteger(targetReviews) ||
      targetReviews < 5 ||
      targetReviews > 200
    ) {
      return res.status(400).json({
        message: "Daily goal must be between 5 and 200 reviews.",
      });
    }

    await pool.query(
      `INSERT INTO daily_learning_goals (user_id, target_reviews)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET
         target_reviews = EXCLUDED.target_reviews,
         updated_at = NOW()`,
      [userId, targetReviews],
    );

    res.json({
      message: "Daily goal updated successfully.",
      targetReviews,
    });
  } catch (error) {
    console.error("Update daily goal error:", error);
    res.status(500).json({
      message: "Failed to update daily learning goal.",
    });
  }
});

module.exports = router;
