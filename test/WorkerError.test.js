import WorkerError from '../src/WorkerError.js';

describe('WorkerError', () => {
  it('should create a WorkerError with merged stack trace', () => {
    const originalError = new Error('Something went wrong');
    originalError.stack = `Error: Something went wrong
    at doSomething (worker.js:10:5)
    at runWorker (thread.js:20:10)`;

    const workerError = new WorkerError(originalError, 3);

    expect(workerError).toBeInstanceOf(Error);
    expect(workerError.name).toBe('Error');
    expect(workerError.message).toBe('Something went wrong');
    expect(workerError.stack).toContain('Thread Loader (Worker 3)');
    expect(workerError.stack).toContain('doSomething');
  });

  it('should handle missing err.stack gracefully', () => {
    const err = { message: 'No stack here' };
    const workerError = new WorkerError(err, 1);

    expect(workerError.stack).toContain('Thread Loader (Worker 1)');
    expect(workerError.message).toBe('No stack here');
  });

  it('should handle undefined workerId safely', () => {
    const err = new Error('Worker ID missing');
    const workerError = new WorkerError(err);

    expect(workerError.stack).toContain('Thread Loader (Worker unknown)');
    expect(workerError.message).toBe('Worker ID missing');
  });

  it('should preserve originalError reference', () => {
    const err = new Error('Check original');
    const workerError = new WorkerError(err, 2);

    expect(workerError.originalError).toBe(err);
  });

  it('should include both worker and origin stack traces when available', () => {
    const err = new Error('Test merge');
    err.stack = `Error: Test merge
    at originFunction (origin.js:5:3)`;

    const workerError = new WorkerError(err, 4);

    expect(workerError.stack).toMatch(/Thread Loader \(Worker 4\)/);
    expect(workerError.stack).toMatch(/originFunction/);
  });
});
