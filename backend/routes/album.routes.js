const express = require("express");
const router = express.Router();

// Controller
const {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  addSongToAlbum,
  removeSongFromAlbum,
  deleteAlbum,
  searchAlbums,
} = require("../controllers/album.controller");

// Middlewares
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");
const { uploadThumbnail } = require("../middleware/upload.middleware");

// ─────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────
router.get("/", getAllAlbums);
router.get("/search", searchAlbums);
router.get("/:id", getAlbumById);

// ─────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  uploadThumbnail,   // ← Cover image Cloudinary pe
  createAlbum        // ← MongoDB mein save
);

router.post(
  "/:id/songs",
  authMiddleware,
  roleMiddleware("admin"),
  addSongToAlbum
);

router.delete(
  "/:id/songs",
  authMiddleware,
  roleMiddleware("admin"),
  removeSongFromAlbum
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteAlbum
);

module.exports = router;