import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiCode, FiZap, FiLoader, FiX, FiCheckSquare, FiSquare } from 'react-icons/fi';
import problemService from '../../services/problemService/problemService';
import toast from 'react-hot-toast';

const AddProblem = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // ─── AI Modal States ─────────────────────────────────────────────
    const [isGeneratingTests, setIsGeneratingTests] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiGeneratedCases, setAiGeneratedCases] = useState([]); 

    // ─── Form State ──────────────────────────────────────────────────
    const [form, setForm] = useState({
        title: '',
        slug: '',
        difficulty: 'Easy',
        description: '',
        inputFormat: '',
        outputFormat: '',
        timeLimit: 2000,
        memoryLimit: 256,
        tags: [],
        constraints: []
    });

    const [constraintsInput, setConstraintsInput] = useState('');

    const [starterCodes, setStarterCodes] = useState([
        { language: 'javascript', code: '// Write your JavaScript solution here\nfunction solution(input) {\n    return;\n}' },
        { language: 'python', code: '# Write your Python solution here\ndef solution(input):\n    pass' },
        { language: 'cpp', code: '// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};' }
    ]);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    const [testCases, setTestCases] = useState([
        { input: '', output: '', explanation: '', isHidden: false }
    ]);

    // ─── Standard Handlers ───────────────────────────────────────────
    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
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

    const handleTestCaseChange = (index, field, value) => {
        const newCases = [...testCases];
        newCases[index][field] = value;
        setTestCases(newCases);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: '', output: '', explanation: '', isHidden: false }]);
    };

    const removeTestCase = (index) => {
        if (testCases.length === 1) return;
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    // ─── AI Test Case Handlers ───────────────────────────────────────
    const handleGenerateAITestCases = async () => {
        if (!form.title || !form.description) {
            return toast.error("Please enter a Title and Description first so the AI knows what to generate!");
        }

        setIsGeneratingTests(true);
        const tid = toast.loading("AI is thinking of edge cases...");

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:9999/api/ai/generate-tests', {
                title: form.title,
                description: form.description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Map the AI response and add a "selected: true" property to each
            const generated = res.data.data.map(tc => ({ ...tc, selected: true }));
            
            setAiGeneratedCases(generated);
            setShowAiModal(true); // Open the review modal
            toast.success("Test cases generated! Please review.", { id: tid });
            
        } catch (error) {
            console.error(error);
            toast.error("AI failed to generate test cases. Try again.", { id: tid });
        } finally {
            setIsGeneratingTests(false);
        }
    };

    const toggleAiCaseSelection = (index) => {
        const updated = [...aiGeneratedCases];
        updated[index].selected = !updated[index].selected;
        setAiGeneratedCases(updated);
    };

    const approveAiCases = () => {
        // Filter only the ones the user kept checked
        const selectedCases = aiGeneratedCases
            .filter(tc => tc.selected)
            .map(tc => ({ input: tc.input, output: tc.output, explanation: '', isHidden: true })); 

        // Clean up empty blanks in the existing main form
        const cleanedExisting = testCases.filter(tc => tc.input.trim() !== '' || tc.output.trim() !== '');
        
        // Merge them together
        setTestCases([...cleanedExisting, ...selectedCases]);
        
        // Close modal
        setShowAiModal(false);
        setAiGeneratedCases([]);
        toast.success(`Added ${selectedCases.length} test cases!`);
    };

    // ─── Submit Logic ────────────────────────────────────────────────
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
                slug: form.slug,
                tags: form.tags,
                inputFormat: form.inputFormat,
                outputFormat: form.outputFormat,
                constraints: form.constraints,
                timeLimit: Number(form.timeLimit) || 2000,
                memoryLimit: Number(form.memoryLimit) || 256,
                testCases: testCases.map(tc => ({
                    input: tc.input,
                    output: tc.output,
                    explanation: tc.explanation || '',
                    isHidden: tc.isHidden
                })),
                starterCode: starterCodes
            };

            await problemService.createProblem(payload);

            toast.success('Problem Created Successfully!');
            navigate('/admin/manage-problems'); // Redirects back to list
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create problem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-10 flex justify-center relative">
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
                        <label className="block text-gray-400 text-sm mb-2">Description / Problem Statement (Markdown)</label>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Input Format</label>
                            <textarea
                                name="inputFormat"
                                value={form.inputFormat}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm focus:border-green-500 focus:outline-none"
                                placeholder="e.g. The first line contains an integer T..."
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Output Format</label>
                            <textarea
                                name="outputFormat"
                                value={form.outputFormat}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm focus:border-green-500 focus:outline-none"
                                placeholder="e.g. For each test case, output a single line..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className='block text-gray-400 text-sm mb-2'>Constraints</label>
                            <textarea
                                name="constraints"
                                value={constraintsInput}
                                onChange={(e)=>{
                                    setConstraintsInput(e.target.value);
                                    setForm({ ...form, constraints: e.target.value.split('\n').map(c => c.trim()).filter(Boolean) });
                                }}
                                rows="3"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-3 font-mono text-sm focus:border-green-500 focus:outline-none"
                                placeholder="1 <= N <= 10^5 (One per line)"
                            />
                        </div>
                        <div>
                            <label className='block text-gray-400 text-sm mb-2'>Tags</label>
                            <textarea
                                name="tags"
                                value={tagInput}
                                onChange={(e)=>{
                                    setTagInput(e.target.value);
                                    setForm({ ...form, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) });
                                }}
                                rows="3"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-3 font-mono text-sm focus:border-green-500 focus:outline-none"
                                placeholder="Arrays, Strings, Hash Table (comma separated)"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Time Limit (ms)</label>
                            <input
                                type="number"
                                name="timeLimit"
                                value={form.timeLimit}
                                onChange={handleInputChange}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-3 focus:border-green-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Memory Limit (MB)</label>
                            <input
                                type="number"
                                name="memoryLimit"
                                value={form.memoryLimit}
                                onChange={handleInputChange}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-3 focus:border-green-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    

                    {/* --- STARTER CODE SECTION --- */}
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
                            <div className="flex gap-3">
                                {/* NEW AI BUTTON */}
                                <button
                                    type="button"
                                    onClick={handleGenerateAITestCases}
                                    disabled={isGeneratingTests}
                                    className="flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-3 py-1.5 rounded transition font-bold"
                                >
                                    {isGeneratingTests ? <FiLoader className="animate-spin" /> : <FiZap />} 
                                    Auto-Generate (AI)
                                </button>

                                <button
                                    type="button"
                                    onClick={addTestCase}
                                    className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded transition"
                                >
                                    <FiPlus /> Add Manual Case
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {testCases.map((tc, index) => (
                                <div key={index} className="flex flex-col gap-3 bg-gray-750 p-3 rounded border border-gray-700">
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">Input</label>
                                            <textarea
                                                value={tc.input}
                                                onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono h-20 focus:border-green-500 focus:outline-none"
                                                placeholder='e.g. [1, 2, 3]'
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">Expected Output</label>
                                            <textarea
                                                value={tc.output}
                                                onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono h-20 focus:border-green-500 focus:outline-none"
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
                                    <div className="flex gap-4 items-center">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">Explanation (Optional)</label>
                                            <input
                                                value={tc.explanation || ''}
                                                onChange={(e) => handleTestCaseChange(index, 'explanation', e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm focus:border-green-500 focus:outline-none"
                                                placeholder='Explain the test case...'
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 ml-2">
                                            <input 
                                                type="checkbox" 
                                                checked={tc.isHidden} 
                                                onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                                                className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded"
                                            />
                                            <label className="text-sm font-medium text-gray-300">Hidden Test Case</label>
                                        </div>
                                    </div>
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

            {/* ─── AI REVIEW MODAL OVERLAY ─────────────────────────────────── */}
            {showAiModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-gray-800 w-full max-w-3xl rounded-xl border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <FiZap className="text-purple-400" /> Review Generated Cases
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">Deselect any test cases that look incorrect or irrelevant.</p>
                            </div>
                            <button onClick={() => setShowAiModal(false)} className="text-gray-500 hover:text-white transition">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable list of cases) */}
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            {aiGeneratedCases.map((tc, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => toggleAiCaseSelection(index)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all flex gap-4
                                        ${tc.selected 
                                            ? 'bg-purple-900/20 border-purple-500' 
                                            : 'bg-gray-900 border-gray-700 opacity-50'}`}
                                >
                                    {/* Custom Checkbox */}
                                    <div className="pt-1">
                                        {tc.selected ? <FiCheckSquare size={20} className="text-purple-400" /> : <FiSquare size={20} className="text-gray-500" />}
                                    </div>
                                    
                                    {/* Input/Output Display */}
                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1 block">Input</span>
                                            <div className="bg-black/50 p-2 rounded font-mono text-sm text-gray-300 break-all">{tc.input}</div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1 block">Expected Output</span>
                                            <div className="bg-black/50 p-2 rounded font-mono text-sm text-gray-300 break-all">{tc.output}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-700 flex justify-end gap-3 bg-gray-800/50 rounded-b-xl">
                            <button 
                                onClick={() => setShowAiModal(false)}
                                className="px-5 py-2 rounded font-bold text-gray-400 hover:text-white hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={approveAiCases}
                                className="px-5 py-2 rounded font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-600/20"
                            >
                                Approve Selected ({aiGeneratedCases.filter(c => c.selected).length})
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AddProblem;