import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { runJavaScriptJudge } from '../services/compiler/judgeRunner.js';

const connection = new IORedis({
  host: '127.0.0.1', 
  port: 6379,
  maxRetriesPerRequest: null
});

// 1. Define the Worker
const worker = new Worker('submission-queue', async (job) => {
  
  // Logic to print nice logs for both Modes
  const label = job.data.isDryRun ? 'Dry Run' : `Submission ${job.data.submissionId}`;
  console.log(`Job ${job.id}: Processing ${label}...`);
  
  // ✅ FIX 1: Pass the WHOLE job.data object
  // (This contains code, language, isDryRun, AND submissionId)
  const result = await runJavaScriptJudge(job.data);

  // ✅ FIX 2: Return the result!
  // This is required for the controller to get the data back via job.waitUntilFinished()
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