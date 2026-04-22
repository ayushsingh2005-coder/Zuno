const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const {
  uploadImage,
  uploadThumbnail,
  uploadPlaylist,
} = require("../config/cloudinary");

// ─────────────────────────────────────────
// Song ke liye alag alag storage banao
// Audio aur Thumbnail dono ka alag folder
// ─────────────────────────────────────────
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "zuno/songs",
    allowed_formats: ["mp3", "wav", "flac", "aac"],
    resource_type: "video",
  },
});

const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "zuno/thumbnails",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  },
});

// Har field ka apna storage
const songMulter = multer({
  storage: {
    _handleFile(req, file, cb) {
      if (file.fieldname === "audio") {
        // Audio → audioStorage
        audioStorage._handleFile(req, file, cb);
      } else if (file.fieldname === "thumbnail") {
        // Thumbnail → thumbnailStorage
        thumbnailStorage._handleFile(req, file, cb);
      } else {
        cb(new Error("Unexpected field"));
      }
    },
    _removeFile(req, file, cb) {
      cb(null);
    },
  },
});

// Profile picture — single file
module.exports.uploadProfilePic = uploadImage.single("profilePicture");

// Song — audio + thumbnail dono
module.exports.uploadSong = songMulter.fields([
  { name: "audio", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

// Album cover — single file
module.exports.uploadThumbnail = uploadThumbnail.single("thumbnail");

// Playlist cover — single file
module.exports.uploadPlaylistCover = uploadPlaylist.single("coverImage");