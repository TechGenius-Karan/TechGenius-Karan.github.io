import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Quote from "./models/Quote.js";
import OpenAI from "openai";
import axios from "axios";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

app.listen(5000, () => console.log("Server running on port 5000"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

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
    const quotes = await Quote.find({ category: new RegExp(`^${category}$`, "i") });
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



//AI route of the project

app.post("/ai-quote", async (req, res) => {
  try {
    const { category, topic } = req.body;

    if (!category || !topic) {
      return res.status(400).json({ error: "Category and topic required" });
    }

    const prompt = `Generate a short inspirational quote about ${topic} in the category of ${category}. Keep it under 25 words. Return only the quote.`;

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/HuggingFaceH4/zephyr-7b-beta",
      {
        inputs: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
      }
    );

    const aiQuote = response.data.generated_text || "AI could not generate a quote.";

    res.json({
      text: aiQuote.trim(),
      author: "AI",
    });

  } catch (error) {
    console.error("HF Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI generation failed" });
  }
});


app.post("/gemini-quote", async (req, res) => {
  try {
    const { phrase } = req.body;

    if (!phrase) {
      return res.status(400).json({ error: "Phrase required" });
    }

    const prompt = `Generate a short, original, and inspiring quote about "${phrase}". Make it feel like something a thought leader would say — specific, actionable, and memorable. Keep it under 25 words. Return only the quote text, no quotation marks, no attribution.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const aiQuote = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiQuote) {
      return res.status(500).json({ error: "Gemini returned no content" });
    }

    res.json({
      text: aiQuote.trim(),
      author: "Gemini AI",
    });

  } catch (error) {
    const detail = error.response?.data?.error?.message || error.message;
    console.error("Gemini Error:", detail);
    res.status(500).json({ error: detail });
  }
});


app.get("/routes-check", (req, res) => {
  res.send("AI route exists");
});




// Test data inserted for checking functionality of backend and frontend

// app.get("/seed", async (req, res) => {
//   await Quote.insertMany([
//   {
//     text: "Push yourself, because no one else is going to do it for you.",
//     author: "Unknown",
//     category: "motivation"
//   },
//   {
//     text: "Life is really simple, but we insist on making it complicated.",
//     author: "Confucius",
//     category: "wisdom"
//   },
//   {
//     text: "Success is not final, failure is not fatal.",
//     author: "Winston Churchill",
//     category: "success"
//   },
//   {
//     text: "The best way to get started is to quit talking and begin doing.",
//     author: "Walt Disney",
//     category: "motivation"
//   },
//   {
//     text: "Don’t let yesterday take up too much of today.",
//     author: "Will Rogers",
//     category: "life"
//   },
//   {
//     text: "It’s not whether you get knocked down, it’s whether you get up.",
//     author: "Vince Lombardi",
//     category: "motivation"
//   },
//   {
//     text: "If you are working on something exciting, it will keep you motivated.",
//     author: "Unknown",
//     category: "motivation"
//   },
//   {
//     text: "Success doesn’t come to you, you go to it.",
//     author: "Marva Collins",
//     category: "success"
//   },
//   {
//     text: "Life is like a box of chocolates, you never know what you're going to get.",
//     author: "Forrest Gump",
//     category: "life"
//   },
//   {
//     text: "If you are going through hell, keep going.",
//     author: "Winston Churchill",
//     category: "wisdom"
//   },
//   {
//     text: "If at first you don't succeed, try, try again.",
//     author: "William Edward Hickson",
//     category: "success"
//   },
//   {
//     text: "Life is about making an impact, not making an income.",
//     author: "Kevin Kruse",
//     category: "wisdom"
//   }
//   ]);

//   res.send("Database seeded");
// });


