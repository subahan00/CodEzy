import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiCode } from 'react-icons/fi'; // Added FiCode
import problemService from '../../services/problemService/problemService';
import toast from 'react-hot-toast'; // Use professional notifications

const AddProblem = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [form, setForm] = useState({
        title: '',
        slug: '',
        difficulty: 'Easy',
        description: ''
    });

    // Starter Code State (Boilerplate)
    const [starterCodes, setStarterCodes] = useState([
        { language: 'javascript', code: '// Write your JavaScript solution here\nfunction solution(input) {\n    return;\n}' },
        { language: 'python', code: '# Write your Python solution here\ndef solution(input):\n    pass' },
        { language: 'cpp', code: '// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};' }
    ]);

    // Dynamic Test Cases State
    const [testCases, setTestCases] = useState([
        { input: '', output: '' }
    ]);

    // --- Handlers ---

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        setForm({ ...form, title, slug });
    };

    const handleStarterCodeChange = (index, value) => {
        const newCodes = [...starterCodes];
        newCodes[index].code = value;
        setStarterCodes(newCodes);
    };

    // Test Case Handlers
    const handleTestCaseChange = (index, field, value) => {
        const newCases = [...testCases];
        newCases[index][field] = value;
        setTestCases(newCases);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: '', output: '' }]);
    };

    const removeTestCase = (index) => {
        if (testCases.length === 1) return;
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    // --- Submit Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                title: form.title,
                description: form.description,
                problemStatement: form.description,
                difficulty:
                    form.difficulty === "Easy" ? "beginner" :
                    form.difficulty === "Medium" ? "intermediate" :
                    "advanced",
                contentType: "challenge",
                slug: form.slug, // Ensure slug is sent
                examples: testCases.map(tc => ({
                    input: tc.input,
                    output: tc.output
                })),
                starterCode: starterCodes // <--- Send the templates to backend
            };

            await problemService.createProblem(payload);

            toast.success('Problem Created Successfully!');
            navigate('/problems');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create problem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-10 flex justify-center">
            <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">

                <h1 className="text-3xl font-bold mb-8 text-green-400 border-b border-gray-700 pb-4">
                    Add New Challenge
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* --- BASIC DETAILS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Problem Title</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleTitleChange}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-3 focus:border-green-500 focus:outline-none"
                                placeholder="e.g. Reverse Linked List"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Slug (URL)</label>
                            <input
                                name="slug"
                                value={form.slug}
                                onChange={handleInputChange}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-gray-400"
                                placeholder="auto-generated"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Difficulty</label>
                        <select
                            name="difficulty"
                            value={form.difficulty}
                            onChange={handleInputChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-3 focus:border-green-500 focus:outline-none"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Description (Markdown)</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleInputChange}
                            rows="5"
                            className="w-full bg-gray-900 border border-gray-700 rounded p-3 font-mono text-sm focus:border-green-500 focus:outline-none"
                            placeholder="Describe the problem..."
                            required
                        />
                    </div>

                    {/* --- STARTER CODE SECTION (NEW) --- */}
                    <div className="pt-4 border-t border-gray-700">
                        <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
                             <FiCode /> Starter Code Templates
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {starterCodes.map((template, index) => (
                                <div key={template.language} className="bg-gray-750 p-4 rounded border border-gray-700">
                                    <label className="text-sm font-bold text-blue-400 uppercase mb-2 block">
                                        {template.language} Template
                                    </label>
                                    <textarea
                                        value={template.code}
                                        onChange={(e) => handleStarterCodeChange(index, e.target.value)}
                                        className="w-full h-32 bg-gray-900 border border-gray-600 rounded p-2 text-xs font-mono text-gray-300 focus:border-blue-500 outline-none"
                                        placeholder={`Enter boilerplate code for ${template.language}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- TEST CASES SECTION --- */}
                    <div className="pt-6 border-t border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-200">Test Cases</h3>
                            <button
                                type="button"
                                onClick={addTestCase}
                                className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded transition"
                            >
                                <FiPlus /> Add Case
                            </button>
                        </div>

                        <div className="space-y-3">
                            {testCases.map((tc, index) => (
                                <div key={index} className="flex gap-4 items-start bg-gray-750 p-3 rounded border border-gray-700">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Input</label>
                                        <textarea
                                            value={tc.input}
                                            onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono h-20"
                                            placeholder='e.g. [1, 2, 3]'
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Expected Output</label>
                                        <textarea
                                            value={tc.output}
                                            onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono h-20"
                                            placeholder='e.g. [3, 2, 1]'
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeTestCase(index)}
                                        className="mt-6 text-gray-500 hover:text-red-500 transition"
                                        title="Remove Test Case"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- SUBMIT BUTTON --- */}
                    <div className="pt-6 border-t border-gray-700">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded font-bold text-lg transition
                                ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                        >
                            {loading ? 'Publishing...' : <><FiSave /> Publish Problem</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddProblem;