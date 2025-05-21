const bcrypt = require('bcrypt');
const StreamChat = require('stream-chat').StreamChat;
const crypto = require('crypto');
const User = require('../models/User');

require('dotenv').config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;

const signup = async (req, res) => {
  try {
    const { fullName, username, password, phoneNumber, avatarURL } = req.body;
    const userId = username;
    const hashedPassword = await bcrypt.hash(password, 10);

    const serverClient = StreamChat.getInstance(api_key, api_secret);

    await User.create({
      fullName,
      username,
      hashedPassword,
      phoneNumber,
      avatarURL,
    });


    await serverClient.upsertUser({
      id: userId,
      name: username,
      fullName,
      hashedPassword,
      phoneNumber,
      image: avatarURL,
    });

    const token = serverClient.createToken(userId);

    res.status(200).json({
      token,
      fullName,
      username,
      userId,
      hashedPassword,
      phoneNumber,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || String(error)});
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const client = StreamChat.getInstance(api_key, api_secret);

    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.hashedPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = client.createToken(existingUser.username);

    res.status(200).json({
      token,
      fullName: existingUser.fullName,
      username: existingUser.username,
      userId: existingUser.username,
      phoneNumber: existingUser.phoneNumber,
      avatarURL: existingUser.avatarURL || null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || String(error) });
  }
};

module.exports = { signup, login };