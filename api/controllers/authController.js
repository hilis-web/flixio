const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  // ----------------------
  //   User Registration
  // ----------------------
  signup: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash) 
                 VALUES ($1, $2, $3) RETURNING id, username, email`,
        [username, email, hashedPassword]
      );

      res.json({
        message: "User created successfully",
        user: result.rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Signup failed", details: err });
    }
  },

  // ----------------------
  //   User Login
  // ----------------------
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email & password required" });
      }

      // Check user
      const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [
        email,
      ]);

      if (user.rowCount === 0) {
        return res.status(400).json({ error: "User not found" });
      }

      const valid = await bcrypt.compare(password, user.rows[0].password_hash);

      if (!valid) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      // Create token
      const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
      });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.rows[0].id,
          username: user.rows[0].username,
          email: user.rows[0].email,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed", details: err });
    }
  },
};
