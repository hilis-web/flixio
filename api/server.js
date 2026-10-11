const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authMiddleware = require("./middleware/authMiddleware");
const app = express();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const pool = require("./db");

// -----------------------------
// CORS
// -----------------------------

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.1.33:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// -----------------------------
// Middleware
// -----------------------------
app.use(express.json());

// -----------------------------
// Routes
// -----------------------------
app.use("/auth", require("./routes/auth"));
app.use("/categories", require("./routes/categories"));
app.use("/groups", require("./routes/groups"));
app.use("/cards", require("./routes/cards"));
app.use("/comments", require("./routes/comments"));
app.use("/saved-groups", require("./routes/savedGroups"));
app.use("/api/interests", require("./routes/interests"));
app.use("/api/users", require("./routes/users"));

// -----------------------------
// Test routes
// -----------------------------
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected!",
      time: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Database connection failed",
    });
  }
});

app.get("/test-auth", authMiddleware, (req, res) => {
  res.json({
    message: "Authentication successful",
    user: req.user,
  });
});
// -----------------------------
// Start server
// -----------------------------
app.listen(PORT, HOST, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
});
