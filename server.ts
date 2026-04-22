import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON with a larger limit for images
app.use(express.json({ limit: "10mb" }));

// API Heartbeat
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// AI Proxy Route
app.post("/api/generate", async (req, res) => {
  try {
    const { image, councilName, locationName, userName, todayDate } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches) {
       return res.status(400).json({ error: "Invalid image format" });
    }

    const mimeType = matches[1];
    const imageData = matches[2];

    const locationContext = locationName ? `Location: ${locationName}. ` : "";
    const userContext = userName ? `Pengirim: ${userName}. ` : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageData } },
          { text: `Sistem Identiti: Audit & Analisis Infrastruktur Awam Malaysia Pintar.
                   Konteks: Laporan untuk ${councilName}. ${locationContext} ${userContext} Tarikh: ${todayDate}.
                   
                   Tugasan Utama (Dwi-Mod: Aduan atau Penghargaan):
                   1. Analisis Kualiti Visual: Teliti imej dengan mendalam. 
                      - Jika ada kerosakan (jalan berlubang, lampu rosak, sampah), beri skor 1-10.
                      - Jika persekitaran BERSIH, TERATUR, dan CANTIK, beri skor 0.
                   
                   2. Carian Hubungan Tepat: Gunakan Google Search untuk mencari:
                      - Emel Rasmi Aduan ${councilName} (pastikan domain .gov.my yang betul).
                      - No. WhatsApp Aduan / Talian Hotline khusus untuk aduan awam.
                      - Laman web rasmi jabatan aduan.
                   
                   3. Penjanaan Dokumen Profesional:
                      - JIKA SKOR > 0: Jana 'Surat Kiriman Rasmi' (Aduan) yang tegas.
                      - JIKA SKOR == 0: Jana 'Surat Penghargaan/Pujian' (Commendation) kepada PBT kerana mengekalkan kebersihan atau kualiti infrastruktur. Puji hasil kerja Majlis dalam menjaga kawasan tersebut.
                      - Gunakan nama "${userName || '[NAMA ANDA]'}" dalam tandatangan. JANGAN guna "Audit Manager".
                   
                   4. Nota Teknikal & Impak:
                      - JIKA SKOR > 0: Fokus pada risiko keselamatan.
                      - JIKA SKOR == 0: Fokus pada kualiti bahan atau estetika yang dikekalkan dengan baik.
                   
                   Return ONLY a valid JSON:
                   {
                     "formalLetter": "string (Surat Rasmi lengkap)",
                     "emailTemplate": "string (Ringkasan emel)",
                     "contactInfo": { "email": "string", "whatsapp": "string", "website": "string", "phone": "string" },
                     "problemTitle": "Tajuk Profesional (Aduan atau Penghargaan)",
                     "department": "Jabatan Bertanggungjawab",
                     "severityScore": number (0-10),
                     "impactAnalysis": "Analisis kualiti atau risiko",
                     "technicalNotes": ["nota 1", "nota 2", "nota 3"]
                   }` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Dev: Vite middleware attached");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Fallback all routes to index.html for SPA
    app.get("*", (req, res) => {
      // Check if the path requested is an API route or file (usually handled by express.static)
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Prod: Serving static files from dist/");
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
