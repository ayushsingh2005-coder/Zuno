const Like = require("../models/like.model");

// Song like karo
const likeSong = async (userId, songId) => {
  try {
    const like = await Like.create({ user: userId, song: songId });
    return like;
  } catch (error) {
    // Duplicate key error
    if (error.code === 11000) {
      return null; 
    }
    throw error; 
  }
};

// Song unlike 
const unlikeSong = async (userId, songId) => {
  const like = await Like.findOneAndDelete({ user: userId, song: songId });
  return like; 
};

// User ne yeh song like kiya hai?
const isLikedByUser = async (userId, songId) => {
  const like = await Like.findOne({ user: userId, song: songId });
  return !!like; 
};

// Song ke total likes count
const getSongLikesCount = async (songId) => {
  return await Like.countDocuments({ song: songId });
};

// User ki saari liked songs
const getUserLikedSongs = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const likes = await Like.find({ user: userId })
    .populate("song", "title artist audio thumbnail duration")
    .sort({ createdAt: -1 }) // Latest like pehle
    .skip(skip)
    .limit(limit);

  const total = await Like.countDocuments({ user: userId });

  // Sirf songs nikalo — Like object nahi
  const songs = likes.map((like) => like.song);

  return {
    songs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  likeSong,
  unlikeSong,
  isLikedByUser,
  getSongLikesCount,
  getUserLikedSongs,
};