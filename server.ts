import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://quiz_db:knSflNWG0W9HaXmf@simple-crud-cluster.0hdbxiy.mongodb.net/?appName=Simple-crud-cluster";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true },
  profilePic: String,
  joinedDate: { type: String, default: () => new Date().toISOString() },
  role: { type: String, default: "user" }
});

const resultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  category: String,
  language: String
});

const User = mongoose.model("User", userSchema);
const QuizResult = mongoose.model("QuizResult", resultSchema);

// API Routes
app.post("/api/users", async (req, res) => {
  try {
    const { uid, name, email, profilePic } = req.body;
    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({ uid, name, email, profilePic });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to save user" });
  }
});

app.get("/api/users/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.post("/api/results", async (req, res) => {
  try {
    const result = new QuizResult(req.body);
    await result.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to save result" });
  }
});

app.get("/api/results/:userId", async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
