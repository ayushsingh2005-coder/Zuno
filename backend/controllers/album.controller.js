const albumService = require("../services/album.service");
const { cloudinary } = require("../config/cloudinary");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─────────────────────────────────────────
// CREATE ALBUM — Admin only
// ─────────────────────────────────────────
module.exports.createAlbum = async (req, res) => {
  try {
    const { title, artist, releaseDate } = req.body;

    if (!title || !artist) {
      // Cover image upload hua tha toh delete karo
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return errorResponse(res, "Title and artist are required", 400);
    }

    const album = await albumService.createAlbum({
      title,
      artist,
      releaseDate: releaseDate || Date.now(),
      coverImage: req.file
        ? { url: req.file.path, public_id: req.file.filename }
        : { url: "", public_id: "" },
      uploadedBy: req.user._id,
    });

    return successResponse(res, "Album created successfully", { album }, 201);
  } catch (error) {
    console.error("Create album error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// GET ALL ALBUMS — pagination
// ─────────────────────────────────────────
module.exports.getAllAlbums = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await albumService.getAllAlbums(page, limit);

    return successResponse(res, "Albums fetched successfully", result);
  } catch (error) {
    console.error("Get albums error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// GET ALBUM BY ID
// ─────────────────────────────────────────
module.exports.getAlbumById = async (req, res) => {
  try {
    const album = await albumService.getAlbumById(req.params.id);

    if (!album) {
      return errorResponse(res, "Album not found", 404);
    }

    return successResponse(res, "Album fetched successfully", { album });
  } catch (error) {
    console.error("Get album error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// ADD SONG TO ALBUM — Admin only
// ─────────────────────────────────────────
module.exports.addSongToAlbum = async (req, res) => {
  try {
    const { songId } = req.body;
    const { id: albumId } = req.params;

    if (!songId) {
      return errorResponse(res, "Song ID is required", 400);
    }

    const album = await albumService.addSongToAlbum(albumId, songId);

    if (!album) {
      return errorResponse(res, "Album not found", 404);
    }

    return successResponse(res, "Song added to album", { album });
  } catch (error) {
    console.error("Add song error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// REMOVE SONG FROM ALBUM — Admin only
// ─────────────────────────────────────────
module.exports.removeSongFromAlbum = async (req, res) => {
  try {
    const { songId } = req.body;
    const { id: albumId } = req.params;

    if (!songId) {
      return errorResponse(res, "Song ID is required", 400);
    }

    const album = await albumService.removeSongFromAlbum(albumId, songId);

    if (!album) {
      return errorResponse(res, "Album not found", 404);
    }

    return successResponse(res, "Song removed from album", { album });
  } catch (error) {
    console.error("Remove song error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// DELETE ALBUM — Admin only
// ─────────────────────────────────────────
module.exports.deleteAlbum = async (req, res) => {
  try {
    const album = await albumService.getAlbumById(req.params.id);

    if (!album) {
      return errorResponse(res, "Album not found", 404);
    }

    // Cloudinary se cover image delete karo
    if (album.coverImage.public_id) {
      await cloudinary.uploader.destroy(album.coverImage.public_id);
    }

    await albumService.deleteAlbum(req.params.id);

    return successResponse(res, "Album deleted successfully");
  } catch (error) {
    console.error("Delete album error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// SEARCH ALBUMS
// ─────────────────────────────────────────
module.exports.searchAlbums = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!q) {
      return errorResponse(res, "Search query is required", 400);
    }

    const result = await albumService.searchAlbums(q, page, limit);

    return successResponse(res, "Search results", result);
  } catch (error) {
    console.error("Search albums error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};