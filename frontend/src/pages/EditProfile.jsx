import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLink, FiGithub, FiLinkedin, FiSave, FiArrowLeft, FiImage, FiTerminal } from 'react-icons/fi';
import toast from 'react-hot-toast';
import profileService from '../services/userService/profileService';
const EditProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Initialize form with data from localStorage
    const [form, setForm] = useState({
        avatar: '',
        bio: '',
        github: '',
        linkedin: ''
    });

    const [userContext, setUserContext] = useState({});

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        setUserContext(storedUser);
        setForm({
            avatar: storedUser.avatar || '',
            bio: storedUser.bio || '',
            github: storedUser.socialLinks?.github || '',
            linkedin: storedUser.socialLinks?.linkedin || ''
        });
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await profileService.updateProfile(form);

            const updatedUser = res.data.data;

            // ── CRITICAL: Update LocalStorage so the rest of the app knows ──
            const newLocalStorageUser = { ...userContext, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(newLocalStorageUser));

            toast.success("Configuration updated successfully!");
            navigate('/profile'); // Send them back to their profile
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#06040f] text-gray-200 p-6 md:p-10 flex justify-center items-center font-sans relative">
            
            {/* Background Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-2xl bg-[#0b0914] p-8 rounded-2xl border border-gray-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
                
                <div className="flex items-center justify-between border-b border-gray-800/60 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                            <FiTerminal className="text-indigo-500" /> User Configuration
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 font-mono tracking-widest uppercase">Update your global identity</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2 text-gray-500 hover:text-indigo-400 transition-colors text-sm font-bold uppercase tracking-widest">
                        <FiArrowLeft /> Abort
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Immutable Data (Read Only) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                        <div>
                            <label className="block text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Username</label>
                            <input 
                                value={userContext.username || 'System User'} 
                                disabled 
                                className="w-full bg-[#161423] border border-gray-800 rounded-lg p-3 text-gray-400 cursor-not-allowed font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Email</label>
                            <input 
                                value={userContext.email || 'hidden@system.com'} 
                                disabled 
                                className="w-full bg-[#161423] border border-gray-800 rounded-lg p-3 text-gray-400 cursor-not-allowed font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="h-[1px] w-full bg-gray-800/50 my-6"></div>

                    {/* Mutable Data */}
                    <div>
                        <label className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest font-bold mb-2">
                            <FiImage /> Avatar URL
                        </label>
                        <input
                            name="avatar"
                            value={form.avatar}
                            onChange={handleChange}
                            placeholder="https://example.com/my-avatar.png"
                            className="w-full bg-[#06040f] border border-gray-800 rounded-lg p-3 text-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                        />
                        {form.avatar && (
                            <div className="mt-3 flex items-center gap-3 bg-[#161423] p-3 rounded-lg border border-gray-800 w-max">
                                <img src={form.avatar} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Live Preview</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest font-bold mb-2">
                            <FiUser /> Developer Bio
                        </label>
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Full-stack developer building the future..."
                            className="w-full bg-[#06040f] border border-gray-800 rounded-lg p-3 text-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest font-bold mb-2">
                                <FiGithub /> GitHub Profile
                            </label>
                            <input
                                name="github"
                                value={form.github}
                                onChange={handleChange}
                                placeholder="https://github.com/username"
                                className="w-full bg-[#06040f] border border-gray-800 rounded-lg p-3 text-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest font-bold mb-2">
                                <FiLinkedin /> LinkedIn Profile
                            </label>
                            <input
                                name="linkedin"
                                value={form.linkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/username"
                                className="w-full bg-[#06040f] border border-gray-800 rounded-lg p-3 text-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-800/60">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-lg font-black uppercase tracking-widest text-sm transition-all
                                ${loading 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]'}`}
                        >
                            {loading ? 'Transmitting...' : <><FiSave size={18} /> Initialize Changes</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditProfile;