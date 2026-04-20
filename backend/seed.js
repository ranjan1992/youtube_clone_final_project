import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/User.model.js";
import Channel from "./src/models/Channel.model.js";
import Video from "./src/models/Video.model.js";

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await User.deleteMany({});
  await Channel.deleteMany({});
  await Video.deleteMany({});
  console.log("Cleared existing data");

  // Create users
  const password = await bcrypt.hash("password123", 12);
  const [john, jane] = await User.insertMany([
    { username: "JohnDoe", email: "john@example.com", password },
    { username: "JaneDoe", email: "jane@example.com", password },
  ]);
  console.log("Users created");

  // Create channels
  const [ch1, ch2] = await Channel.insertMany([
    {
      channelName: "Code with John",
      handle: "@CodeWithJohn",
      owner: john._id,
      description: "Coding tutorials and tech reviews by John Doe.",
      subscribers: 5200,
    },
    {
      channelName: "Jane's Tech",
      handle: "@JanesTech",
      owner: jane._id,
      description: "All things tech and programming.",
      subscribers: 3100,
    },
  ]);

  // Update users with their channels
  await User.findByIdAndUpdate(john._id, { channels: [ch1._id] });
  await User.findByIdAndUpdate(jane._id, { channels: [ch2._id] });
  console.log("Channels created");

  // Create videos
  const videoData = [
    {
      title: "Learn React in 30 Minutes",
      description: "A quick tutorial to get started with React.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnailUrl: "https://picsum.photos/seed/react/320/180",
      channelId: ch1._id,
      uploader: john._id,
      category: "Web Development",
      views: 15200,
    },
    {
      title: "JavaScript ES6+ Features Explained",
      description: "Modern JavaScript features you should know.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnailUrl: "https://picsum.photos/seed/js/320/180",
      channelId: ch1._id,
      uploader: john._id,
      category: "JavaScript",
      views: 8400,
    },
    {
      title: "Node.js & Express REST API Tutorial",
      description: "Build a complete REST API with Node.js and Express.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnailUrl: "https://picsum.photos/seed/node/320/180",
      channelId: ch1._id,
      uploader: john._id,
      category: "Server",
      views: 12000,
    },
    {
      title: "Data Structures: Arrays and Linked Lists",
      description: "Understanding fundamental data structures.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnailUrl: "https://picsum.photos/seed/ds/320/180",
      channelId: ch2._id,
      uploader: jane._id,
      category: "Data Structures",
      views: 6700,
    },
    {
      title: "Top Gaming Setup 2024",
      description: "My ultimate gaming setup tour.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnailUrl: "https://picsum.photos/seed/gaming/320/180",
      channelId: ch2._id,
      uploader: jane._id,
      category: "Gaming",
      views: 21000,
    },
    {
      title: "Lo-Fi Music Mix for Coding",
      description: "Relaxing lo-fi beats to help you focus.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnailUrl: "https://picsum.photos/seed/music/320/180",
      channelId: ch2._id,
      uploader: jane._id,
      category: "Music",
      views: 45000,
    },
    {
      title: "Breaking News: Tech Industry Updates",
      description: "Latest news from the tech world.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnailUrl: "https://picsum.photos/seed/news/320/180",
      channelId: ch1._id,
      uploader: john._id,
      category: "News",
      views: 3200,
    },
    {
      title: "MongoDB Full Course for Beginners",
      description: "Learn MongoDB from scratch with practical examples.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnailUrl: "https://picsum.photos/seed/mongo/320/180",
      channelId: ch1._id,
      uploader: john._id,
      category: "Education",
      views: 18500,
    },
  ];

  const videos = await Video.insertMany(videoData);

  // Link videos to channels
  await Channel.findByIdAndUpdate(ch1._id, {
    videos: videos
      .filter((v) => v.channelId.toString() === ch1._id.toString())
      .map((v) => v._id),
  });
  await Channel.findByIdAndUpdate(ch2._id, {
    videos: videos
      .filter((v) => v.channelId.toString() === ch2._id.toString())
      .map((v) => v._id),
  });

  console.log("Videos created");
  console.log("\n✅ Database seeded successfully!");
  console.log("Test credentials:");
  console.log("  Email: john@example.com | Password: password123");
  console.log("  Email: jane@example.com | Password: password123");
  mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
