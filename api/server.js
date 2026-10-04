const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;
const pool = require("./db");
// const usersRoutes = require("./routes/users");

// app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.1.36:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());
app.use("/auth", require("./routes/auth"));
app.use("/categories", require("./routes/categories"));
app.use("/groups", require("./routes/groups"));
app.use("/cards", require("./routes/cards"));
app.use("/comments", require("./routes/comments"));
app.use("/saved-groups", require("./routes/savedGroups"));
app.use("/api/interests", require("./routes/interests"));
// app.use("/api/users", usersRoutes);
app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected!", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
