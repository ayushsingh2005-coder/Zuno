const express = require("express");
const router = express.Router();

// Controller
const {
  toggleLike,
  getUserLikedSongs,
  getSongLikesCount,
} = require("../controllers/like.controller");

// Middleware
const { authMiddleware } = require("../middleware/auth.middleware");

// ─────────────────────────────────────────
// PROTECTED ROUTES — Sabko token chahiye
// ─────────────────────────────────────────

router.post("/:id", authMiddleware, toggleLike);           // Like/Unlike
router.get("/", authMiddleware, getUserLikedSongs);        // Liked songs
router.get("/:id/count", authMiddleware, getSongLikesCount); // Likes count

module.exports = router;