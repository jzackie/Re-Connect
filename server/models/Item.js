const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String }, 
  location: { type: String, required: true },
  status: { type: String, enum: ["lost", "found"], required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Item", ItemSchema);
