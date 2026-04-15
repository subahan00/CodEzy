import { generateContent, evaluateCodeAnalysis, generateTestCasesFromAI } from "../services/ai/LLMserviceGROQ.js";
import { getSystemPrompt } from "../services/ai/buildFeedback.js";
import Content from "../models/Content.model.js"; // Adjust to your problem model

// ── ROUTE 1: THE SMART MENTOR CHAT (Modules 2, 3, 4, 5, 6) ──
export const askAI = async (req, res) => {
    // We added 'mode' here! Default is normal_chat.
    const { prompt, history = [], code, persona, mode = 'normal_chat' } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ message: "Prompt is required" });
    }

    try {
        // 1. Get the dynamic rules based on Persona + Mode
        const systemRules = getSystemPrompt(persona, mode);

        // 2. Format user message
        const newestUserMessage = `
USER REQUEST/QUESTION: ${prompt}

CURRENT EDITOR CODE:
${code || "No code provided."}
        `.trim();

        const messages = [
            { role: "system", content: systemRules },
            ...history,
            { role: "user", content: newestUserMessage }
        ];

        const answer = await generateContent(messages);
        res.status(200).json({ answer });
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ message: "Error generating mentor response" });
    }
};

export const generateTestCases = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: "Title and description required" });
        }

        // Call the service layer! No 'client is not defined' errors here.
        const testCasesArray = await generateTestCasesFromAI(title, description);

        res.status(200).json({ success: true, data: testCasesArray });

    } catch (error) {
        console.error("Test Case Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate test cases" });
    }
};
// ── ROUTE 2: THE JSON EVALUATOR (Module 1) ──
export const getCodeReportCard = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;

    if (!code || !problemId) {
      return res.status(400).json({ success: false, message: "Code and problemId required" });
    }

    // Fetch problem statement
    const problem = await Content.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    // Generate strict JSON analysis
    const analysisJson = await evaluateCodeAnalysis(code, problem.problemStatement, language);

    res.status(200).json({ success: true, data: analysisJson });

  } catch (error) {
    console.error("AI Evaluation Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate code analysis" });
  }
};