const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

router.get("/", (req, res) => {
    res.send("Auth Route Working 🚀");
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "User Registered Successfully",
      user,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
// Login API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
  return res.status(400).json({
    message: "Invalid Password"
  });
}

const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

res.json({
  message: "Login Successful",
  token,
  user: {
  id: user._id,
  username: user.username,
  email: user.email,
  profilePic: user.profilePic,
  followers: user.followers,
  following: user.following
}
});

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      message: "Protected Profile Route",
      user
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    await user.save();

    res.json({
      message: "Password reset successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;