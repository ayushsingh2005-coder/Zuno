const cloudinary = require("cloudinary").v2;
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const multer = require("multer");

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// profile picture
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder : "zuno/profiles",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill" }],
    },
});

// Song storage
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "zuno/songs",
    allowed_formats: ["mp3", "wav", "flac", "aac"],
    resource_type: "video", // Cloudinary audio = "video"
  },
});

// Thumbnail/Cover art storage
const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "zuno/thumbnails",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  },
});

// Playlist cover storage
const playlistStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "zuno/playlists",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill" }],
  },
});

const uploadImage = multer({storage : imageStorage});
const uploadAudio = multer({storage : audioStorage});
const uploadThumbnail = multer({storage : thumbnailStorage});
const uploadPlaylist = multer({storage : playlistStorage});

module.exports = {
  cloudinary,
  uploadImage,
  uploadAudio,
  uploadThumbnail,
  uploadPlaylist,
};