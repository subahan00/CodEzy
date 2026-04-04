import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "openrouter/free",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryModel(model, messages) {
  try {
    const res = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.4,
    });

    return res.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    // retry once if rate limited
    if (err.status === 429) {
      console.warn(`Rate limited on ${model}, retrying...`);
      await sleep(2000);

      try {
        const retry = await client.chat.completions.create({
          model,
          messages,
          temperature: 0.4,
        });
        return retry.choices?.[0]?.message?.content ?? "";
      } catch (e) {
        console.warn(`Retry failed on ${model}`);
      }
    }

    console.warn(`Model failed: ${model}`);
    return null;
  }
}

export async function generateContent(messages) {
  if (!messages || !Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  for (const model of MODELS) {
    const result = await tryModel(model, messages);
    if (result) return result;
  }

  throw new Error("All models failed");
}