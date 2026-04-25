// backend/src/controllers/learner/submission.controller.js
import Content from '../../models/Content.model.js';    
import mongoose from 'mongoose';
import Submission from '../../models/submission.model.js';
import { addSubmissionToQueue, submissionQueue, runQueue } from '../../queues/submissionQueue.js'; // Ensure submissionQueue is imported
import TestCase from '../../models/testCase.model.js';
import { QueueEvents } from 'bullmq'; // 👈 IMPORT THIS

// 1. Create QueueEvents listener (connects to Redis)
const queueEvents = new QueueEvents('submission-queue', {
  connection: {
    host: '127.0.0.1', 
    port: 6379
  }
});

const runQueueEvents = new QueueEvents('run-queue', {
  connection: {
    host: '127.0.0.1', 
    port: 6379
  }
});

export const createSubmission = async (req, res) => {
  try {
    const { contentId, language, sourceCode } = req.body;

    if (!contentId || !language || !sourceCode) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const problem = await Content.findOne({
      _id: contentId,
      isPublished: true,
      isActive: true,
      contentType: 'challenge'
    });

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found or not accessible' });
    }

    const previousAttempts = await Submission.countDocuments({
      user: req.user.userId,
      content: contentId
    });

    const submission = await Submission.create({
      user: req.user.userId,
      content: contentId,
      codeSubmission: { language, sourceCode },
      attemptNumber: previousAttempts + 1,
      status: 'pending'
    });

    await addSubmissionToQueue(submission._id);

    res.status(201).json({
      success: true,
      data: {
        submissionId: submission._id,
        status: submission.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user.userId })
      .populate('content', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .select('status attemptNumber executionStats score createdAt');

    res.json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// getSubmissionByProblemId
export const getSubmissionByProblemId = async (req, res) => {
  try {

    const { id: problemId } = req.params;
   console.log('problemId',problemId);
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ success: false, message: 'Invalid problem ID' });
    }
    const submissions = await Submission.find({
      user: req.user.userId,
      content: problemId
    })
    .populate('content', 'title slug difficulty')
    .select('status attemptNumber executionStats score createdAt');

    res.json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

  
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid submission ID' });
    }
    const submission = await Submission.findOne({
      _id: id,
      user: req.user.userId
    })
    .populate('content', 'title slug difficulty')
    .select('status attemptNumber executionStats score createdAt testResults codeSubmission');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    res.json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};  
// getSubmissionByPro
// 2. Updated RUN CODE Function
export const runCode = async (req, res) => {
  try {
    const { language, code, problemId } = req.body;

    if (!language || !code || !problemId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const problem = await Content.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // ✅ Fix #2: Fetch ALL test cases, not just one sample
    const testCases = await TestCase.find({ problem: problemId }).limit(3);
    if (!testCases.length) {
      return res.status(400).json({ message: 'No test cases found for this problem' });
    }

    const job = await runQueue.add('run', {
      language,
      code,
      testCases, // ✅ Full array
      isDryRun: true
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    const result = await job.waitUntilFinished(runQueueEvents, 30000); // Increased timeout for multiple tests

    // ✅ Fix #3: Return with explicit passedTests/totalTests keys
    // so DuelRoom.jsx can read them clearly
    res.json({
      success: true,
      data: {
        ...result,
        passedTests: result.executionStats.passed,
        totalTests: result.executionStats.total,
      }
    });

  } catch (error) {
    console.error('Run Code Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Execution failed' });
  }
};

export default {
  createSubmission,
  getMySubmissions,
  runCode,
  getSubmissionById
};