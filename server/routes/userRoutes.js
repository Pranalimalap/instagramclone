const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/follow/:id", auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!currentUser) {
      return res.status(404).json({
        message: "Current user not found",
      });
    }

    // Prevent following yourself
    if (
      currentUser._id.toString() ===
      userToFollow._id.toString()
    ) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    // Check if already following
    const alreadyFollowing = currentUser.following.some(
      (id) =>
        id.toString() === userToFollow._id.toString()
    );

    if (alreadyFollowing) {
      return res.status(400).json({
        message: "Already following this user",
      });
    }

    currentUser.following.push(userToFollow._id);

const isAlreadyFollower = userToFollow.followers.some(
  (id) => id.toString() === currentUser._id.toString()
);

if (!isAlreadyFollower) {
  userToFollow.followers.push(currentUser._id);
}

await currentUser.save();
await userToFollow.save();
 
const notification = new Notification({
  recipient: userToFollow._id,
  sender: currentUser._id,
  type: "follow",
  message: `${currentUser.username} started following you ❤️`,
});

await notification.save();  

    res.json({
      message: "User followed successfully ❤️",
      followersCount: userToFollow.followers.length,
      followingCount: currentUser.following.length,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
});
// =========================
// UNFOLLOW USER
// =========================

router.post("/unfollow/:id", auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!currentUser) {
      return res.status(404).json({
        message: "Current user not found",
      });
    }

    // Remove user from following list
    currentUser.following =
      currentUser.following.filter(
        (id) =>
          id.toString() !==
          userToUnfollow._id.toString()
      );

    // Remove current user from followers list
    userToUnfollow.followers =
      userToUnfollow.followers.filter(
        (id) =>
          id.toString() !==
          currentUser._id.toString()
      );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({
      message: "User unfollowed successfully 💔",
      followersCount:
        userToUnfollow.followers.length,
      followingCount:
        currentUser.following.length,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
});
// GET MY NOTIFICATIONS
router.get("/notifications", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
    })
      .populate("sender", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.log("NOTIFICATION ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});
// GET UNREAD NOTIFICATION COUNT
router.get("/notifications/unread-count", auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
    });

    res.json({
      count,
    });

  } catch (err) {
    console.log("UNREAD COUNT ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});
// MARK ALL NOTIFICATIONS AS READ
router.put("/notifications/read", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    res.json({
      message: "Notifications marked as read",
    });

  } catch (err) {
    console.log("MARK READ ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// EDIT PROFILE
router.put("/profile", auth, async (req, res) => {
  try {
    const { username, email, profilePic } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (username) {
      user.username = username;
    }

    if (email) {
      user.email = email;
    }

    if (profilePic !== undefined) {
      user.profilePic = profilePic;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        followers: user.followers,
        following: user.following,
      },
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

console.log("✅ USER ROUTES LOADED");

// =========================
// PUBLIC USER PROFILE
// =========================

router.get("/profile/:id", auth, async (req, res) => {
  try {
    const profileUser = await User.findById(req.params.id)
      .select("-password");

    if (!profileUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userPosts = await Post.find({
      user: profileUser._id,
    })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json({
      user: profileUser,
      posts: userPosts,
    });

  } catch (err) {
    console.log("PUBLIC PROFILE ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;