// server/models/Item.js
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String }, // Store Cloudinary/S3 URL
  location: { type: String, required: true },
  status: { type: String, enum: ["lost", "found"], required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who posted it
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who claimed it (if found)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Item", ItemSchema);
