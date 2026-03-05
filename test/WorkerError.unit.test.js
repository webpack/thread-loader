import WorkerError from '../src/WorkerError';

describe('WorkerError', () => {
  test('merges worker and origin stacks and includes workerId', () => {
    const originStack =
      'Error: boom\n    at originFile.js:10:5\n    at originFunc (origin.js:11:6)';
    // workerStack intentionally omitted — not needed for this unit

    const err = { message: 'boom', name: 'Error', stack: originStack };

    // Simulate creating a WorkerError where the worker provided a longer stack
    const we = new WorkerError(err, '42');

    expect(we.name).toBe('Error');
    expect(we.message).toBe('boom');
    expect(we.stack).toContain('Thread Loader (Worker 42)');
    expect(we.stack).toContain('boom');
  });

  test('handles undefined err gracefully', () => {
    const we = new WorkerError(undefined, 'X');
    expect(we.message).toBe('Unknown worker error');
    expect(we.stack).toContain('Thread Loader (Worker X)');
    expect(we.stack).toContain('Unknown error');
  });
});
