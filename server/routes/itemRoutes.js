const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Notification = require("../models/Notification");
const User = require("../models/User");
const auth = require("../middleware/auth");

// 🔍 GET all lost/found items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().populate("postedBy", "name email");
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✏️ POST a new lost/found item (protected by JWT auth)
router.post("/", auth, async (req, res) => {
  const { title, description, image, location, status } = req.body;

  try {
    // ✅ Use logged-in user from JWT middleware
    const postedBy = req.user._id;

    // Create the item
    const newItem = await Item.create({
      title,
      description,
      image,
      location,
      status,
      postedBy,
    });

    // Notify ALL users (including admin)
    const users = await User.find({}, "_id");
    const notifications = users.map((user) => ({
      userId: user._id,
      type: "item_posted",
      message: `New ${status} item posted: "${title}"`,
      isRead: false,
    }));
    await Notification.insertMany(notifications);

    // Emit real-time notification to all connected clients
    const io = req.app.get("io");
    if (io) {
      users.forEach((user) => {
        io.to(user._id.toString()).emit("notification", {
          type: "item_posted",
          message: `New ${status} item posted: "${title}"`,
          timestamp: new Date(),
        });
      });
    }

    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid data" });
  }
});

module.exports = router;
