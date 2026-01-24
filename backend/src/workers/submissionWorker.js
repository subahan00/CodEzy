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
  console.log(`Job ${job.id}: Processing Submission ${job.data.submissionId}...`);
  
  // Call your existing judge logic
  await runJavaScriptJudge(job.data.submissionId);

}, {
  connection,
  concurrency: 1 // 🔥 CRITICAL: Only run 1 docker container at a time
});

// 2. Event Listeners (Optional, for logs)
worker.on('completed', (job) => {
  console.log(`Job ${job.id}: Completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id}: Failed with error ${err.message}`);
});

export default worker;