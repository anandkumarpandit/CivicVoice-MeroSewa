const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config({ path: path.join(__dirname, "config.env") });

const app = express();

// Security and performance middleware
app.use(helmet());
app.use(compression()); // Compress all HTTP responses

// Request timeout middleware (120 seconds for large uploads)
app.use((req, res, next) => {
  req.setTimeout(120000, () => {
    if (!res.headersSent) {
      res.status(408).json({ success: false, message: "Request timeout" });
    }
  });
  res.setTimeout(120000, () => {
    if (!res.headersSent) {
      res.status(408).json({ success: false, message: "Response timeout" });
    }
  });
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "https://merosewa-9s4o.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed)) || 
                     origin.includes("onrender.com") || 
                     origin.includes("vercel.app");
                     
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,PATCH"
}));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

// ROUTES IMPORT
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/auth", require("./routes/auth"));

// DATABASE CONNECTION
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
