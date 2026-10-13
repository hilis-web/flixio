const express = require("express");
const router = express.Router();

const cardsController = require("../controllers/cardsController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

// Get cards in a group
// Public groups are available to everyone; private groups require ownership.
router.get(
  "/group/:groupId",
  optionalAuthMiddleware,
  cardsController.getCardsByGroup,
);

// Create multiple cards in one transaction
router.post("/bulk", authMiddleware, cardsController.createBulkCards);

// Get a single card
router.get(
  "/:cardId",
  optionalAuthMiddleware,
  cardsController.getCardsByCardId,
);

// Create a card — authenticated user only
router.post("/", authMiddleware, cardsController.createCard);

// Update a card — authenticated user only
router.put("/:cardId", authMiddleware, cardsController.updateCard);

// Delete a card — authenticated user only
router.delete("/:cardId", authMiddleware, cardsController.deleteCard);

module.exports = router;
