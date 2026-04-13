// backend/src/controllers/submission/submissionController.js
import Submission from "../../models/Submission.js";
import Content from "../../models/Content.js";
import { runJavaScriptJudge } from "../../services/compiler/judgeRunner.js";

export const createSubmission = async (req, res) => {
  const { problemId, sourceCode, language } = req.body;

  // 1️⃣ Validate problem
  const problem = await Content.findOne({
    _id: problemId,
    contentType: "challenge",
    isPublished: true
  });

  if (!problem) {
    return res.status(404).json({ message: "Problem not found" });
  }

  // 2️⃣ Create submission (PENDING)
  const submission = await Submission.create({
    user: req.user.id,
    content: problem._id,
    language,
    sourceCode,
    status: "PENDING"
  });

  // 3️⃣ Fire judge async
  runJavaScriptJudge(submission._id).catch(console.error);

  // 4️⃣ Respond immediately
  res.status(201).json({
    submissionId: submission._id,
    status: "PENDING"
  });
};
export const getSubmissionById = async (req, res) => {
  const submission = await Submission.findOne({
    _id: req.params.id,
    user: req.user.id
  }).select("-sourceCode -testResults");

  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  res.json(submission);
};
export const getUserSubmissions = async (req, res) => {
  const submissions = await Submission.find({ user: req.user.id })
    .select("-sourceCode -testResults")
    .sort({ createdAt: -1 });
  res.json(submissions);
}
export const getSubmissionByProblemId = async (req, res) => {
  comsole.log('problemId',req.params.problemId);
  const submissions = await Submission.find({ user: req.user.id, content: req.params.problemId })
    .select("-sourceCode -testResults")
    .sort({ createdAt: -1 });
  res.json(submissions);
}
export default {
  createSubmission,
  getSubmissionById,
  getUserSubmissions,
  getSubmissionByProblemId
};
