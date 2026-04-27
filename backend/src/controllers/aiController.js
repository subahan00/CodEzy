import { generateContent, evaluateCodeAnalysis, generateTestCasesFromAI } from "../services/ai/LLMserviceGROQ.js";
import { getGeneralChatPrompt, getMentorPrompt, buildMentorMessage } from "../services/ai/buildFeedback.js";
import Content from "../models/Content.model.js";


// ════════════════════════════════════════════════════════════════════════════
// ROUTE 1 — GENERAL CHAT
// POST /ai/chat
//
// Pure free conversation. Zero code context. Zero problem awareness.
// The LLM receives ONLY the system prompt + conversation history + user message.
// It physically cannot reference the user's code because we never send it.
//
// Body: { prompt, history?, persona? }
// ════════════════════════════════════════════════════════════════════════════
export const generalChat = async (req, res) => {
    const { prompt, history = [], persona } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ message: "Prompt is required" });
    }

    try {
        const systemPrompt = getGeneralChatPrompt(persona);

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user',   content: prompt.trim() },
        ];

        // High temperature — natural, warm, conversational tone
        const answer = await generateContent(messages, 'general_chat');

        res.status(200).json({ answer });

    } catch (error) {
        console.error("General Chat Error:", error);
        res.status(500).json({ message: "Error generating chat response" });
    }
};


// ════════════════════════════════════════════════════════════════════════════
// ROUTE 2 — CODE MENTOR
// POST /ai/mentor
//
// Full mentor mode with problem + code context always present.
// Never gives away the solution. Guides, challenges, nudges.
//
// Body: {
//   prompt,            — what the user is asking
//   history?,          — conversation history
//   persona?,          — mentor persona string
//   mode?,             — hint | error_explanation | pre_eval | edge_case |
//                         complexity | concept        (default: hint)
//   code?,             — current editor code
//   problemId?,        — MongoDB ObjectId (fetches title + statement)
//   errorOutput?,      — compiler/runtime error text
// }
// ════════════════════════════════════════════════════════════════════════════
export const codeMentor = async (req, res) => {
    const {
        prompt,
        history = [],
        persona,
        mode = 'hint',
        code,
        problemId,
        errorOutput,
    } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ message: "Prompt is required" });
    }

    try {
        // Fetch problem title + statement if a problemId was given
        let problemTitle = null;
        let problemStatement = null;

        if (problemId) {
            try {
                const problem = await Content.findById(problemId)
                    .select('title problemStatement')
                    .lean();
                if (problem) {
                    problemTitle = problem.title;
                    problemStatement = problem.problemStatement;
                }
            } catch {
                // Non-fatal — proceed without DB context
            }
        }

        const systemPrompt = getMentorPrompt(persona, mode);

        const userMessage = buildMentorMessage({
            prompt,
            code,
            problemTitle,
            problemStatement,
            errorOutput,
        });

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user',   content: userMessage },
        ];

        // Lower temperature — precise, analytical mentor guidance
        const answer = await generateContent(messages, mode);

        res.status(200).json({ answer });

    } catch (error) {
        console.error("Code Mentor Error:", error);
        res.status(500).json({ message: "Error generating mentor response" });
    }
};


// ════════════════════════════════════════════════════════════════════════════
// ROUTE 3 — TEST CASE GENERATOR
// POST /ai/generate-tests
// ════════════════════════════════════════════════════════════════════════════
export const generateTestCases = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: "Title and description required" });
        }

        const testCasesArray = await generateTestCasesFromAI(title, description);
        res.status(200).json({ success: true, data: testCasesArray });

    } catch (error) {
        console.error("Test Case Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate test cases" });
    }
};


// ════════════════════════════════════════════════════════════════════════════
// ROUTE 4 — POST-SUBMISSION CODE REPORT CARD
// POST /ai/evaluate
// ════════════════════════════════════════════════════════════════════════════
export const getCodeReportCard = async (req, res) => {
    try {
        const { code, language, problemId } = req.body;

        if (!code || !problemId) {
            return res.status(400).json({ success: false, message: "Code and problemId required" });
        }

        const problem = await Content.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        const analysisJson = await evaluateCodeAnalysis(code, problem.problemStatement, language);
        res.status(200).json({ success: true, data: analysisJson });

    } catch (error) {
        console.error("AI Evaluation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate code analysis" });
    }
};


// ── Legacy alias (keeps old /ask route working during transition) ─────────────
export const askAI = generalChat;