import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import problemService from '../../services/problemService/problemService';

const ManageProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- EDITING STATES ---
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // 1. Fetch Data
  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      const res = await problemService.getAllProblems();
      setProblems(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handlers
  const handleRemove = async (id) => {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      try {
        await problemService.deleteProblem(id);
        setProblems(problems.filter(p => p._id !== id)); // Update UI locally
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  // --- NEW: Toggle Publish State ---
  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await problemService.publishProblem(id);
      
      // Update UI locally
      setProblems(problems.map(p => 
        p._id === id ? { ...p, isPublished: !currentStatus } : p
      ));

    } catch (err) {
      console.error(err);
      alert("Failed to update publish status");
    }
  };

  const handleStartEdit = (problem) => {
    setEditId(problem._id);
    setEditValues({ ...problem }); // Copy data to temp state
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditValues({});
  };

  const handleSaveEdit = async (id) => {
    try {
      await problemService.updateProblem(id, {
        title: editValues.title,
        difficulty: editValues.difficulty,
        slug: editValues.slug
      });
      
      // Update UI locally
      setProblems(problems.map(p => (p._id === id ? { ...p, ...editValues } : p)));
      setEditId(null);
    } catch (err) {
      alert("Failed to update");
    }
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="p-10 text-white text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Problems</h1>
          <Link 
            to="/admin/add-problem" 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold transition"
          >
            <FiPlus /> Add New Problem
          </Link>
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-700 text-gray-300 border-b border-gray-600">
                <th className="p-4">Title</th>
                <th className="p-4">Slug (URL)</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => {
                const isEditing = editId === problem._id;

                return (
                  <tr key={problem._id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                    
                    {/* TITLE */}
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          name="title"
                          value={editValues.title}
                          onChange={handleChange}
                          className="bg-gray-900 border border-blue-500 rounded px-2 py-1 w-full text-white"
                        />
                      ) : (
                        <span className="font-medium text-lg">{problem.title}</span>
                      )}
                    </td>

                    {/* SLUG */}
                    <td className="p-4 text-gray-400 font-mono text-sm">
                      {isEditing ? (
                          <input
                           name="slug"
                           value={editValues.slug}
                           onChange={handleChange}
                           className="bg-gray-900 border border-blue-500 rounded px-2 py-1 w-full text-gray-300"
                          />
                      ) : (
                        problem.slug
                      )}
                    </td>

                    {/* DIFFICULTY */}
                    <td className="p-4">
                      {isEditing ? (
                        <select
                          name="difficulty"
                          value={editValues.difficulty}
                          onChange={handleChange}
                          className="bg-gray-900 border border-blue-500 rounded px-2 py-1 text-white"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                          ${problem.difficulty === 'easy' ? 'bg-green-900 text-green-400' : 
                            problem.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-400' : 
                            'bg-red-900 text-red-400'}`}>
                          {problem.difficulty}
                        </span>
                      )}
                    </td>

                    {/* STATUS (Shows if published or draft) */}
                    <td className="p-4 text-center">
                       <span className={`text-xs font-bold px-2 py-1 rounded ${problem.isPublished ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>
                          {problem.isPublished ? 'LIVE' : 'DRAFT'}
                       </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSaveEdit(problem._id)} className="text-green-500 hover:text-green-400" title="Save">
                              <FiCheck size={20} />
                            </button>
                            <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-400" title="Cancel">
                              <FiX size={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* PUBLISH TOGGLE BUTTON */}
                            <button 
                              onClick={() => handleTogglePublish(problem._id, problem.isPublished)}
                              className={`hover:scale-110 transition ${problem.isPublished ? 'text-blue-400 hover:text-blue-300' : 'text-gray-500 hover:text-gray-300'}`}
                              title={problem.isPublished ? "Unpublish" : "Publish"}
                            >
                               {problem.isPublished ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                            </button>

                            {/* EDIT BUTTON */}
                            <button onClick={() => handleStartEdit(problem)} className="text-gray-400 hover:text-yellow-400" title="Edit">
                              <FiEdit2 size={18} />
                            </button>

                            {/* DELETE BUTTON */}
                            <button onClick={() => handleRemove(problem._id)} className="text-gray-400 hover:text-red-500" title="Delete">
                              <FiTrash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

          {problems.length === 0 && !loading && (
             <div className="p-8 text-center text-gray-500">No problems found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProblems;