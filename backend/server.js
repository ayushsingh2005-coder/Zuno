const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require("./routes/auth.routes.js");

// Enable CORS for all routes
app.use(cors());
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('Welcome to Zuno🎵 : A music streaming platform for free ,Download and stream your favorite music without any subscription');
});

// ROUTES -----
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`server is listening at http://localhost:${PORT}`);
})

