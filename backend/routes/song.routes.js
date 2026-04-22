const express = require("express");
const router = express.Router();

// Controller
const {
  uploadSong,
  getAllSongs,
  getSongById,
  playSong,
  deleteSong,
  getSongsByGenre,
  searchSongs,
} = require("../controllers/song.controller");

// Middlewares
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");
const { uploadSong: uploadSongFiles } = require("../middleware/upload.middleware");

// ─────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────
router.get("/", getAllSongs);
router.get("/search", searchSongs);
router.get("/genre/:genre", getSongsByGenre);
router.get("/:id", getSongById);

// ─────────────────────────────────────────
// PROTECTED ROUTES
// ─────────────────────────────────────────
router.post("/:id/play", authMiddleware, playSong);

// ─────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  uploadSongFiles,   // ← Cloudinary pe upload
  uploadSong         // ← MongoDB mein save
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteSong
);

module.exports = router;