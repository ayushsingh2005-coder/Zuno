const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ← Models PEHLE load karo
require("./models/user.model");
require("./models/song.model");
require("./models/album.model");
require("./models/playlist.model");
require("./models/like.model");

// ← Tab routes load karo
const authRoutes = require("./routes/auth.routes.js");
const songRoutes = require("./routes/song.routes.js");
const albumRoutes = require("./routes/album.routes");
const playlistRoutes = require("./routes/playlist.routes");
const likeRoutes = require("./routes/like.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/', (req, res) => {
  res.send('Welcome to Zuno🎵');
});

app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/likes", likeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is listening at http://localhost:${PORT}`);
});