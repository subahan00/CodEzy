import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── FOR MODULES 2-6 (Conversational Mentor) ──
export async function generateContent(messages) {
  if (!messages || !Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",  
    messages: messages, 
    temperature: 0.3, // Slightly creative for persona
  });

  return response.choices?.[0]?.message?.content ?? "";
}

// ── FOR MODULE 1 (Post-Submission JSON Report) ──
export async function evaluateCodeAnalysis(code, problemStatement, language) {
  if (!code || !problemStatement) throw new Error("Code and problem required.");

  const evaluationPrompt = `
You are an expert Senior Staff Software Engineer grading a ${language} submission.

PROBLEM STATEMENT:
${problemStatement}

USER CODE:
${code}

INSTRUCTIONS:
You MUST return ONLY a valid JSON object. Do NOT include markdown formatting like \`\`\`json. 

EXPECTED JSON SCHEMA:
{
  "overallScore": <Number between 0-100 based on efficiency and style>,
  "timeComplexity": "<String, e.g., 'O(N)'>",
  "spaceComplexity": "<String, e.g., 'O(1)'>",
  "efficiency": {
    "status": "<'Excellent', 'Good', or 'Needs Improvement'>",
    "feedback": "<1 short sentence>"
  },
  "readability": {
    "status": "<'Excellent', 'Good', or 'Needs Improvement'>",
    "feedback": "<1 short sentence>"
  },
  "suggestions": ["<Actionable tip 1>", "<Actionable tip 2>"]
}
  `.trim();

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: evaluationPrompt }],
    temperature: 0.1, // Strict, deterministic
    response_format: { type: "json_object" }, // Forces valid JSON
  });

  const content = response.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}