import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Redis connection
const connection = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null
});

// Submission queue (heavy jobs)
export const submissionQueue = new Queue('submission-queue', {
  connection
});

// Run queue (fast jobs)
export const runQueue = new Queue('run-queue', {
  connection
});

// AI queue (slow jobs)
export const aiQueue = new Queue('ai-queue', {
  connection
});

// Add submission job
export const addSubmissionToQueue = async (submissionId) => {
  await submissionQueue.add('judge-job', { submissionId }, {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
};