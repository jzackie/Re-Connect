const express = require("express");
const multer = require("multer");
const path = require("path");
const { signup, login } = require("../controllers/auth");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG and PNG files are allowed"), false);
    }
    cb(null, true);
  },
});

router.post("/signup", upload.single("avatar"), signup);
router.post("/login", login);

module.exports = router;