const pool = require("../db");

module.exports = {
  // ------------------------
  // Get all cards in a group
  // ------------------------

  getCardsByGroup: async (req, res) => {
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
        `SELECT *
       FROM cards
       WHERE group_id = $1
       ORDER BY created_at ASC`,
        [groupId],
      );

      return res.json(result.rows);
    } catch (err) {
      console.error("Get cards by group error:", err.message);
      return res.status(500).json({ error: "Failed to fetch cards" });
    }
  },

  // ------------------------
  // Get all cards in a group
  // ------------------------

  getCardsByCardId: async (req, res) => {
    try {
      const cardId = Number(req.params.cardId);

      if (!Number.isInteger(cardId) || cardId <= 0) {
        return res.status(400).json({ error: "Invalid card ID" });
      }

      const result = await pool.query(
        `SELECT
         cards.*,
         card_groups.user_id AS group_owner_id,
         card_groups.is_public
       FROM cards
       JOIN card_groups ON card_groups.id = cards.group_id
       WHERE cards.id = $1`,
        [cardId],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Card not found" });
      }

      const card = result.rows[0];

      if (
        !card.is_public &&
        (!req.user || Number(req.user.id) !== Number(card.group_owner_id))
      ) {
        return res.status(404).json({ error: "Card not found" });
      }

      // Do not expose internal authorization fields in the response.
      const { group_owner_id, is_public, ...cardData } = card;

      return res.json(cardData);
    } catch (err) {
      console.error("Get card by ID error:", err.message);
      return res.status(500).json({ error: "Failed to fetch card" });
    }
  },

  // ------------------------
  // Create a new card
  // ------------------------

  createCard: async (req, res) => {
    try {
      const userId = req.user.id;
      const groupId = Number(req.body.group_id);
      const { front_text, back_text } = req.body;

      if (!Number.isInteger(groupId) || groupId <= 0) {
        return res.status(400).json({ error: "Invalid group_id" });
      }

      if (
        typeof front_text !== "string" ||
        !front_text.trim() ||
        typeof back_text !== "string" ||
        !back_text.trim()
      ) {
        return res.status(400).json({
          error: "front_text and back_text are required",
        });
      }

      // Verify that the authenticated user owns the group.
      const groupResult = await pool.query(
        `SELECT id
       FROM card_groups
       WHERE id = $1 AND user_id = $2`,
        [groupId, userId],
      );

      if (groupResult.rowCount === 0) {
        const existingGroup = await pool.query(
          `SELECT id FROM card_groups WHERE id = $1`,
          [groupId],
        );

        if (existingGroup.rowCount === 0) {
          return res.status(404).json({ error: "Group not found" });
        }

        return res.status(403).json({
          error: "You are not allowed to add cards to this group",
        });
      }

      const result = await pool.query(
        `INSERT INTO cards (group_id, front_text, back_text)
       VALUES ($1, $2, $3)
       RETURNING *`,
        [groupId, front_text.trim(), back_text.trim()],
      );

      return res.status(201).json({
        message: "Card created successfully",
        card: result.rows[0],
      });
    } catch (err) {
      console.error("Create card error:", err.message);
      return res.status(500).json({ error: "Failed to create card" });
    }
  },

  // ------------------------
  // Update card
  // ------------------------

  updateCard: async (req, res) => {
    try {
      const cardId = Number(req.params.cardId);
      const userId = req.user.id;
      const { front_text, back_text } = req.body;

      if (!Number.isInteger(cardId) || cardId <= 0) {
        return res.status(400).json({ error: "Invalid card ID" });
      }

      if (
        typeof front_text !== "string" ||
        !front_text.trim() ||
        typeof back_text !== "string" ||
        !back_text.trim()
      ) {
        return res.status(400).json({
          error: "front_text and back_text are required",
        });
      }

      const result = await pool.query(
        `UPDATE cards
       SET front_text = $1,
           back_text = $2
       WHERE id = $3
         AND group_id IN (
           SELECT id
           FROM card_groups
           WHERE user_id = $4
         )
       RETURNING *`,
        [front_text.trim(), back_text.trim(), cardId, userId],
      );

      if (result.rowCount === 0) {
        const existingCard = await pool.query(
          `SELECT id FROM cards WHERE id = $1`,
          [cardId],
        );

        if (existingCard.rowCount === 0) {
          return res.status(404).json({ error: "Card not found" });
        }

        return res.status(403).json({
          error: "You are not allowed to update this card",
        });
      }

      return res.json({
        message: "Card updated successfully",
        card: result.rows[0],
      });
    } catch (err) {
      console.error("Update card error:", err.message);
      return res.status(500).json({ error: "Failed to update card" });
    }
  },

  // ------------------------
  // Delete card
  // ------------------------

  deleteCard: async (req, res) => {
    try {
      const cardId = Number(req.params.cardId);
      const userId = req.user.id;

      if (!Number.isInteger(cardId) || cardId <= 0) {
        return res.status(400).json({ error: "Invalid card ID" });
      }

      const result = await pool.query(
        `DELETE FROM cards
       WHERE id = $1
         AND group_id IN (
           SELECT id
           FROM card_groups
           WHERE user_id = $2
         )
       RETURNING id`,
        [cardId, userId],
      );

      if (result.rowCount === 0) {
        const existingCard = await pool.query(
          `SELECT id FROM cards WHERE id = $1`,
          [cardId],
        );

        if (existingCard.rowCount === 0) {
          return res.status(404).json({ error: "Card not found" });
        }

        return res.status(403).json({
          error: "You are not allowed to delete this card",
        });
      }

      return res.json({ message: "Card deleted successfully" });
    } catch (err) {
      console.error("Delete card error:", err.message);
      return res.status(500).json({ error: "Failed to delete card" });
    }
  },
};
