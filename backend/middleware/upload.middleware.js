const {
  uploadImage,
  uploadAudio,
  uploadThumbnail,
  uploadPlaylist,
} = require("../config/cloudinary");

// Profile picture upload
module.exports.uploadProfilePic = uploadImage.single("profilePicture");
// .single = ek file
// "profilePicture" = frontend se is naam se aayegi file

// Song upload (audio + thumbnail saath mein)
module.exports.uploadSong = uploadAudio.single("audio");

// Song thumbnail upload
module.exports.uploadThumbnail = uploadThumbnail.single("thumbnail");

// Playlist cover upload
module.exports.uploadPlaylistCover = uploadPlaylist.single("coverImage");