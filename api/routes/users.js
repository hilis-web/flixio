const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// جلب بيانات المستخدم واهتماماته
router.get("/:userId", usersController.getUserProfile);

// تعديل بيانات المستخدم
router.put("/:userId", usersController.updateUserProfile);

// تعديل اهتمامات المستخدم
router.put("/:userId/interests", usersController.updateUserInterests);

module.exports = router;
