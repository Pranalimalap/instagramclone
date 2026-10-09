const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const auth = require("../middleware/auth");

// =========================
// SEND MESSAGE
// =========================

router.post("/send", auth, async (req, res) => {
  try {
    const { receiver, text } = req.body;

    if (!receiver || !text?.trim()) {
      return res.status(400).json({
        message: "Receiver and message are required",
      });
    }

    if (receiver.toString() === req.user.id.toString()) {
      return res.status(400).json({
        message: "You cannot message yourself",
      });
    }

    const newMessage = new Message({
      sender: req.user.id,
      receiver,
      text: text.trim(),
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "username profilePic")
      .populate("receiver", "username profilePic");

    res.status(201).json({
      message: "Message sent successfully 💬",
      data: populatedMessage,
    });

  } catch (err) {
    console.log("SEND MESSAGE ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// =========================
// GET CHAT
// =========================

router.get("/chat/:userId", auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        {
          sender: req.user.id,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: req.user.id,
        },
      ],
    })
      .populate("sender", "username profilePic")
      .populate("receiver", "username profilePic")
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    console.log("GET CHAT ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// =========================
// GET UNREAD MESSAGE COUNT
// =========================

router.get("/unread-count", auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      read: false,
    });

    res.json({
      count,
    });

  } catch (err) {
    console.log("UNREAD MESSAGE COUNT ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});
// =========================
// MARK MESSAGES AS READ
// =========================

router.put("/read/:userId", auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    console.log("MARK READ REQUEST");
    console.log("Current User:", req.user.id);
    console.log("Other User:", otherUserId);

    // First try to mark messages from selected user as read
    const result = await Message.updateMany(
      {
        sender: otherUserId,
        receiver: req.user.id,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    console.log("FIRST MARK READ RESULT:", result);

    // If no messages matched, use unread received messages
    // This handles cases where selected user ID and message sender ID differ.
    if (result.matchedCount === 0) {
      const fallbackResult = await Message.updateMany(
        {
          receiver: req.user.id,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

      console.log("FALLBACK MARK READ RESULT:", fallbackResult);
    }

    // Check remaining unread messages
    const remainingUnread = await Message.countDocuments({
      receiver: req.user.id,
      read: false,
    });

    console.log("REMAINING UNREAD:", remainingUnread);

    res.json({
      message: "Messages marked as read ✅",
      unreadCount: remainingUnread,
    });

  } catch (err) {
    console.log("MARK MESSAGE READ ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});
// =========================
// DELETE MESSAGE
// =========================

router.delete("/:id", auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only sender can delete the message
    if (message.sender.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You can delete only your own message",
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({
      message: "Message deleted successfully 🗑️",
    });

  } catch (err) {
    console.log("DELETE MESSAGE ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});
module.exports = router;