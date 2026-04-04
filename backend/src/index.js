import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Youtube Clone API is running" });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
