// backend/src/controllers/learner/submission.controller.js
import Content from '../../models/Content.model.js';    
import mongoose from 'mongoose';
import Submission from '../../models/submission.model.js';
import { addSubmissionToQueue } from '../../queues/submissionQueue.js';

export const createSubmission = async (req, res) => {
  try {
    const { contentId, language, sourceCode } = req.body;

    // 1. Validate input
    if (!contentId || !language || !sourceCode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // 2. Validate problem
    const problem = await Content.findOne({
      _id: contentId,
      isPublished: true,
      isActive: true,
      contentType: 'challenge'
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found or not accessible'
      });
    }

    // 3. Calculate attempt number
    const previousAttempts = await Submission.countDocuments({
      user: req.user.userId,
      content: contentId
    });

    // 4. Create submission
    const submission = await Submission.create({
      user: req.user.userId,
      content: contentId,
      codeSubmission: {
        language,
        sourceCode
      },
      attemptNumber: previousAttempts + 1,
      status: 'pending'
    });

   // 5. Trigger Judge Asynchronously (Do not await)
   await addSubmissionToQueue(submission._id);

    res.status(201).json({
      success: true,
      data: {
        submissionId: submission._id,
        status: submission.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user.userId
    })
      .populate('content', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .select(
        `
        status
        attemptNumber
        executionStats
        score
        createdAt
        `
      );

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }
    const submission = await Submission.findOne({
      _id: id,
      user: req.user.userId
    }).populate('content', 'title slug difficulty')
    .sort({ createdAt: -1 })
    .select('status attemptNumber executionStats score createdAt testResults codeSubmission');
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    res.json({
      success: true,
      data: submission
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};  
export default {
  createSubmission,
  getMySubmissions
  ,
  getSubmissionById
};  