import express from "express";
import Video from "../models/Video.model.js";
import Channel from "../models/Channel.model.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/videos - Get all videos (with optional search & filter)
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category && category !== "All") {
      query.category = category;
    }

    const videos = await Video.find(query)
      .populate("channelId", "channelName channelAvatar")
      .populate("uploader", "username avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/videos/:id - Get single video
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    )
      .populate("channelId", "channelName channelAvatar subscribers")
      .populate("uploader", "username avatar")
      .populate("comments.userId", "username avatar");

    if (!video)
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });

    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
