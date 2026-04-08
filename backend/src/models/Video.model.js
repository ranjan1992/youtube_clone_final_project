import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: [true, "Video URL is required"] },
    thumbnailUrl: { type: String, default: "" },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "All",
        "Web Development",
        "JavaScript",
        "Data Structures",
        "Server",
        "Music",
        "Gaming",
        "News",
        "Sports",
        "Education",
      ],
      default: "All",
    },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { timestamps: true },
);

const Video = mongoose.model("Video", videoSchema);
export default Video;
