const pool = require("../db");

module.exports = {
  // ------------------------------------------
  // Get all PUBLIC groups (Timeline)
  // ------------------------------------------

  getPublicGroups: async (req, res) => {
    try {
      const userId = req.user?.id ?? null;

      const result = await pool.query(
        `
      SELECT
        cg.*,
        u.username,
        c.name AS category_name,

        COUNT(DISTINCT gl.id)::int AS "likesCount",

        COALESCE(
          BOOL_OR(gl.user_id = $1),
          FALSE
        ) AS "userLiked"

      FROM card_groups cg

      JOIN users u
        ON u.id = cg.user_id

      JOIN categories c
        ON c.id = cg.category_id

      LEFT JOIN group_likes gl
        ON gl.group_id = cg.id

      WHERE cg.is_public = TRUE

      GROUP BY cg.id, u.username, c.name

      ORDER BY cg.created_at DESC
      `,
        [userId],
      );

      res.json(result.rows);
    } catch (err) {
      console.error("Failed to load public groups:", err);
      res.status(500).json({
        error: "Failed to load public groups",
      });
    }
  },

  // ------------------------------------------
  // Create a new group
  // ------------------------------------------

  // ------------------------------------------
  // Create a new group (authenticated user only)
  // ------------------------------------------
  createGroup: async (req, res) => {
    try {
      const userId = req.user.id;

      const { title, description, category_id, is_public, image_url } =
        req.body;

      // Validate required fields
      if (typeof title !== "string" || !title.trim() || !category_id) {
        return res.status(400).json({
          error: "title and category_id are required",
        });
      }

      const categoryId = Number(category_id);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({
          error: "Invalid category_id",
        });
      }

      if (is_public !== undefined && typeof is_public !== "boolean") {
        return res.status(400).json({
          error: "is_public must be a boolean",
        });
      }

      const result = await pool.query(
        `INSERT INTO card_groups
          (user_id, title, description, category_id, is_public, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          userId,
          title.trim(),
          typeof description === "string" ? description.trim() || null : null,
          categoryId,
          is_public ?? true,
          typeof image_url === "string" ? image_url.trim() || null : null,
        ],
      );

      return res.status(201).json({
        message: "Group created successfully",
        group: result.rows[0],
      });
    } catch (err) {
      console.error("Create group error:", err.message);

      return res.status(500).json({
        error: "Failed to create group",
      });
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
        [groupId],
      );

      if (group.rowCount === 0) {
        return res.status(404).json({ error: "Group not found" });
      }

      const groupData = group.rows[0];

      if (
        !groupData.is_public &&
        (!req.user || Number(req.user.id) !== Number(groupData.user_id))
      ) {
        return res.status(404).json({
          error: "Group not found",
        });
      }

      // group cards
      const cards = await pool.query(
        `
                SELECT * FROM cards WHERE group_id = $1 ORDER BY created_at ASC
            `,
        [groupId],
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

  // ------------------------------------------
  // Update a group (owner only)
  // ------------------------------------------
  updateGroup: async (req, res) => {
    try {
      const groupId = Number(req.params.groupId);
      const userId = req.user.id;

      if (!Number.isInteger(groupId) || groupId <= 0) {
        return res.status(400).json({ error: "Invalid group ID" });
      }

      const { title, description, category_id, is_public, image_url } =
        req.body;

      if (
        typeof title !== "string" ||
        !title.trim() ||
        !Number.isInteger(Number(category_id)) ||
        Number(category_id) <= 0 ||
        typeof is_public !== "boolean"
      ) {
        return res.status(400).json({
          error: "Valid title, category_id and is_public are required",
        });
      }

      const result = await pool.query(
        `UPDATE card_groups
         SET title = $1,
             description = $2,
             category_id = $3,
             is_public = $4,
             image_url = $5
         WHERE id = $6 AND user_id = $7
         RETURNING *`,
        [
          title.trim(),
          typeof description === "string" ? description.trim() || null : null,
          Number(category_id),
          is_public,
          typeof image_url === "string" ? image_url.trim() || null : null,
          groupId,
          userId,
        ],
      );

      if (result.rowCount === 0) {
        const exists = await pool.query(
          "SELECT id FROM card_groups WHERE id = $1",
          [groupId],
        );

        if (exists.rowCount === 0) {
          return res.status(404).json({ error: "Group not found" });
        }

        return res.status(403).json({
          error: "You are not allowed to update this group",
        });
      }

      return res.json({
        message: "Group updated successfully",
        group: result.rows[0],
      });
    } catch (err) {
      console.error("Update group error:", err.message);
      return res.status(500).json({ error: "Failed to update group" });
    }
  },

  // ------------------------------------------
  // Delete a group
  // ------------------------------------------

  // ------------------------------------------
  // Delete a group (owner only)
  // ------------------------------------------
  deleteGroup: async (req, res) => {
    try {
      const groupId = Number(req.params.groupId);
      const userId = req.user.id;

      if (!Number.isInteger(groupId) || groupId <= 0) {
        return res.status(400).json({ error: "Invalid group ID" });
      }

      const result = await pool.query(
        `DELETE FROM card_groups
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [groupId, userId],
      );

      if (result.rowCount === 0) {
        const exists = await pool.query(
          "SELECT id FROM card_groups WHERE id = $1",
          [groupId],
        );

        if (exists.rowCount === 0) {
          return res.status(404).json({ error: "Group not found" });
        }

        return res.status(403).json({
          error: "You are not allowed to delete this group",
        });
      }

      return res.json({ message: "Group deleted successfully" });
    } catch (err) {
      console.error("Delete group error:", err.message);
      return res.status(500).json({ error: "Failed to delete group" });
    }
  },

  // ------------------------------------------
  // Get groups belonging to the authenticated user
  // ------------------------------------------
  getMyGroups: async (req, res) => {
    try {
      const userId = req.user.id;

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
        [userId],
      );

      return res.json(result.rows);
    } catch (err) {
      console.error("Get my groups error:", err.message);

      return res.status(500).json({
        error: "Failed to load your groups",
      });
    }
  },
};
