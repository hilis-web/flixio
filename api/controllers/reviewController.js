const pool = require("../db");

// Allowed review ratings
const ALLOWED_RATINGS = ["again", "hard", "good", "easy"];

// Check whether the user can access a group's cards
async function checkGroupAccess(groupId, userId) {
  const result = await pool.query(
    `SELECT id, user_id, is_public
     FROM card_groups
     WHERE id = $1`,
    [groupId],
  );

  if (result.rows.length === 0) {
    return false;
  }

  const group = result.rows[0];

  const isOwner = Number(group.user_id) === Number(userId);
  const isPublic = group.is_public === true;

  return isPublic || isOwner;
}

// GET /api/reviews/group/:groupId
// Return new cards and cards that are due for review
exports.getDueCardsByGroup = async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const userId = req.user.id;

    if (!Number.isInteger(groupId) || groupId <= 0) {
      return res.status(400).json({
        message: "Invalid group ID.",
      });
    }

    const canAccess = await checkGroupAccess(groupId, userId);

    if (!canAccess) {
      return res.status(404).json({
        message: "Group not found or access denied.",
      });
    }

    const result = await pool.query(
      `SELECT
          c.id,
          c.group_id,
          c.front_text,
          c.back_text,
          c.created_at,
          CASE
            WHEN rp.card_id IS NULL THEN TRUE
            ELSE FALSE
          END AS is_new,
          COALESCE(rp.repetitions, 0) AS repetitions,
          COALESCE(rp.interval_days, 0) AS interval_days,
          COALESCE(rp.ease_factor, 2.50) AS ease_factor,
          rp.due_at,
          rp.last_reviewed_at,
          rp.last_rating
       FROM cards c
       LEFT JOIN card_review_progress rp
         ON rp.card_id = c.id
        AND rp.user_id = $2
       WHERE c.group_id = $1
         AND (
           rp.card_id IS NULL
           OR rp.due_at <= NOW()
         )
       ORDER BY
         CASE WHEN rp.card_id IS NULL THEN 0 ELSE 1 END,
         rp.due_at ASC NULLS FIRST,
         c.created_at ASC`,
      [groupId, userId],
    );

    return res.json({
      groupId,
      totalDue: result.rows.length,
      cards: result.rows,
    });
  } catch (error) {
    console.error("Get due cards error:", error);

    return res.status(500).json({
      message: "Failed to get cards for review.",
    });
  }
};

// Calculate the next review schedule
function calculateSchedule(rating, previousProgress) {
  const previousRepetitions = Number(previousProgress?.repetitions ?? 0);

  const previousInterval = Number(previousProgress?.interval_days ?? 0);

  const previousEase = Number(previousProgress?.ease_factor ?? 2.5);

  let repetitions;
  let intervalDays;
  let easeFactor = previousEase;
  const dueAt = new Date();

  switch (rating) {
    case "again":
      // Show the card again in 10 minutes
      repetitions = 0;
      intervalDays = 0;
      easeFactor = Math.max(1.3, previousEase - 0.2);
      dueAt.setMinutes(dueAt.getMinutes() + 10);
      break;

    case "hard":
      repetitions = previousRepetitions + 1;
      intervalDays =
        previousRepetitions === 0
          ? 1
          : Math.max(1, Math.round(previousInterval * 1.2));

      easeFactor = Math.max(1.3, previousEase - 0.15);
      dueAt.setDate(dueAt.getDate() + intervalDays);
      break;

    case "good":
      repetitions = previousRepetitions + 1;

      if (previousRepetitions === 0) {
        intervalDays = 1;
      } else if (previousRepetitions === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.max(1, Math.round(previousInterval * previousEase));
      }

      dueAt.setDate(dueAt.getDate() + intervalDays);
      break;

    case "easy":
      repetitions = previousRepetitions + 1;

      if (previousRepetitions === 0) {
        intervalDays = 4;
      } else {
        intervalDays = Math.max(
          1,
          Math.round(previousInterval * (previousEase + 0.3)),
        );
      }

      easeFactor = Math.min(3.0, previousEase + 0.15);
      dueAt.setDate(dueAt.getDate() + intervalDays);
      break;
  }

  return {
    repetitions,
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(2)),
    dueAt,
  };
}

