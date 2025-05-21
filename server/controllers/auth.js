const bcrypt = require("bcrypt");
const { StreamChat } = require("stream-chat");
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

    // Validate fields (as you do)

    // Create hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to your MongoDB (with Mongoose)
    const newUser = await User.create({
      name: fullName,
      email: username,
      password: hashedPassword,
      contact: phoneNumber,        // matches schema
      avatarURL: avatarFile ? `/public/avatars/${Date.now()}-${avatarFile.originalname}` : null,
    });

    // Generate Stream Chat user ID - can be MongoDB _id or a new ID
    const userId = newUser._id.toString();  // Use MongoDB _id as Stream user ID

    // Create or update user in Stream Chat
    const serverClient = StreamChat.getInstance(api_key, api_secret);

    await serverClient.upsertUser({
      id: userId,
      name: username,
      fullName,
      image: newUser.avatarURL,
      phoneNumber,
    });

    // Create a Stream Chat token for that user
    const token = serverClient.createToken(userId);

    // Respond with needed data including the MongoDB userId
    res.status(200).json({
      token,
      fullName,
      username,
      userId,
      phoneNumber,
      avatarURL: newUser.avatarURL,
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

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const existingUser = await User.findOne({ email: username });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const client = StreamChat.getInstance(api_key, api_secret);
    const token = client.createToken(existingUser._id.toString());

    const dbUsers = await User.find({}, "_id");
    const notifications = dbUsers.map((user) => ({
      userId: user._id,
      type: "user_login",
      message: `${existingUser.name} has logged in.`,
      isRead: false,
    }));
    await Notification.insertMany(notifications);

    const io = req.app.get("io");
    if (io) {
      io.emit("notification", {
        type: "user_login",
        message: `${existingUser.name} has logged in.`,
      });
    }

    res.status(200).json({
      token,
      fullName: existingUser.name,
      username: existingUser.email,
      userId: existingUser._id,
      hashedPassword: existingUser.password,
      phoneNumber: existingUser.contact,
      avatarURL: existingUser.avatarURL || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Login error" });
  }
};

module.exports = { signup, login };
