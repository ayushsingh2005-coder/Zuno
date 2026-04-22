const songService = require("../services/song.service");
const likeService = require("../services/like.service");
const { cloudinary } = require("../config/cloudinary");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─────────────────────────────────────────
// UPLOAD SONG — Admin only
// ─────────────────────────────────────────
module.exports.uploadSong = async (req, res) => {
  try {
    console.log("Body:", req.body);
console.log("Files:", req.files);
    const { title, artist, album, duration, genre } = req.body;

    // Validation
    if (!title || !artist || !duration) {
      
      if (req.files?.audio) {
        await cloudinary.uploader.destroy(
          req.files.audio[0].filename,
          { resource_type: "video" }
        );
      }
      return errorResponse(res, "Title, artist and duration are required", 400);
    }

    // Audio file zaroori hai
    if (!req.files?.audio) {
      return errorResponse(res, "Audio file is required", 400);
    }

    const audioFile = req.files.audio[0];
    const thumbnailFile = req.files?.thumbnail?.[0]; // Optional

    const song = await songService.createSong({
      title,
      artist,
      album: album || null,
      duration: Number(duration),
      genre: genre || "other",
      audio: {
        url: audioFile.path,         // Cloudinary URL
        public_id: audioFile.filename, // Delete ke liye
      },
      thumbnail: thumbnailFile
        ? {
            url: thumbnailFile.path,
            public_id: thumbnailFile.filename,
          }
        : { url: "", public_id: "" },
      uploadedBy: req.user._id, // Auth middleware se aaya
    });

    return successResponse(res, "Song uploaded successfully", { song }, 201);
  } catch (error) {
    console.error("Upload song error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// GET ALL SONGS — pagination
// ─────────────────────────────────────────
module.exports.getAllSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await songService.getAllSongs(page, limit);

    return successResponse(res, "Songs fetched successfully", result);
  } catch (error) {
    console.error("Get all songs error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// GET SONG BY ID
// ─────────────────────────────────────────
module.exports.getSongById = async (req, res) => {
  try {
    const song = await songService.getSongById(req.params.id);

    if (!song) {
      return errorResponse(res, "Song not found", 404);
    }

    // Like status bhi do agar user logged in hai
    let isLiked = false;
    if (req.user) {
      isLiked = await likeService.isLikedByUser(req.user._id, song._id);
    }

    const likesCount = await likeService.getSongLikesCount(song._id);

    return successResponse(res, "Song fetched successfully", {
      song,
      isLiked,
      likesCount,
    });
  } catch (error) {
    console.error("Get song error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// PLAY SONG — plays count +1
// ─────────────────────────────────────────
module.exports.playSong = async (req, res) => {
  try {
    const song = await songService.getSongById(req.params.id);

    if (!song) {
      return errorResponse(res, "Song not found", 404);
    }

    // Plays +1
    await songService.incrementPlays(req.params.id);

    // Audio URL do frontend ko
    return successResponse(res, "Now playing", {
      audioUrl: song.audio.url,
      title: song.title,
      artist: song.artist,
      thumbnail: song.thumbnail.url,
    });
  } catch (error) {
    console.error("Play song error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// DELETE SONG — Admin only
// ─────────────────────────────────────────
module.exports.deleteSong = async (req, res) => {
  try {
    const song = await songService.getSongById(req.params.id);

    if (!song) {
      return errorResponse(res, "Song not found", 404);
    }

    // Cloudinary se audio delete karo
    await cloudinary.uploader.destroy(
      song.audio.public_id,
      { resource_type: "video" }
    );

    // Cloudinary se thumbnail delete karo
    if (song.thumbnail.public_id) {
      await cloudinary.uploader.destroy(song.thumbnail.public_id);
    }

    // MongoDB se delete karo
    await songService.deleteSong(req.params.id);

    return successResponse(res, "Song deleted successfully");
  } catch (error) {
    console.error("Delete song error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// GET SONGS BY GENRE
// ─────────────────────────────────────────
module.exports.getSongsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await songService.getSongsByGenre(genre, page, limit);

    return successResponse(res, `${genre} songs fetched`, result);
  } catch (error) {
    console.error("Get by genre error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// SEARCH SONGS
// ─────────────────────────────────────────
module.exports.searchSongs = async (req, res) => {
  try {
    const { q } = req.query; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!q) {
      return errorResponse(res, "Search query is required", 400);
    }

    const result = await songService.searchSongs(q, page, limit);

    return successResponse(res, "Search results", result);
  } catch (error) {
    console.error("Search songs error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};