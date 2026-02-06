import React from 'react';
import { FiX, FiClock, FiCpu } from 'react-icons/fi';

const SubmissionModal = ({ submission, onClose }) => {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl border border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">
              {submission.content?.title}
            </h2>

            <div className="flex items-center gap-4 text-sm mt-1">
              <span
                className={`uppercase font-bold ${
                  submission.status === 'accepted'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {submission.status}
              </span>

              <span className="text-gray-400 flex items-center gap-1">
                <FiClock />
                {new Date(submission.createdAt).toLocaleString()}
              </span>

              <span className="text-gray-400">
                Attempt #{submission.attemptNumber}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition">
            <FiX className="text-white text-xl" />
          </button>
        </div>

        {/* Info Row */}
        <div className="grid grid-cols-2 gap-4 p-6 bg-gray-900/50">
          <div className="bg-gray-800 p-3 rounded border border-gray-700">
            <p className="text-xs text-gray-400">Difficulty</p>
            <p className="text-white capitalize">
              {submission.content?.difficulty}
            </p>
          </div>

          <div className="bg-gray-800 p-3 rounded border border-gray-700">
            <p className="text-xs text-gray-400">Language</p>
            <p className="text-white uppercase">
              {submission.codeSubmission?.language}
            </p>
          </div>
        </div>

        {/* Code Block */}
        <div className="p-6 overflow-y-auto flex-grow bg-gray-900">
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
            Source Code
          </label>

          <pre className="font-mono text-sm text-gray-300 bg-black/50 p-4 rounded border border-gray-700 whitespace-pre-wrap">
            {submission.codeSubmission?.sourceCode || "// No code saved"}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default SubmissionModal;
