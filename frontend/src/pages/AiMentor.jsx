// Example React component
import { useState } from "react";
import axios from "axios";

function AiMentor() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      setAnswer("");
      const token = localStorage.getItem("token");
      console.log("Prompt sent:", prompt);
      console.log("Using token:", token);
      const res = await axios.post("http://localhost:9999/api/ai/ask", { prompt }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
      setAnswer("Error: Unable to get response from AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <textarea
        className="w-full border rounded p-2"
        rows={4}
        placeholder="Ask your placement / DSA / interview question..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={handleAsk}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
      >
        {loading ? "Thinking..." : "Ask Codezy AI"}
      </button>

      {answer && (
        <div className="mt-4 border rounded p-3 bg-gray-900 text-gray-100 whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </div>
  );
}

export default AiMentor;
