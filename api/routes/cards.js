const express = require("express");
const router = express.Router();
const cardsController = require("../controllers/cardsController");

// Get all cards in a group
router.get("/group/:groupId", cardsController.getCardsByGroup);

// Get a card in a group
router.get("/:cardId", cardsController.getCardsByCardId);

// Create card
router.post("/", cardsController.createCard);

// Update card
router.put("/:cardId", cardsController.updateCard);

// Delete card
router.delete("/:cardId", cardsController.deleteCard);

module.exports = router;
