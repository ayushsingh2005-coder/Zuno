const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
    title: {
        type : String,
        required : true,
        trim : true
    },

    artist : {
        type : String,
        required : true,
        trim : true,
    },

    album : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Album",
        default : null,

    },

    audio : {
        url : {type : String , required : true},
        public_id : {type: String , required : true},
    },

    thumbnail : {
        url : {type : String , default : ""},
        public_id : {type: String , default : ""},
    },
    duration :{
        type : Number,
        required : true,
    },

    genre : {
        type : String,
        enum : ["Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic", "Country", "Reggae", "Blues", "Folk", "Metal", "Other"],
        default : "Other",
    },

    plays : {
        type : Number,
        default : 0,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   
      required: true,
    },

    isPublic: {
      type: Boolean,
      default: true,  // false = draft mode
    },
  },
  { timestamps: true }
);

const Song = mongoose.models.Song || mongoose.model("Song", songSchema);

module.exports = Song;