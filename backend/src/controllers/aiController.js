import { generateContent } from "../services/ai/LLMserviceGROQ.js";
// Assuming you renamed the function to getSystemPrompt as discussed, 
// or just use buildFeedbackPrompt() without passing the user prompt to it.
import { getSystemPrompt } from "../services/ai/buildFeedback.js";

export const askAI = async (req, res) => {
    console.log('req body:', req.body);

    // 1. Extract history (default to empty array) and code
    const { prompt, history = [], code, persona } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ message: "Prompt is required" });
    }

    try {
        // 2. Get the static System Rules (the "Gordon Ramsay" persona)
        const systemRules = getSystemPrompt(persona);

        // 3. Format the newest user message to include the code context
        const newestUserMessage = `
USER REQUEST: ${prompt}

CURRENT EDITOR CODE:
${code || "No code provided."}
        `.trim();

        // 4. Build the complete conversation array
        const messages = [
            { role: "system", content: systemRules }, // Rule setter
            ...history,                               // Past memory
            { role: "user", content: newestUserMessage } // New question
        ];

        // 5. Send the entire array to Groq
        const answer = await generateContent(messages);

        res.status(200).json({ answer });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ message: "Error generating content" });
    }
};