// POST /api/reviews/:cardId
// Save progress and record the review in one transaction
exports.saveReview = async (req, res) => {
  let client;

  try {
    const cardId = Number(req.params.cardId);
    const userId = req.user.id;

    const rating =
      typeof req.body.rating === "string" ? req.body.rating.toLowerCase() : "";

    if (!Number.isInteger(cardId) || cardId <= 0) {
      return res.status(400).json({
        message: "Invalid card ID.",
      });
    }

    if (!ALLOWED_RATINGS.includes(rating)) {
      return res.status(400).json({
        message: "Rating must be again, hard, good, or easy.",
      });
    }

    // Confirm that the card exists and get its group
    const cardResult = await pool.query(
      `SELECT id, group_id
       FROM cards
       WHERE id = $1`,
      [cardId],
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        message: "Card not found.",
      });
    }

    const card = cardResult.rows[0];

    // Respect public/private group access rules
    const canAccess = await checkGroupAccess(card.group_id, userId);

    if (!canAccess) {
      return res.status(404).json({
        message: "Card not found or access denied.",
      });
    }

    // Start a transaction
    client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get this user's previous review progress
      const previousResult = await client.query(
        `SELECT repetitions, interval_days, ease_factor
         FROM card_review_progress
         WHERE user_id = $1 AND card_id = $2
         FOR UPDATE`,
        [userId, cardId],
      );

      const previousProgress = previousResult.rows[0] || null;

      const schedule = calculateSchedule(rating, previousProgress);

      // Insert or update the current review progress
      const savedResult = await client.query(
        `INSERT INTO card_review_progress (
            user_id,
            card_id,
            repetitions,
            interval_days,
            ease_factor,
            due_at,
            last_reviewed_at,
            last_rating,
            updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, NOW())
         ON CONFLICT (user_id, card_id)
         DO UPDATE SET
            repetitions = EXCLUDED.repetitions,
            interval_days = EXCLUDED.interval_days,
            ease_factor = EXCLUDED.ease_factor,
            due_at = EXCLUDED.due_at,
            last_reviewed_at = NOW(),
            last_rating = EXCLUDED.last_rating,
            updated_at = NOW()
         RETURNING
            card_id,
            repetitions,
            interval_days,
            ease_factor,
            due_at,
            last_reviewed_at,
            last_rating`,
        [
          userId,
          cardId,
          schedule.repetitions,
          schedule.intervalDays,
          schedule.easeFactor,
          schedule.dueAt,
          rating,
        ],
      );

      // Record every review for future statistics
      await client.query(
        `INSERT INTO card_review_logs (
            user_id,
            card_id,
            rating,
            reviewed_at
         )
         VALUES ($1, $2, $3, NOW())`,
        [userId, cardId, rating],
      );

      // Both operations must succeed
      await client.query("COMMIT");

      return res.json({
        message: "Review saved successfully.",
        progress: savedResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Save review error:", error);

    return res.status(500).json({
      message: "Failed to save review.",
    });
  }
};

/**
 * GET /api/reviews/stats
 * Get review statistics for the logged-in user
 */
