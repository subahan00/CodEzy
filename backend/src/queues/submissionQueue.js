import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// 1. Create Redis Connection
const connection = new IORedis({
  host: '127.0.0.1', // <--- CHANGE THIS (was 'localhost')
  port: 6379,
  maxRetriesPerRequest: null
});

// 2. Create the Queue
export const submissionQueue = new Queue('submission-queue', {
  connection
});


export const addSubmissionToQueue = async (submissionId) => {
  await submissionQueue.add('judge-job', { submissionId }, {
    removeOnComplete: true, 
    removeOnFail: false     
  });
};