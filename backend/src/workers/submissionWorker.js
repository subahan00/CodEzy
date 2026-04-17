import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { runJavaScriptJudge } from '../services/compiler/judgeRunner.js';

// ── NEW IMPORTS FOR ADAPTIVE ENGINE ──
import Submission from '../models/submission.model.js'; // Adjust paths if needed
import User from '../models/User.js';
import Content from '../models/Content.model.js';
import { updateSkillMastery } from '../services/recommendation/recommendation.service.js';
import { classifyFailureReason } from '../services/ai/LLMserviceGROQ.js';

const connection = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null
});

// 1. Define the Worker
const worker = new Worker('submission-queue', async (job) => {

  const label = job.data.isDryRun ? 'Dry Run' : `Submission ${job.data.submissionId}`;
  console.log(`Job ${job.id}: Processing ${label}...`);

  // Run the code in Docker
  const result = await runJavaScriptJudge(job.data);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 INJECT THE ADAPTIVE ENGINE (Only for Real Submissions)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!job.data.isDryRun && job.data.submissionId) {
    try {
      const submission = await Submission.findById(job.data.submissionId);

      if (submission) {
        submission.status = result.status;
        submission.executionStats = result.executionStats;
        await submission.save();

        console.log(`[Worker] Adaptive Engine running for user: ${submission.user}`);

        // Update skill mastery scores
        await updateSkillMastery(submission.user, submission.content, result.status);

        // AI failure classification (only on failed submissions)
        if (result.status !== 'accepted') {
          const problem = await Content.findById(submission.content);

          if (problem) {
            const sourceCode = submission.codeSubmission?.sourceCode || job.data.code;
            const language = submission.codeSubmission?.language || job.data.language;

            const aiAnalysis = await classifyFailureReason(
              sourceCode,
              problem.problemStatement,
              language,
              result.status
            );

            // ✅ Save to submission (new fields)
            submission.failureCategory = aiAnalysis.category;
            submission.failureDetail = aiAnalysis.detail;
            await submission.save();

            // ✅ Increment failure radar on the user document
            await User.findByIdAndUpdate(submission.user, {
              $inc: { [`failureProfile.${aiAnalysis.category}`]: 1 }
            });

            console.log(`[Worker] Failure classified as: ${aiAnalysis.category} — ${aiAnalysis.detail}`);
          }
        }
      }
    } catch (engineError) {
      console.error("[Worker] Adaptive Engine error (non-fatal):", engineError.message);
    }
  }
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Return the result back to the Queue/Controller
  return result;

}, {
  connection,
  concurrency: 1 // 🔥 CRITICAL: Only run 1 docker container at a time
});

// 2. Event Listeners
worker.on('completed', (job, returnvalue) => {
  console.log(`Job ${job.id}: Completed! Result:`, returnvalue?.status || "Unknown");
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id}: Failed with error ${err.message}`);
});

export default worker;