import express from "express";
import Video from "../models/Video.model.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/comments/:videoId - Add comment
router.post("/:videoId", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res
        .status(400)
        .json({ success: false, message: "Comment text required" });

    const video = await Video.findById(req.params.videoId);
    if (!video)
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });

    const comment = { userId: req.user._id, text };
    video.comments.push(comment);
    await video.save();

    const updatedVideo = await Video.findById(req.params.videoId).populate(
      "comments.userId",
      "username avatar",
    );

    const newComment = updatedVideo.comments[updatedVideo.comments.length - 1];
    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
