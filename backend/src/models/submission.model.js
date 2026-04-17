import mongoose from 'mongoose';
const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },

  codeSubmission: {
    language: {
      type: String,
      enum: ['javascript', 'python', 'cpp', 'c', 'java'],
      required: true
    },
    sourceCode: {
      type: String,
      required: true
    }
  },

  status: {
    type: String,
    enum: [
      'pending',
      'running',
      'accepted',
      'wrong-answer',
      'time-limit-exceeded',
      'memory-limit-exceeded',
      'runtime-error',
      'compilation-error'
    ],
    default: 'pending'
  },

  // Inside your Submission Schema
 testResults: [{
    testCase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestCase'
    },
    status: {
        type: String,
        enum: ['ACCEPTED', 'WRONG_ANSWER', 'TLE', 'RUNTIME_ERROR']
    },
    passed: Boolean,             // Keep for easy filtering
    output: String,              // <--- ADD THIS (Actual user output)
    expectedOutput: String,      // <--- ADD THIS (What we wanted)
    executionTime: Number,
    errorMessage: String
}],

  executionStats: {
    time: Number,
    memory: Number
  },

  score: {
    type: Number,
    default: 0
  },

  aiFeedback: {
    type: Object,
    default: null
  },
failureCategory: {
  type: String,
  enum: ['logic_error', 'edge_case', 'inefficient_algo', 'misunderstood_requirements', 'syntax_error', 'runtime-error', 'wrong-answer', 'time-limit-exceeded'],
  default: null
},

failureDetail: {
  type: String,
  default: null
},
  attemptNumber: {
    type: Number,
    default: 1
  },
  isFirstSuccessfulSubmission: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;