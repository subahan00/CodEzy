// src/services/ai/LLMserviceGROQ.js
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateContent(prompt) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt must be a non-empty string");
  }
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",  
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return response.choices?.[0]?.message?.content ?? "";
}
