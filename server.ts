import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with a larger limit for images
app.use(express.json({ limit: "10mb" }));

// AI Logic
async function generateComplaint(base64Image: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Extract mime type and data from data URL
  const matches = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid image format. Expected a base64 data URL.");
  }

  const mimeType = matches[1];
  const imageData = matches[2];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: imageData,
          },
        },
        {
          text: "You are an expert Malaysian civic officer. Analyze this image of a public infrastructure issue. Identify the core problem, determine the correct local council department (e.g., Jabatan Kejuruteraan), and write a highly formal, polite, and urgent Surat Rasmi (official complaint letter) in proper Bahasa Melayu, leaving placeholders like [Your Name] and [Location]. Keep it concise.",
        },
      ],
    },
  });

  return response.text;
}

// API Routes
app.post("/api/generate", async (req, res) => {
  res.status(405).json({ error: "Please use frontend generation for Gemini API" });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
