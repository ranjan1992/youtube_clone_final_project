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

// POST /api/videos - Create video (protected)
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, channelId, category } =
      req.body;

    if (!title || !videoUrl || !channelId) {
      return res.status(400).json({
        success: false,
        message: "Title, videoUrl, and channelId are required",
      });
    }

    // Verify the channel belongs to the user
    const channel = await Channel.findOne({
      _id: channelId,
      owner: req.user._id,
    });
    if (!channel) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to post to this channel",
      });
    }

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      channelId,
      category: category || "All",
      uploader: req.user._id,
    });

    // Add video to channel
    channel.videos.push(video._id);
    await channel.save();

    res.status(201).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/videos/:id - Update video (protected)
router.put("/:id", protect, async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      uploader: req.user._id,
    });
    if (!video)
      return res
        .status(404)
        .json({ success: false, message: "Video not found or not authorized" });

    const { title, description, thumbnailUrl, category } = req.body;
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (thumbnailUrl) video.thumbnailUrl = thumbnailUrl;
    if (category) video.category = category;

    await video.save();
    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/videos/:id - Delete video (protected)
router.delete("/:id", protect, async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      uploader: req.user._id,
    });
    if (!video)
      return res
        .status(404)
        .json({ success: false, message: "Video not found or not authorized" });

    // Remove from channel
    await Channel.findByIdAndUpdate(video.channelId, {
      $pull: { videos: video._id },
    });
    await video.deleteOne();

    res.json({ success: true, message: "Video deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
