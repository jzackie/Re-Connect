const bcryptjs = require("bcryptjs");
const { StreamChat } = require("stream-chat");
const dotenv = require("dotenv");
const User = require("../models/User");
const Notification = require("../models/Notification");
const path = require("path");
const fs = require("fs");

dotenv.config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

const avatarDir = path.join(__dirname, "..", "public", "avatars");

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

exports.signup = async (req, res) => {
  try {
    const { fullName, username, password, phoneNumber } = req.body;

    if (
      typeof username !== "string" ||
      typeof fullName !== "string" ||
      typeof password !== "string" ||
      typeof phoneNumber !== "string" ||
      !username.trim() || !fullName.trim() || !password.trim() || !phoneNumber.trim()
    ) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,
      phoneNumber,
    });

    await newUser.save();

    const client = StreamChat.getInstance(api_key, api_secret);

    // ✅ Register the user in Stream
    await client.upsertUser({
      id: newUser._id.toString(),
      name: newUser.fullName,
    });

    const token = client.createToken(newUser._id.toString());

    res.status(201).json({
      message: "User registered successfully",
      token,
      userId: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      phoneNumber: newUser.phoneNumber,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required." });
    }

    const existingUser = await User.findOne({ username });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found." });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const client = StreamChat.getInstance(api_key, api_secret);

    // ✅ Ensure user still exists in Stream (optional but recommended)
    await client.upsertUser({
      id: existingUser._id.toString(),
      name: existingUser.fullName,
    });

    const token = client.createToken(existingUser._id.toString());

    res.status(200).json({
      message: "Login successful",
      token,
      userId: existingUser._id,
      fullName: existingUser.fullName,
      username: existingUser.username,
      phoneNumber: existingUser.phoneNumber,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};