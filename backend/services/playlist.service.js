const Playlist = require("../models/playlist.model");
const redis = require("../config/redis");

// Playlist banao
const createPlaylist = async (data) => {
  const playlist = await Playlist.create(data)
  try {
    const keys = await redis.keys("cache:playlists:*")
    if (keys && keys.length) {
      await Promise.all(keys.map(k => redis.del(k)))
    }
  } catch (e) {
    console.log('Cache clear error:', e)
  }
  return playlist
}

// User ki saari playlists lo
const getUserPlaylists = async (userId, page = 1, limit = 10) => {
  const cacheKey = `cache:playlists:${userId}:page=${page}`;

  // Cache check karo
  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  const skip = (page - 1) * limit;

  const playlists = await Playlist.find({ createdBy: userId })
    .populate("songs", "title artist audio thumbnail duration")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Playlist.countDocuments({ createdBy: userId });

  const result = {
    playlists,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };

  // Cache 30 min
  await redis.setex(cacheKey, 1800, result);

  return result;
};

// ID se playlist lo
const getPlaylistById = async (id) => {
  return await Playlist.findById(id)
    .populate("songs", "title artist audio thumbnail duration")
    .populate("createdBy", "fullname profilePicture");
};

// Playlist mein song add karo
const addSongToPlaylist = async (playlistId, songId, userId) => {
  // Sirf owner add kar sakta hai
  const playlist = await Playlist.findOne({
    _id: playlistId,
    createdBy: userId, // ← Owner check
  });

  if (!playlist) return null; // Playlist nahi mili ya owner nahi hai

  const updated = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { songs: songId } }, // Duplicate nahi aayega
    { returnDocument: "after" }
  );

  // Cache clear
  await redis.del(`cache:playlists:${userId}`);
  return updated;
};

// Playlist se song remove karo
const removeSongFromPlaylist = async (playlistId, songId, userId) => {
  // Sirf owner remove kar sakta hai
  const playlist = await Playlist.findOne({
    _id: playlistId,
    createdBy: userId, // ← Owner check
  });

  if (!playlist) return null;

  const updated = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { songs: songId } }, // Array se remove
    { returnDocument: "after" }
  );

  await redis.del(`cache:playlists:${userId}`);
  return updated;
};

// Playlist delete karo
const deletePlaylist = async (playlistId, userId) => {
  // Sirf owner delete kar sakta hai
  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    createdBy: userId, // ← Owner check
  });

  await redis.del(`cache:playlists:${userId}`);
  return playlist;
};

// Playlist update karo (name, description, isPublic)
const updatePlaylist = async (playlistId, userId, updateData) => {
  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      createdBy: userId, // ← Owner check
    },
    updateData,
    { returnDocument: "after" }
  );

  await redis.del(`cache:playlists:${userId}`);
  return playlist;
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};