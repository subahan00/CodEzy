import { runJavaScriptJudge } from "../../services/compiler/judgeRunner.js";

export const createSubmission = async (req, res) => {
  const submission = await Submission.create({});

  runJavaScriptJudge(submission._id).catch(console.error);

  res.status(201).json({ submissionId: submission._id });
};


