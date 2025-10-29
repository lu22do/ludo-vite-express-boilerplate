import express from "express";
import 'dotenv/config';
import mongoose from "mongoose";
import ViteExpress from "vite-express";
import Item from "./models/Item.js";

const app = express();
// parse JSON and URL-encoded bodies so req.body is populated
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myViteAppDB";

console.log("Using MongoDB URI:", MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

app.get("/api/items", async (_, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.post('/api/items', async (req, res) => {
  console.log("POST /api/items called with body:", req.body);
  const newItem = new Item({
    name: req.body.name,
    quantity: req.body.quantity,
  });

  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error creating item" });
  }
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
