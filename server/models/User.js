const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: String,
  username: { type: String, unique: true },
  hashedPassword: String,
  phoneNumber: String,
  avatarURL: String,
});

module.exports = mongoose.model('User', UserSchema);

