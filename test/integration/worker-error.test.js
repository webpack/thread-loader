import webpack from 'webpack';

import fixtureConfig from '../fixtures/error-project/webpack.config';

test('WorkerError integration: wraps and formats worker error', (done) => {
  const config = fixtureConfig({ threads: 1 });

  webpack(config, (err, stats) => {
    if (err) {
      done(err);
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

      done();
    } catch (e) {
      done(e);
    }
  });
}, 30000);
