import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiCode, FiArrowLeft } from 'react-icons/fi';
import problemService from '../../services/problemService/problemService';
import toast from 'react-hot-toast';

const EditProblem = () => {
    const { id } = useParams(); // Get the problem ID from the URL
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form State
    const [form, setForm] = useState({
        title: '',
        slug: '',
        difficulty: 'Easy',
        description: ''
    });

    const [starterCodes, setStarterCodes] = useState([]);
    const [testCases, setTestCases] = useState([]);

    // --- Fetch Existing Data ---
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                // Assuming your service has a getProblemById or you use getProblemBySlug
                const response = await problemService.getProblemById(id); 
                const data = response.data.data;
                console.log('problem data',data);
                // Map database difficulty back to UI format
                const uiDifficulty = 
                    data.difficulty === 'beginner' ? 'Easy' : 
                    data.difficulty === 'intermediate' ? 'Medium' : 
                    'Hard';

                setForm({
                    title: data.title,
                    slug: data.slug,
                    difficulty: uiDifficulty,
                    description: data.problemStatement || data.description || ''
                });

                if (data.starterCode && data.starterCode.length > 0) {
                    setStarterCodes(data.starterCode);
                }

                if (data.examples && data.examples.length > 0) {
                    setTestCases(data.examples);
                } else {
                    setTestCases([{ input: '', output: '' }]); // Fallback
                }
            } catch (error) {
                console.error("Error fetching problem:", error);
                toast.error("Failed to load problem data.");
                navigate('/admin/problems'); // Kick back to list if not found
            } finally {
                setFetching(false);
            }
        };

        fetchProblem();
    }, [id, navigate]);

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
                slug: form.slug,
                examples: testCases.map(tc => ({
                    input: tc.input,
                    output: tc.output
                })),
                starterCode: starterCodes
            };

            await problemService.updateProblem(id, payload);

            toast.success('Problem Updated Successfully!');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update problem');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="min-h-screen bg-gray-900 flex justify-center items-center text-green-400 font-mono">Loading Problem Data...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-10 flex justify-center">
            <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">

                <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-8">
                    <h1 className="text-3xl font-bold text-yellow-400">
                        Edit Challenge
                    </h1>
                    <Link to="/admin/problems" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                        <FiArrowLeft /> Back to List
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* --- BASIC DETAILS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Problem Title</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleTitleChange}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-3 focus:border-yellow-500 focus:outline-none"
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
                            className="w-full bg-gray-900 border border-gray-700 rounded p-3 focus:border-yellow-500 focus:outline-none"
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
                            className="w-full bg-gray-900 border border-gray-700 rounded p-3 font-mono text-sm focus:border-yellow-500 focus:outline-none"
                            required
                        />
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
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Expected Output</label>
                                        <textarea
                                            value={tc.output}
                                            onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono h-20"
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
                                ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-500 text-white'}`}
                        >
                            {loading ? 'Saving Changes...' : <><FiSave /> Update Problem</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditProblem;