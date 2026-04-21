const Album = require("../models/album.model");
const redis = require("../config/redis");

// Album banao
const createAlbum = async (albumData) => {
  const album = await Album.create(albumData);
  await redis.del("cache:albums"); // Cache clear
  return album;
};

// Saare albums lo — pagination ke saath
const getAllAlbums = async (page = 1, limit = 10) => {
  const cacheKey = `cache:albums:page=${page}:limit=${limit}`;

  // Cache check karo
  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  const skip = (page - 1) * limit;

  const albums = await Album.find({ isPublic: true })
    .populate("songs", "title duration audio thumbnail") // Songs ki details
    .populate("uploadedBy", "fullname")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Album.countDocuments({ isPublic: true });

  const result = {
    albums,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };

  // Cache 1 hour
  await redis.setex(cacheKey, 3600, result);

  return result;
};

// ID se album lo
const getAlbumById = async (id) => {
  return await Album.findById(id)
    .populate("songs", "title duration audio thumbnail artist")
    .populate("uploadedBy", "fullname");
};

// Album mein song add karo
const addSongToAlbum = async (albumId, songId) => {
  const album = await Album.findByIdAndUpdate(
    albumId,
    { $addToSet: { songs: songId } }, 
    { returnDocument: "after" }
  );
  await redis.del("cache:albums"); 
  return album;
};

// Album se song remove karo
const removeSongFromAlbum = async (albumId, songId) => {
  const album = await Album.findByIdAndUpdate(
    albumId,
    { $pull: { songs: songId } }, // songs array se remove
    { returnDocument: "after" }
  );
  await redis.del("cache:albums");
  return album;
};

// Album delete karo
const deleteAlbum = async (id) => {
  const album = await Album.findByIdAndDelete(id);
  await redis.del("cache:albums");
  return album;
};

// Search albums
const searchAlbums = async (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const albums = await Album.find({
    isPublic: true,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
    ],
  })
    .populate("songs", "title duration")
    .skip(skip)
    .limit(limit);

  const total = await Album.countDocuments({
    isPublic: true,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { artist: { $regex: query, $options: "i" } },
    ],
  });

  return {
    albums,
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
  createAlbum,
  getAllAlbums,
  getAlbumById,
  addSongToAlbum,
  removeSongFromAlbum,
  deleteAlbum,
  searchAlbums,
};