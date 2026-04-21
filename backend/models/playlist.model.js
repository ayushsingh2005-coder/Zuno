const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",     
      required: true,
    },

    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",   
      },
    ],

    coverImage: {
      url: { type: String, default: "" },       // Cloudinary
      public_id: { type: String, default: "" }, // Delete ke liye
    },

    isPublic: {
      type: Boolean,
      default: true,   
    },
  },
  { timestamps: true }
);

const Playlist = mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;