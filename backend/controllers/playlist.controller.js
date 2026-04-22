const playlistService = require("../services/playlist.service");
const { cloudinary } = require("../config/cloudinary");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─────────────────────────────────────────
// CREATE PLAYLIST
// ─────────────────────────────────────────
module.exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name) {
      // Cover upload hua tha toh delete karo
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return errorResponse(res, "Playlist name is required", 400);
    }

    const playlist = await playlistService.createPlaylist({
      name,
      description: description || "",
      isPublic: isPublic ?? true,    // undefined aaya toh true
      createdBy: req.user._id,       // Auth middleware se
      coverImage: req.file
        ? { url: req.file.path, public_id: req.file.filename }
        : { url: "", public_id: "" },
    });

    return successResponse(res, "Playlist created", { playlist }, 201);
  } catch (error) {
    console.error("Create playlist error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// GET USER PLAYLISTS
// ─────────────────────────────────────────
module.exports.getUserPlaylists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // req.user._id = logged in user
    const result = await playlistService.getUserPlaylists(
      req.user._id,
      page,
      limit
    );

    return successResponse(res, "Playlists fetched", result);
  } catch (error) {
    console.error("Get playlists error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// GET PLAYLIST BY ID
// ─────────────────────────────────────────
module.exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id);

    if (!playlist) {
      return errorResponse(res, "Playlist not found", 404);
    }

    // Private playlist sirf owner dekh sakta hai
    if (
      !playlist.isPublic &&
      playlist.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, "Access denied", 403);
    }

    return successResponse(res, "Playlist fetched", { playlist });
  } catch (error) {
    console.error("Get playlist error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// ADD SONG TO PLAYLIST
// ─────────────────────────────────────────
module.exports.addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const { id: playlistId } = req.params;

    if (!songId) {
      return errorResponse(res, "Song ID is required", 400);
    }

    const playlist = await playlistService.addSongToPlaylist(
      playlistId,
      songId,
      req.user._id  // Owner check ke liye
    );

    if (!playlist) {
      return errorResponse(res, "Playlist not found or access denied", 404);
    }

    return successResponse(res, "Song added to playlist", { playlist });
  } catch (error) {
    console.error("Add song error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// REMOVE SONG FROM PLAYLIST
// ─────────────────────────────────────────
module.exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const { id: playlistId } = req.params;

    if (!songId) {
      return errorResponse(res, "Song ID is required", 400);
    }

    const playlist = await playlistService.removeSongFromPlaylist(
      playlistId,
      songId,
      req.user._id
    );

    if (!playlist) {
      return errorResponse(res, "Playlist not found or access denied", 404);
    }

    return successResponse(res, "Song removed from playlist", { playlist });
  } catch (error) {
    console.error("Remove song error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// UPDATE PLAYLIST
// ─────────────────────────────────────────
module.exports.updatePlaylist = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const { id: playlistId } = req.params;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // Cover image update hua?
    if (req.file) {
      // Purani image delete karo pehle
      const oldPlaylist = await playlistService.getPlaylistById(playlistId);
      if (oldPlaylist?.coverImage?.public_id) {
        await cloudinary.uploader.destroy(oldPlaylist.coverImage.public_id);
      }
      updateData.coverImage = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const playlist = await playlistService.updatePlaylist(
      playlistId,
      req.user._id,
      updateData
    );

    if (!playlist) {
      return errorResponse(res, "Playlist not found or access denied", 404);
    }

    return successResponse(res, "Playlist updated", { playlist });
  } catch (error) {
    console.error("Update playlist error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// DELETE PLAYLIST
// ─────────────────────────────────────────
module.exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id);

    if (!playlist) {
      return errorResponse(res, "Playlist not found", 404);
    }

    // Cloudinary se cover delete karo
    if (playlist.coverImage?.public_id) {
      await cloudinary.uploader.destroy(playlist.coverImage.public_id);
    }

    const deleted = await playlistService.deletePlaylist(
      req.params.id,
      req.user._id
    );

    if (!deleted) {
      return errorResponse(res, "Access denied", 403);
    }

    return successResponse(res, "Playlist deleted");
  } catch (error) {
    console.error("Delete playlist error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};