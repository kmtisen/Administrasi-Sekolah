import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Initialize Google GenAI
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
    timestamp: new Date().toISOString(),
  });
});

// Gemini AI Generator Endpoint
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, systemInstruction, temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: "GEMINI_API_KEY is not configured or in sandbox mode. Using high-fidelity intelligent template engine.",
        content: null,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "Anda adalah pakar kurikulum pendidikan Indonesia, spesialis Kurikulum Merdeka dan Kurikulum Berbasis Cinta (KBC) dengan integrasi PPRA. Selalu buat dokumen administrasi guru yang sangat terstruktur, lengkap, akademis, dan siap cetak.",
        temperature: Number(temperature) || 0.7,
      },
    });

    const textOutput = response.text || "";
    return res.json({
      success: true,
      text: textOutput,
      fallback: false,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate AI content",
      fallback: true,
    });
  }
});

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
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
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
