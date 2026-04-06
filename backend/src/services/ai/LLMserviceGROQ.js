// src/services/ai/LLMserviceGROQ.js
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateContent(messages) {
  
  if (!messages || !Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",  
    messages: messages, 
    temperature: 0.2,
  });

  return response.choices?.[0]?.message?.content ?? "";
}