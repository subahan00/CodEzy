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
export async function generateTestCasesFromAI(title, description) {
  if (!title || !description) throw new Error("Title and description required.");

  const prompt = `
You are an expert Competitive Programming Problem Setter creating test cases for a coding challenge.

PROBLEM TITLE: ${title}
PROBLEM DESCRIPTION:
${description}

INSTRUCTIONS:
Generate exactly 50 test cases for this problem. 
Include 30 standard cases and 20 tricky edge cases (e.g., empty inputs, negative numbers, zeroes, massive numbers).
You MUST return ONLY a valid JSON object containing a "testCases" array. Do not include markdown formatting or conversational text.

EXPECTED JSON SCHEMA:
{
  "testCases": [
    { "input": "<string representation of input>", "output": "<string representation of expected output>" },
    { "input": "<...>", "output": "<...>" }
  ]
}
  `.trim();

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: prompt }],
    temperature: 0.2, 
    response_format: { type: "json_object" }, // Forces a root object {...}
  });

  const content = response.choices?.[0]?.message?.content ?? "{}";
  const parsedContent = JSON.parse(content);
  
  // Return just the array to the controller
  return parsedContent.testCases || []; 
}
// ── 4. FAILURE CLASSIFIER (Layer 2 Enrichment) ──
export async function classifyFailureReason(code, problemStatement, language, verdict) {
    // If it's a syntax/compile error, we don't need AI. We know what it is.
    if (verdict === 'compile-error') return { category: 'syntax_error', detail: 'Compilation failed' };

    const prompt = `
You are an expert Code Reviewer. A student submitted ${language} code that received a "${verdict}" verdict.

PROBLEM:
${problemStatement}

STUDENT CODE:
${code}

INSTRUCTIONS:
Analyze the code and categorize the primary reason for failure. 
You MUST return ONLY a valid JSON object. Do not include markdown formatting.

EXPECTED JSON SCHEMA:
{
  "category": "<MUST BE EXACTLY ONE OF: 'logic_error', 'edge_case', 'inefficient_algo', 'misunderstood_requirements'>",
  "detail": "<1 short sentence explaining exactly what line or concept caused the failure>"
}
    `.trim();

    try {
        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.1, // Strict and analytical
            response_format: { type: "json_object" }, 
        });

        const content = response.choices?.[0]?.message?.content ?? "{}";
        return JSON.parse(content);
    } catch (error) {
        console.error("AI Classification Failed, falling back to Layer 1:", error.message);
        // Fallback safety: If Groq times out, just return the raw verdict category
        return { category: verdict, detail: "System could not perform deep analysis." };
    }
}