import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
// Import any AI processing functions here
// import { generateContent } from '../services/ai/LLMserviceGROQ.js';

const startWorker = async () => {
  try {
    await connectDB(); // ✅ WAIT for DB before starting worker
    
    const connection = new IORedis({
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null
    });

    // 1. Define the Worker
    const worker = new Worker('ai-queue', async (job) => {
  console.log(`Job ${job.id} (ai-queue): Processing AI Task...`);

  // Example placeholder for AI jobs
  // if (job.name === 'generate-test-cases') {
  //   return await generateTestCasesFromAI(job.data.title, job.data.description);
  // }
  
  return { success: true, message: "AI task executed automatically." };

}, {
  connection,
  concurrency: 2 // AI calls wait for network, so concurrency can be slightly higher, but keeping low as requested
});

    // 2. Event Listeners
    worker.on('completed', (job, returnvalue) => {
      console.log(`Job ${job.id} (ai-queue): Completed!`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job.id} (ai-queue): Failed with error ${err.message}`);
    });
    
    console.log('✅ AI Worker started successfully');

  } catch (err) {
    console.error('❌ Worker failed to start:', err.message);
    process.exit(1);
  }
};

startWorker();
