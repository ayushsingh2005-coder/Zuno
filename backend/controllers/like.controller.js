const likeService = require("../services/like.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─────────────────────────────────────────
// LIKE / UNLIKE TOGGLE
// ─────────────────────────────────────────
module.exports.toggleLike = async (req, res) => {
  try {
    const songId = req.params.id;  // URL se song ID
    const userId = req.user._id;   // Auth middleware se

    // Pehle check karo — already liked hai?
    const alreadyLiked = await likeService.isLikedByUser(userId, songId);

    if (alreadyLiked) {
      // Unlike karo
      await likeService.unlikeSong(userId, songId);
      return successResponse(res, "Song unliked", { liked: false });
    } else {
      // Like karo
      await likeService.likeSong(userId, songId);
      return successResponse(res, "Song liked", { liked: true });
    }
  } catch (error) {
    console.error("Toggle like error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// GET USER LIKED SONGS
// ─────────────────────────────────────────
module.exports.getUserLikedSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await likeService.getUserLikedSongs(
      req.user._id,
      page,
      limit
    );

    return successResponse(res, "Liked songs fetched", result);
  } catch (error) {
    console.error("Get liked songs error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// GET SONG LIKES COUNT
// ─────────────────────────────────────────
module.exports.getSongLikesCount = async (req, res) => {
  try {
    const songId = req.params.id;

    const count = await likeService.getSongLikesCount(songId);

    // User ne like kiya hai?
    const isLiked = await likeService.isLikedByUser(req.user._id, songId);

    return successResponse(res, "Likes count fetched", {
      songId,
      count,
      isLiked,
    });
  } catch (error) {
    console.error("Get likes count error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};