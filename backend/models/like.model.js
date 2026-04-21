const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
    },
  },
  { timestamps: true }
);

// Ek user ek song ko sirf ek baar like kar sakta hai
likeSchema.index({ user: 1, song: 1 }, { unique: true });

const Like = mongoose.models.Like || mongoose.model("Like", likeSchema);

module.exports = Like;