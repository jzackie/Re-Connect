// server/routes/itemRoutes.js
const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Notification = require("../models/Notification");
const User = require("../models/User");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Setup multer storage (saving images to /uploads folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

// GET all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().populate("postedBy", "name email");
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new item (protected)
router.post("/", auth, upload.single("imageFile"), async (req, res) => {
  const { title, description, location, status } = req.body;
  try {
    const postedBy = req.user._id;

    // Handle image url from uploaded file
    let image = "";
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const newItem = await Item.create({
      title,
      description,
      image,
      location,
      status,
      postedBy,
    });

    // Notify all users
    const users = await User.find({}, "_id");
    const notifications = users.map((user) => ({
      userId: user._id,
      type: "item_posted",
      message: `New ${status} item posted: "${title}"`,
      isRead: false,
    }));
    await Notification.insertMany(notifications);

    // Emit real-time notifications
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

// PATCH mark item as claimed (protected)
router.patch("/:id/claim", auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Add your admin check here if needed
    item.claimedBy = req.user._id;
    item.status = "claimed"; // update status as well if you want
    await item.save();

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
