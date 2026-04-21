const Song = require("../models/song.model");
const redis = require("../config/redis");

// Song banao
const createSong = async (songData) => {
  const song = await Song.create(songData);
  await redis.del("cache:songs:*"); // Saara songs cache delete
  return song;
};

// Saare songs lo — WITH PAGINATION
const getAllSongs = async (page = 1, limit = 10) => {
  // Cache key mein page aur limit bhi rakho
  // Kyunki page 1 aur page 2 alag data hai
  const cacheKey = `cache:songs:page=${page}:limit=${limit}`;

  // Cache check karo
  const cached = await redis.get(cacheKey);
  if (cached) return cached; // ✅ Redis se seedha do

  // Kitne songs skip karne hain calculate karo
  const skip = (page - 1) * limit;
  // page=1 → skip=0  (1-10)
  // page=2 → skip=10 (11-20)
  // page=3 → skip=20 (21-30)

  // MongoDB se lo
  const songs = await Song.find({ isPublic: true })
    .populate("album", "title coverImage")
    .populate("uploadedBy", "fullname")
    .sort({ createdAt: -1 })
    .skip(skip)   // Pehle itne skip karo
    .limit(limit); // Phir itne lo

  // Total songs count karo — frontend ko pata chale kitne pages hain
  const total = await Song.countDocuments({ isPublic: true });

  const result = {
    songs,
    pagination: {
      total,          // 150 songs hain total
      page,           // Abhi page 1 pe hain
      limit,          // Har page pe 10 songs
      totalPages: Math.ceil(total / limit), // 150/10 = 15 pages
      hasNextPage: page < Math.ceil(total / limit), // Aur pages hain?
      hasPrevPage: page > 1,                         // Pehle page hai?
    },
  };

  // Cache mein save karo — 1 hour
  await redis.setex(cacheKey, 3600, result);

  return result;
};

// ID se song lo
const getSongById = async (id) => {
  return await Song.findById(id)
    .populate("album", "title coverImage")
    .populate("uploadedBy", "fullname");
};

// Song delete karo
const deleteSong = async (id) => {
  const song = await Song.findByIdAndDelete(id);
  await redis.del("cache:songs"); // Cache clear
  return song;
};

// Play count badhao
const incrementPlays = async (id) => {
  return await Song.findByIdAndUpdate(
    id,
    { $inc: { plays: 1 } },
    { returnDocument: "after" }
  );
};

// Genre se songs lo — pagination ke saath
const getSongsByGenre = async (genre, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const songs = await Song.find({ genre, isPublic: true })
    .populate("album", "title")
    .sort({ plays: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Song.countDocuments({ genre, isPublic: true });

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

// Search songs — pagination ke saath
const searchSongs = async (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const songs = await Song.find({
    isPublic: true,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
    ],
  })
    .populate("album", "title coverImage")
    .skip(skip)
    .limit(limit);

  const total = await Song.countDocuments({
    isPublic: true,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
    ],
  });

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
  createSong,
  getAllSongs,
  getSongById,
  deleteSong,
  incrementPlays,
  getSongsByGenre,
  searchSongs,
};