import webpack from 'webpack';

import fixtureConfig from '../fixtures/error-project/webpack.config';

test('WorkerError integration: wraps and formats worker error', (done) => {
  const config = fixtureConfig({ threads: 1 });

  const compiler = webpack(config);

  compiler.run((err, stats) => {
    const finish = (cbErr) => {
      compiler.close(() => {
        try {
          // Ensure any worker pools created by thread-loader are terminated so
          // Jest can exit cleanly. Match the options used in the fixture.
          // Require the runtime workerPools from dist and terminate the pool.
          // eslint-disable-next-line global-require
          const { getPool } = require('../../dist/workerPools');
          const pool = getPool({ workers: 1, workerParallelJobs: 2, poolTimeout: 2000 });
          if (pool && typeof pool.terminate === 'function') {
            pool.terminate();
          }
        } catch (e) {
          // ignore cleanup errors
        }

        // Allow a short grace period for child-process pipes and timeouts
        // to unwind before finishing the test so Jest can exit cleanly.
        setTimeout(() => {
          if (cbErr) {
            done(cbErr);
          } else {
            done();
          }
        }, 50);
      });
    };

    if (err) {
      finish(err);
      return;
    }

    try {
      expect(stats.hasErrors()).toBe(true);

      const errors = stats.compilation.errors;
      expect(errors.length).toBeGreaterThan(0);

      const first = errors[0];
      const stack = first.stack || String(first.message || first);

      // Expect the WorkerError header
      expect(stack).toContain('Thread Loader (Worker');

      // Expect original message
      expect(stack).toContain('Mock worker failed intentionally');

      // Expect combined stack trace contains at least one 'at' line
      expect(stack).toMatch(/\n\s*at\s+/);

      finish();
    } catch (e) {
      finish(e);
    }
  });
}, 30000);
