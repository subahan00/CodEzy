// src/services/ai/LLMserviceGROQ.js
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateContent(messages) {
  // Validate that we are receiving an array of messages (history)
  if (!messages || !Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",  
    messages: messages, // Pass the entire conversation history here
    temperature: 0.2,
  });

  return response.choices?.[0]?.message?.content ?? "";
}