import express from "express";
import Channel from "../models/Channel.model.js";
import User from "../models/User.model.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/channels/:id
router.get("/:id", async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate("owner", "username avatar")
      .populate({
        path: "videos",
        populate: { path: "uploader", select: "username" },
      });

    if (!channel)
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    res.json({ success: true, data: channel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/channels - Create channel (protected)
router.post("/", protect, async (req, res) => {
  try {
    const { channelName, description, handle } = req.body;
    if (!channelName) {
      return res
        .status(400)
        .json({ success: false, message: "Channel name is required" });
    }

    const generatedHandle =
      handle ||
      `@${channelName.replace(/\s+/g, "")}${Date.now().toString().slice(-4)}`;

    const channel = await Channel.create({
      channelName,
      description,
      handle: generatedHandle,
      owner: req.user._id,
    });

    // Link channel to user
    await User.findByIdAndUpdate(req.user._id, {
      $push: { channels: channel._id },
    });

    res.status(201).json({ success: true, data: channel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/channels/user/my-channels - Get logged in user's channels
router.get("/user/my-channels", protect, async (req, res) => {
  try {
    const channels = await Channel.find({ owner: req.user._id });
    res.json({ success: true, data: channels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
