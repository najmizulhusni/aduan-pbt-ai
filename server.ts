import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON with a larger limit for images
app.use(express.json({ limit: "20mb" }));

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
      console.error("GEMINI_API_KEY is missing in environment");
      return res.status(500).json({ error: "Sistem AI belum dikonfigurasi di pelayan (API Key Missing)." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches) {
       return res.status(400).json({ error: "Invalid image format" });
    }

    const mimeType = matches[1];
    const imageData = matches[2];

    const locationContext = locationName ? `Lokasi: ${locationName}. ` : "";
    const userContext = userName ? `Pengirim: ${userName}. ` : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageData } },
          { text: `Sistem Identiti: Audit & Analisis Infrastruktur Awam Malaysia Pintar (AduanPBT.ai).
                   Konteks: Laporan untuk ${councilName}. ${locationContext} ${userContext} Tarikh: ${todayDate}.
                   
                   Tugasan Utama:
                   1. Analisis Kualiti Visual:
                      - Kenalpasti objek dalam imej. Jika ada kerosakan (jalan berlubang, lampu pecah, sampah sarap, longkang tersumbat), beri skor 1-10 mengikut tahap bahaya.
                      - JIKA PERSEKITARAN BERSIH & TERATUR: Beri skor 0. Ini bermakna PBT telah menjalankan kerja dengan baik.
                   
                   2. Carian Maklumat PBT (${councilName}):
                      - Cari emel rasmi aduan (biasanya aduan@... atau ssm@...).
                      - Cari no. khusus WhatsApp Aduan atau Hotline SISPAA yang betul.
                   
                   3. Penjana Dokumen:
                      - JIKA SKOR > 0: Jana 'Surat Aduan Rasmi' yang tegas, profesional, dan menuntut tindakan segera.
                      - JIKA SKOR == 0: Jana 'Surat Penghargaan' yang memuji kebersihan/kualiti kawasan tersebut. Berterima kasih kepada Majlis atas dedikasi mereka.
                      - Gunakan nama "${userName || 'Warga Prihatin'}" dalam tandatangan.
                   
                   MANDATORY JSON FORMAT:
                   {
                     "formalLetter": "Isi kandungan surat rasmi lengkap",
                     "emailTemplate": "Ringkasan padat untuk tindakan/penghargaan",
                     "contactInfo": { "email": "string", "whatsapp": "string", "website": "string", "phone": "string" },
                     "problemTitle": "Tajuk Profesional (Aduan Kerosakan VS Penghargaan Kebersihan)",
                     "department": "Jabatan Teknikal/Kebersihan/Landskap",
                     "severityScore": number,
                     "impactAnalysis": "Analisis risiko atau kualiti penyelenggaraan",
                     "technicalNotes": ["nota teknikal 1", "nota 2"]
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
    res.status(500).json({ error: error.message || "Gagal memproses data AI." });
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
