const express = require("express");
const router = express.Router();

const Story = require("../models/Story");
const authMiddleware = require("../middleware/auth");

// =========================
// CREATE STORY
// =========================

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        message: "Story image is required",
      });
    }

    const story = new Story({
      user: req.user.id,
      image,
    });

    await story.save();

    const populatedStory = await Story.findById(story._id)
      .populate("user", "username profilePic");

    res.status(201).json({
      message: "Story created successfully",
      story: populatedStory,
    });

  } catch (error) {
    console.log("CREATE STORY ERROR:", error);

    res.status(500).json({
      message: "Story creation failed",
    });
  }
});


// =========================
// GET STORIES
// =========================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const stories = await Story.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(stories);

  } catch (error) {
    console.log("GET STORIES ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch stories",
    });
  }
});


// =========================
// DELETE STORY
// =========================

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    if (story.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You can delete only your own story",
      });
    }

    await Story.findByIdAndDelete(req.params.id);

    res.json({
      message: "Story deleted successfully",
    });

  } catch (error) {
    console.log("DELETE STORY ERROR:", error);

    res.status(500).json({
      message: "Story deletion failed",
    });
  }
});


module.exports = router;