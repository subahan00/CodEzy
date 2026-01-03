import { generateContent } from "../services/ai/LLMserviceGROQ.js";
import { buildFeedbackPrompt } from "../services/ai/buildFeedback.js";

export const askAI = async (req, res) => {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ message: "Prompt is required" });
    }

    try {
        const formattedPrompt = buildFeedbackPrompt(prompt); 

        const answer = await generateContent(formattedPrompt);

        res.status(200).json({ answer });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ message: "Error generating content" });
    }
};
