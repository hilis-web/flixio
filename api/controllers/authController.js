const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  // ----------------------
  // User Registration
  // ----------------------
  signup: async (req, res) => {
    try {
      const { username, email, password } = req.body || {};

      // Validate required fields
      if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          error: "Username, email and password are required",
        });
      }

      const cleanUsername = username.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanUsername || !cleanEmail || !password) {
        return res.status(400).json({
          error: "All fields are required",
        });
      }

      if (cleanUsername.length < 2 || cleanUsername.length > 30) {
        return res.status(400).json({
          error: "Username must be between 2 and 30 characters",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (cleanEmail.length > 254 || !emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          error: "Please provide a valid email address",
        });
      }

      if (password.length < 8 || password.length > 128) {
        return res.status(400).json({
          error: "Password must be between 8 and 128 characters",
        });
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email`,
        [cleanUsername, cleanEmail, hashedPassword],
      );

      return res.status(201).json({
        message: "User created successfully",
        user: result.rows[0],
      });
    } catch (err) {
      // PostgreSQL unique constraint violation
      if (err.code === "23505") {
        return res.status(409).json({
          error: "Username or email is already in use",
        });
      }

      console.error("Signup error:", err.message);

      return res.status(500).json({
        error: "Signup failed. Please try again later.",
      });
    }
  },

  // ----------------------
  // User Login
  // ----------------------
  login: async (req, res) => {
    try {
      const { email, password } = req.body || {};

      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
      ) {
        return res.status(400).json({
          error: "Email and password are required",
        });
      }

      const cleanEmail = email.trim().toLowerCase();

      if (cleanEmail.length > 254) {
        return res.status(400).json({
          error: "Invalid email or password",
        });
      }

      // Check user
      const result = await pool.query(
        `SELECT id, username, email, password_hash
         FROM users
         WHERE email = $1`,
        [cleanEmail],
      );

      // Use the same message for an unknown email or wrong password
      if (result.rowCount === 0) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      const dbUser = result.rows[0];

      const validPassword = await bcrypt.compare(
        password,
        dbUser.password_hash,
      );

      if (!validPassword) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // Ensure JWT secret is configured
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured");

        return res.status(500).json({
          error: "Authentication service is not configured",
        });
      }

      const token = jwt.sign({ id: dbUser.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || "7d",
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: dbUser.id,
          username: dbUser.username,
          email: dbUser.email,
        },
      });
    } catch (err) {
      console.error("Login error:", err.message);

      return res.status(500).json({
        error: "Login failed. Please try again later.",
      });
    }
  },
};
