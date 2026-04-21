const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({
    title:{
        type : String,
        required : true,
        trim : true,
    },

    artist : {
        type : String,
        required : true,
        trim : true,

    },

    coverImage : {
        url : {type : String , default : ""},
        public_id : {type : String , default : ""}
    },

    songs : [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song", 
        },
    ],

    releaseDate: {
      type: Date,
      default: Date.now,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },
},
{ timestamps: true }
);

const Album = mongoose.models.Album || mongoose.model("Album", albumSchema);

module.exports = Album;