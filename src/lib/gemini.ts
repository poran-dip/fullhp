import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Gemini API key");
}

export const genAI = new GoogleGenAI({
  apiKey: apiKey,
});
