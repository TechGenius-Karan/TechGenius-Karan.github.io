import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Quote from "./models/Quote.js";

const app = express();
app.use(cors());
app.use(express.json());

app.listen(5000, () => console.log("Server running on port 5000"));


dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get("/quotes", async (req, res) => {
	try {
		const quotes = await Quote.find();
		res.json(quotes)
	} catch(err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/quotes/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const quotes = await Quote.find({ category });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/quotes", async (req, res) => {
  try {
    const quote = await Quote.create(req.body);
    res.status(201).json(quote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/seed", async (req, res) => {
  await Quote.insertMany([
    {
      text: "Push yourself, because no one else is going to do it for you.",
      author: "Unknown",
      category: "Motivation"
    },
    {
      text: "Life is really simple, but we insist on making it complicated.",
      author: "Confucius",
      category: "Life"
    },
    {
      text: "Success is not final, failure is not fatal.",
      author: "Winston Churchill",
      category: "Success"
    }
  ]);

  res.send("Database seeded");
});


