const pool = require("../db");

module.exports = {
  // ------------------------------------------
  // Get all PUBLIC groups (Timeline)
  // ------------------------------------------
  getPublicGroups: async (req, res) => {
    try {
      const result = await pool.query(`
                SELECT 
                    cg.*, 
                    u.username,
                    c.name AS category_name
                FROM card_groups cg
                JOIN users u ON u.id = cg.user_id
                JOIN categories c ON c.id = cg.category_id
                WHERE cg.is_public = TRUE
                ORDER BY cg.created_at DESC
            `);

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load public groups" });
    }
  },

  // ------------------------------------------
  // Create a new group
  // ------------------------------------------
  createGroup: async (req, res) => {
    try {
      const { user_id, title, description, category_id, is_public, image_url } =
        req.body;

      if (!user_id || !title || !category_id) {
        return res
          .status(400)
          .json({ error: "title and category_id are required" });
      }

      const result = await pool.query(
        `INSERT INTO card_groups (user_id, title, description, category_id, is_public, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
        [
          user_id,
          title,
          description || null,
          category_id,
          is_public ?? true,
          image_url || null,
        ]
      );

      res.json({
        message: "Group created successfully",
        group: result.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create group" });
    }
  },

  // ------------------------------------------
  // Get groups belonging to a user
  // ------------------------------------------
  getUserGroups: async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await pool.query(
        `
                SELECT 
                    cg.*,
                    c.name AS category_name
                FROM card_groups cg
                JOIN categories c ON cg.category_id = c.id
                WHERE cg.user_id = $1
                ORDER BY cg.created_at DESC
            `,
        [userId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load user groups" });
    }
  },

  // ------------------------------------------
  // Get a single group with its cards
  // ------------------------------------------
  getGroupWithCards: async (req, res) => {
    try {
      const { groupId } = req.params;

      // group info
      const group = await pool.query(
        `
                SELECT 
                    cg.*, 
                    u.username,
                    c.name AS category_name
                FROM card_groups cg
                JOIN users u ON u.id = cg.user_id
                JOIN categories c ON c.id = cg.category_id
                WHERE cg.id = $1
            `,
        [groupId]
      );

      if (group.rowCount === 0) {
        return res.status(404).json({ error: "Group not found" });
      }

      // group cards
      const cards = await pool.query(
        `
                SELECT * FROM cards WHERE group_id = $1 ORDER BY created_at ASC
            `,
        [groupId]
      );

      res.json({
        group: group.rows[0],
        cards: cards.rows,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load group details" });
    }
  },

  // ------------------------------------------
  // Update a group
  // ------------------------------------------
  updateGroup: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, category_id, is_public, image_url } =
        req.body;

      const result = await pool.query(
        `UPDATE card_groups 
       SET title=$1, description=$2, category_id=$3, is_public=$4, image_url=$5
       WHERE id=$6 RETURNING *`,
        [title, description, category_id, is_public, image_url, id]
      );

      res.json({ message: "Group updated", group: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update group" });
    }
  },

  // ------------------------------------------
  // Delete a group
  // ------------------------------------------
  deleteGroup: async (req, res) => {
    try {
      const { groupId } = req.params;

      await pool.query(`DELETE FROM card_groups WHERE id = $1`, [groupId]);

      res.json({ message: "Group deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete group" });
    }
  },
};
