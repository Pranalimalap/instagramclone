const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});
router.post("/create", auth, async (req, res) => {
  try {
    const { image, caption } = req.body;

    const newPost = new Post({
      user: req.user.id,
      image,
      caption,
    });

    await newPost.save();

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
router.post("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // LIKE
    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();

      // Don't send notification to yourself
      if (post.user.toString() !== req.user.id) {
        await Notification.create({
          recipient: post.user,
          sender: req.user.id,
          type: "like",
          message: "liked your post ❤️"
        });
      }

      return res.json({
        message: "Post liked ❤️"
      });
    }

    // UNLIKE
    post.likes = post.likes.filter(
      (userId) => userId.toString() !== req.user.id
    );

    await post.save();

    res.json({
      message: "Post unliked 💔"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});
  router.post("/comment/:id", auth, async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const newComment = {
      user: req.user.id,
      text,
    };

    post.comments.push(newComment);

    await post.save();

    // Create comment notification
    // Don't notify yourself
    if (post.user.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.user,
        sender: req.user.id,
        type: "comment",
        message: "commented on your post 💬"
      });
    }

    res.json({
      message: "Comment added successfully",
      comments: post.comments,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
  // DELETE COMMENT
  router.delete("/:postId/comment/:commentId", auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);

      if (!post) {
        return res.status(404).json({
          message: "Post not found",
        });
      }

      const comment = post.comments.id(req.params.commentId);

      if (!comment) {
        return res.status(404).json({
          message: "Comment not found",
        });
      }

      // Only comment owner can delete the comment
      if (comment.user.toString() !== req.user.id) {
        return res.status(403).json({
          message: "You can delete only your own comment",
        });
      }

      comment.deleteOne();

      await post.save();

      res.json({
        message: "Comment deleted successfully",
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  });

  // DELETE POST
  router.delete("/:id", auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          message: "Post not found",
        });
      }

      // Only post owner can delete the post
      if (post.user.toString() !== req.user.id) {
        return res.status(403).json({
          message: "You can delete only your own post",
        });
      }

      await Post.findByIdAndDelete(req.params.id);

      res.json({
        message: "Post deleted successfully",
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  });

module.exports = router;