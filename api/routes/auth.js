const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Sign up
router.post("/signup", authController.signup);

// Login
router.post("/login", authController.login);

module.exports = router;
