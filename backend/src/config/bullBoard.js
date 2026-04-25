import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { submissionQueue, runQueue, aiQueue } from '../queues/submissionQueue.js';

// Setup Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(submissionQueue),
    new BullMQAdapter(runQueue),
    new BullMQAdapter(aiQueue),
  ],
  serverAdapter: serverAdapter,
});

export { serverAdapter };
