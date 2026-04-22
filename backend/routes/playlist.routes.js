const express = require("express");
const router = express.Router();

// Controller
const {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  updatePlaylist,
  deletePlaylist,
} = require("../controllers/playlist.controller");

// Middlewares
const { authMiddleware } = require("../middleware/auth.middleware");
const { uploadPlaylistCover } = require("../middleware/upload.middleware");

// ─────────────────────────────────────────
// PROTECTED ROUTES — Sabko token chahiye
// ─────────────────────────────────────────

// Playlist CRUD
router.post(
  "/",
  authMiddleware,
  uploadPlaylistCover, // ← Cover image optional
  createPlaylist
);

router.get("/", authMiddleware, getUserPlaylists);
router.get("/:id", authMiddleware, getPlaylistById);

router.put(
  "/:id",
  authMiddleware,
  uploadPlaylistCover, // ← Cover update optional
  updatePlaylist
);

router.delete("/:id", authMiddleware, deletePlaylist);

// Songs add/remove
router.post("/:id/songs", authMiddleware, addSongToPlaylist);
router.delete("/:id/songs", authMiddleware, removeSongFromPlaylist);

module.exports = router;