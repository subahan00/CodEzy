import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { runJavaScriptJudge } from '../services/compiler/judgeRunner.js';

const startWorker = async () => {
  try {
    await connectDB(); // ✅ WAIT for DB

    const connection = new IORedis({
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null
    });

    const worker = new Worker('run-queue', async (job) => {
      const label = 'Dry Run (Run Code)';
      console.log(`Job ${job.id}: Processing ${label}...`);

      const result = await runJavaScriptJudge(job.data);
      return result;

    }, {
      connection,
      concurrency: 2
    });

    worker.on('completed', (job, returnvalue) => {
      console.log(`Job ${job.id} (run-queue): Completed! Result:`, returnvalue?.status || "Unknown");
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job.id} (run-queue): Failed with error ${err.message}`);
    });

    console.log('✅ Run Worker started successfully');

  } catch (err) {
    console.error('❌ Worker failed to start:', err.message);
    process.exit(1);
  }
};

startWorker();