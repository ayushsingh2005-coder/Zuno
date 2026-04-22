const express = require("express");
const router = express.Router();

// Controller
const {
  getProfile,
  updateProfile,
  updateProfilePic,
  changePassword,
} = require("../controllers/user.controller");

// Middlewares
const { authMiddleware } = require("../middleware/auth.middleware");
const { uploadProfilePic } = require("../middleware/upload.middleware");

// ─────────────────────────────────────────
// PROTECTED ROUTES — Sabko token chahiye
// ─────────────────────────────────────────

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/profile/picture", authMiddleware, uploadProfilePic, updateProfilePic);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;