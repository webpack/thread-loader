// Utility function to safely build a merged stack trace
const buildStackTrace = (err, workerStack = '', workerId = 'unknown') => {
  const originStackLines = (err?.stack || '')
    .split('\n')
    .filter((line) => line.trim().startsWith('at'));

  const workerStackLines = (workerStack || '')
    .split('\n')
    .filter((line) => line.trim().startsWith('at'));

  // Compute the difference between the worker's stack and the error's stack
  const extraWorkerLines = workerStackLines.slice(
    0,
    Math.max(0, workerStackLines.length - originStackLines.length)
  );

  // Build a readable, merged stack trace
  const mergedStack = [
    `Thread Loader (Worker ${workerId})`,
    err?.message || 'Unknown error',
    extraWorkerLines.join('\n'),
    ...originStackLines
  ]
    .filter(Boolean)
    .join('\n');

  return mergedStack;
};

class WorkerError extends Error {
  constructor(err, workerId) {
    // Pass a safe message to the base Error class
    super(err?.message || 'Unknown worker error');

    this.name = err?.name || 'WorkerError';
    this.originalError = err;

    // Capture the current stack before modifying it
    Error.captureStackTrace?.(this, WorkerError);

    // Replace the default stack with a combined one
    this.stack = buildStackTrace(err, this.stack, workerId);
  }
}

export default WorkerError;