exports.getReviewStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Overall review statistics
    const summaryResult = await pool.query(
      `SELECT
          COUNT(*)::INTEGER AS total_reviews,
          COUNT(DISTINCT card_id)::INTEGER AS unique_cards_reviewed,
          COUNT(*) FILTER (
            WHERE rating IN ('good', 'easy')
          )::INTEGER AS successful_reviews,
          COUNT(*) FILTER (
            WHERE rating IN ('again', 'hard')
          )::INTEGER AS difficult_reviews
       FROM card_review_logs
       WHERE user_id = $1`,
      [userId],
    );

    const summary = summaryResult.rows[0];

    const totalReviews = Number(summary.total_reviews);
    const successfulReviews = Number(summary.successful_reviews);

    const accuracyPercent =
      totalReviews > 0
        ? Number(((successfulReviews / totalReviews) * 100).toFixed(1))
        : 0;

    // Rating distribution
    const ratingsResult = await pool.query(
      `SELECT
          rating,
          COUNT(*)::INTEGER AS count
       FROM card_review_logs
       WHERE user_id = $1
       GROUP BY rating`,
      [userId],
    );

    const ratingCounts = {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    };

    for (const row of ratingsResult.rows) {
      ratingCounts[row.rating] = Number(row.count);
    }

    // Activity for the last 7 calendar days, including days with zero reviews
    const activityResult = await pool.query(
      `SELECT
          TO_CHAR(days.day, 'YYYY-MM-DD') AS date,
          COUNT(log.id)::INTEGER AS reviews
       FROM GENERATE_SERIES(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
       ) AS days(day)
       LEFT JOIN card_review_logs log
         ON log.user_id = $1
        AND log.reviewed_at >= days.day
        AND log.reviewed_at < days.day + INTERVAL '1 day'
       GROUP BY days.day
       ORDER BY days.day ASC`,
      [userId],
    );

    return res.json({
      summary: {
        totalReviews,
        uniqueCardsReviewed: Number(summary.unique_cards_reviewed),
        successfulReviews,
        difficultReviews: Number(summary.difficult_reviews),
        accuracyPercent,
      },
      ratingCounts,
      dailyActivity: activityResult.rows.map((row) => ({
        date: row.date,
        reviews: Number(row.reviews),
      })),
    });
  } catch (error) {
    console.error("Get review statistics error:", error);

    return res.status(500).json({
      message: "Failed to load review statistics.",
    });
  }
};

/**
 * GET /api/reviews/streak
 * Get the user's current streak, longest streak,
 * and active days during the last 7 days.
 */
exports.getLearningStreak = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `WITH review_days AS (
         SELECT DISTINCT
           (reviewed_at AT TIME ZONE 'Europe/Madrid')::DATE AS review_date
         FROM card_review_logs
         WHERE user_id = $1
       ),
       numbered_days AS (
         SELECT
           review_date,
           review_date -
             (ROW_NUMBER() OVER (ORDER BY review_date)::INTEGER)
             AS streak_group
         FROM review_days
       ),
       streaks AS (
         SELECT
           MIN(review_date) AS start_date,
           MAX(review_date) AS end_date,
           COUNT(*)::INTEGER AS streak_length
         FROM numbered_days
         GROUP BY streak_group
       ),
       activity AS (
         SELECT
           COUNT(DISTINCT review_date)::INTEGER AS active_days
         FROM review_days
         WHERE review_date >=
             (NOW() AT TIME ZONE 'Europe/Madrid')::DATE - 6
           AND review_date <=
             (NOW() AT TIME ZONE 'Europe/Madrid')::DATE
       )
       SELECT
         COALESCE(
           (
             SELECT streak_length
             FROM streaks
             WHERE end_date =
               CASE
                 WHEN EXISTS (
                   SELECT 1
                   FROM review_days
                   WHERE review_date =
                     (NOW() AT TIME ZONE 'Europe/Madrid')::DATE
                 )
                 THEN (NOW() AT TIME ZONE 'Europe/Madrid')::DATE
                 ELSE (NOW() AT TIME ZONE 'Europe/Madrid')::DATE - 1
               END
           ),
           0
         )::INTEGER AS current_streak,
         COALESCE(
           (SELECT MAX(streak_length) FROM streaks),
           0
         )::INTEGER AS longest_streak,
         (SELECT active_days FROM activity) AS active_days`,
      [userId],
    );

    const row = result.rows[0];

    return res.json({
      currentStreak: Number(row.current_streak),
      longestStreak: Number(row.longest_streak),
      activeDays: Number(row.active_days),
    });
  } catch (error) {
    console.error("Get learning streak error:", error);

    return res.status(500).json({
      message: "Failed to load learning streak.",
    });
  }
};
