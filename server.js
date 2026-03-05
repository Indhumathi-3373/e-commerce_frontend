require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET || "change-this-secret";

app.use(express.json());
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000"],
    credentials: true
  })
);
app.use(express.static(__dirname));

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

const querySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Query = mongoose.model("Query", querySchema);
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function createToken(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email }, jwtSecret, {
    expiresIn: "7d"
  });
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function readOptionalUser(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, jwtSecret);
  } catch {
    return null;
  }
}

app.post("/api/auth/signup", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: "Name, email, and password (min 6 chars) are required." });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ message: "Email already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = createToken(user);

  return res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = createToken(user);
  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
}));

app.get("/api/auth/me", authRequired, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("_id name email");
  if (!user) {
    return res.status(401).json({ message: "Session is no longer valid." });
  }

  return res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
}));

app.post("/api/queries", asyncHandler(async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required." });
  }

  const maybeUser = readOptionalUser(req);
  const query = await Query.create({
    userId: maybeUser?.id,
    name,
    email,
    message
  });

  return res.status(201).json({
    message: "Query submitted successfully.",
    query: {
      id: query._id,
      name: query.name,
      email: query.email,
      message: query.message,
      status: query.status,
      createdAt: query.createdAt
    }
  });
}));

app.get("/api/queries", authRequired, asyncHandler(async (req, res) => {
  const queries = await Query.find({ $or: [{ userId: req.user.id }, { email: req.user.email }] }).sort({
    createdAt: -1
  });
  return res.json({ queries });
}));

app.patch("/api/queries/:id/status", authRequired, asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!["open", "resolved"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'open' or 'resolved'." });
  }

  const query = await Query.findOneAndUpdate(
    { _id: req.params.id, $or: [{ userId: req.user.id }, { email: req.user.email }] },
    { status },
    { new: true }
  );

  if (!query) {
    return res.status(404).json({ message: "Query not found." });
  }

  return res.json({ message: "Query status updated.", query });
}));

app.get("/signup", (_req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

async function start() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI missing in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
