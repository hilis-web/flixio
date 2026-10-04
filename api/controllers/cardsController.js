const pool = require("../db");

module.exports = {
  // ------------------------
  // Get all cards in a group
  // ------------------------
  getCardsByGroup: async (req, res) => {
    try {
      const { groupId } = req.params;
      const result = await pool.query(
        `SELECT * FROM cards WHERE group_id = $1 ORDER BY created_at ASC`,
        [groupId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  },

  // ------------------------
  // Get all cards in a group
  // ------------------------
  getCardsByCardId: async (req, res) => {
    try {
      console.log(req.params);
      const { cardId } = req.params;
      const result = await pool.query(
        `SELECT * FROM cards WHERE id = $1 ORDER BY created_at ASC`,
        [cardId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  },

  // ------------------------
  // Create a new card
  // ------------------------
  createCard: async (req, res) => {
    try {
      const { group_id, front_text, back_text } = req.body;

      if (!group_id || !front_text || !back_text) {
        return res
          .status(400)
          .json({ error: "group_id, front_text and back_text are required" });
      }

      const result = await pool.query(
        `INSERT INTO cards (group_id, front_text, back_text) VALUES ($1, $2, $3) RETURNING *`,
        [group_id, front_text, back_text]
      );

      res.json({
        message: "Card created successfully",
        card: result.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create card" });
    }
  },

  // ------------------------
  // Update card
  // ------------------------
  updateCard: async (req, res) => {
    try {
      const { cardId } = req.params;
      const { front_text, back_text } = req.body;

      const result = await pool.query(
        `UPDATE cards SET front_text = $1, back_text = $2 WHERE id = $3 RETURNING *`,
        [front_text, back_text, cardId]
      );

      res.json({
        message: "Card updated successfully",
        card: result.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update card" });
    }
  },

  // ------------------------
  // Delete card
  // ------------------------
  deleteCard: async (req, res) => {
    try {
      const { cardId } = req.params;

      await pool.query(`DELETE FROM cards WHERE id = $1`, [cardId]);

      res.json({ message: "Card deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete card" });
    }
  },
};
