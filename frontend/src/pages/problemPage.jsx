import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../component/editor/CodeEditor';
import ProblemDescription from '../component/problem/ProblemDescription';
import problemService from '../services/problemService/problemService';

const ProblemPage = () => {
    const { slug } = useParams();
    const [problem, setProblem] = useState(null);

    // Editor State
    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState("// Loading starter code...");
    const [lastExecutionResult, setLastExecutionResult] = useState(null);
    useEffect(() => {
        const fetchProblemDetails = async () => {
            try {
                const response = await problemService.getProblemBySlug(slug);
                const problemData = response.data.data;
                setProblem(problemData);

                // --- AUTO-FILL STARTER CODE ---
                // Try to find code for current language (e.g. python)
                const starter = problemData.starterCode?.find(sc => sc.language === language);
                if (starter) {
                    setCode(starter.code);
                } else {
                    setCode("// Write your code here...");
                }

            } catch (error) {
                console.error('Failed to fetch problem:', error);
                setCode("// Error loading problem code.");
            }
        };

        fetchProblemDetails();
    }, [slug]); // Re-run if slug changes. Note: We don't depend on language here to avoid reset loops.

    // --- HANDLE LANGUAGE CHANGE ---
    // When user swaps language in Editor, we must swap the template
    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);

        if (problem && problem.starterCode) {
            const template = problem.starterCode.find(sc => sc.language === newLang);
            if (template) {
                // Optional: Prompt user if they have written code they might lose?
                // For now, we auto-switch for smoother experience.
                setCode(template.code);
            } else {
                setCode("// No starter code available for this language.");
            }
        }
    };

    if (!problem) {
        return <div className="text-white p-10 text-center animate-pulse">Loading problem context...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">

            {/* LEFT SIDE: Problem Description */}
            <div className="w-1/2 h-full overflow-y-auto border-r border-gray-700 p-4 scrollbar-thin scrollbar-thumb-gray-700">
                <ProblemDescription problem={problem} 
                    currentCode={code} language={language} executionResult={lastExecutionResult}
                    />
            </div>

            {/* RIGHT SIDE: Code Editor */}
            <div className="w-1/2 h-full flex flex-col">
                <CodeEditor
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={handleLanguageChange} // Pass our smart handler
                    problemId={problem._id}
                />
            </div>
        </div>
    );
};

export default ProblemPage;