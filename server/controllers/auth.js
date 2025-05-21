const bcrypt = require("bcrypt");
const { StreamChat } = require("stream-chat");
const crypto = require("crypto");
const dotenv = require("dotenv");
const User = require("../models/User");
const Notification = require("../models/Notification");

dotenv.config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

// Signup Controller
const signup = async (req, res) => {
  try {
    const { fullName, username, password, phoneNumber } = req.body;
    const avatarFile = req.file;

    if (!fullName || !username || !password || !phoneNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Only allow jpg and png
    if (avatarFile && !["image/jpeg", "image/png"].includes(avatarFile.mimetype)) {
      return res.status(400).json({ message: "Only JPG and PNG images are allowed" });
    }

    // Simulated avatar URL (you should replace this with actual upload handling)
    const avatarURL = avatarFile
      ? `/uploads/${Date.now()}-${avatarFile.originalname}`
      : null;

    const userId = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);

    const serverClient = StreamChat.getInstance(api_key, api_secret);

    await User.create({
      name: fullName,
      email: username,
      password: hashedPassword,
      phoneNumber,
      avatarURL,
    });

    await serverClient.upsertUser({
      id: userId,
      name: username,
      fullName,
      image: avatarURL,
    });

    const token = serverClient.createToken(userId);

    // Store notification in MongoDB for all users
    const users = await User.find({}, "_id");
    const notifications = users.map((user) => ({
      userId: user._id,
      type: "user_signup",
      message: `${fullName} has signed up.`,
      isRead: false,
    }));
    await Notification.insertMany(notifications);

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      io.emit("notification", {
        type: "user_signup",
        message: `${fullName} has signed up.`,
      });
    }

    res.status(200).json({
      token,
      fullName,
      username,
      userId,
      hashedPassword,
      phoneNumber,
      avatarURL,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Signup error" });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const client = StreamChat.getInstance(api_key, api_secret);
    const existingUser = await User.findOne({ username });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.hashedPassword
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = client.createToken(existingUser.username);

    // Store notification in MongoDB for all users
    const dbUsers = await User.find({}, "_id");
    const notifications = dbUsers.map((user) => ({
      userId: user._id,
      type: "user_login",
      message: `${existingUser.fullName} has logged in.`,
      isRead: false,
    }));
    await Notification.insertMany(notifications);

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      io.emit("notification", {
        type: "user_login",
        message: `${existingUser.fullName} has logged in.`,
      });
    }

    res.status(200).json({
      token,
      fullName: existingUser.fullName,
      username: existingUser.username,
      userId: existingUser.username,
      hashedPassword: existingUser.hashedPassword,
      phoneNumber: existingUser.phoneNumber,
      avatarURL: existingUser.avatarURL || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Login error" });
  }
};

module.exports = { signup, login };
