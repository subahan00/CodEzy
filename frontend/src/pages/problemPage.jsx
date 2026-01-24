import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
 import CodeEditor from '../component/editor/CodeEditor';
import ProblemDescription from '../component/problem/ProblemDescription';
import { useEffect } from 'react';
import problemService from '../services/problemService/problemService';

const ProblemPage = () => {
    const { slug } = useParams(); // We will get the problem slug and ID from URL
    const [problem, setProblem] = useState(null); // Placeholder problem state
    // State to store the user's code
    const [code, setCode] = useState("// Write your code here...");
    const [language, setLanguage] = useState("python");
useEffect(() => {
    const fetchProblemDetails = async () => {
        try {
            const response = await problemService.getProblemBySlug(slug);

            setProblem(response.data.data);
        } catch (error) {
            console.error('Failed to fetch problem:', error);
        }
    };

    fetchProblemDetails();
}, [slug]);

if (!problem) {
    return <div className="text-white p-4">Loading problem...</div>;
}

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">

            {/* LEFT SIDE: Problem Description */}
            <div className="w-1/2 h-full overflow-y-auto border-r border-gray-700 p-4">
                {/* We will build this component next */}
                <ProblemDescription problem={problem} />
            </div>

            {/* RIGHT SIDE: Code Editor */}
            <div className="w-1/2 h-full flex flex-col">
                <CodeEditor
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={setLanguage}
                    problemId={problem._id} // <--- CRITICAL: Pass the ID here
                />
            </div>
        </div>
        
    );
};

export default ProblemPage;