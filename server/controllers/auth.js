const bcrypt = require("bcrypt");
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
    const { fullName, username, email, password, phoneNumber } = req.body;

    if (
      typeof username !== "string" ||
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof phoneNumber !== "string" ||
      !username.trim() || !fullName.trim() || !email.trim() || !password.trim() || !phoneNumber.trim()
    ) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const conflictField = existingUser.username === username ? "Username" : "Email";
      return res.status(409).json({ message: `${conflictField} already taken` });
    }

    let avatarURL = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const fileName = Date.now() + "-" + username + ext;
      const filePath = path.join(avatarDir, fileName);

      fs.writeFileSync(filePath, req.file.buffer);

      avatarURL = `${req.protocol}://${req.get("host")}/public/avatars/${fileName}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      avatarURL,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      avatarURL: newUser.avatarURL,
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

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const client = StreamChat.getInstance(api_key, api_secret);
    const token = client.createToken(existingUser._id.toString());

    res.status(200).json({
      token,
      userId: existingUser._id,
      fullName: existingUser.fullName,
      username: existingUser.username,
      email: existingUser.email,
      phoneNumber: existingUser.phoneNumber,
      avatarURL: existingUser.avatarURL || null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};