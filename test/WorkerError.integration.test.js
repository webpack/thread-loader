import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@jest/globals';
import WorkerError from '../src/WorkerError.js';

test('should capture and format an error from a real worker thread', async () => {
  // Create a worker inline using eval
  const worker = new Worker(
    `
    const { parentPort } = require('node:worker_threads');
    throw new Error('Mock worker failed intentionally');
  `,
    { eval: true }
  );

  // Capture error from the worker
  const error = await new Promise((resolve) => {
    worker.once('error', (err) => {
      resolve(err);
    });
  });

  // Wrap it using WorkerError
  const wrapped = new WorkerError(error, 1);

  expect(wrapped).toBeInstanceOf(Error);
  expect(wrapped.stack).toContain('Thread Loader (Worker 1)');
  expect(wrapped.message).toContain('Mock worker failed intentionally');
  expect(wrapped.stack).toMatch(/at/);

  worker.terminate();
});
