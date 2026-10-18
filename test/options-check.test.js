import os from 'os';
import path from 'path';

import webpack from 'webpack';

const threadLoader = require('../dist');

const loader = require.resolve('./options-check/options-check-loader');

const run = (options) =>
  new Promise((resolve, reject) => {
    webpack(
      {
        mode: 'none',
        context: path.resolve(__dirname, 'options-check'),
        devtool: false,
        entry: './file.js',
        output: {
          path: path.join(os.tmpdir(), 'thread-loader-options-check'),
        },
        module: {
          rules: [
            {
              test: /file\.js$/,
              use: [
                {
                  loader: path.resolve(__dirname, '../dist/index.js'),
                  options: { workers: 1, poolTimeout: 2000 },
                },
                { loader, options },
              ],
            },
          ],
        },
      },
      (err, stats) => (err ? reject(err) : resolve(stats)),
    );
  });

beforeAll(() => {
  threadLoader.warmup({ workers: 1, poolTimeout: 2000 }, [loader]);
});

test('skips the schema when the precompiled check passes', async () => {
  const stats = await run({ trusted: true });

  expect(stats.compilation.errors).toHaveLength(0);
});

test('validates against the schema when the precompiled check fails', async () => {
  const stats = await run({ name: 1 });

  expect(stats.compilation.errors).toHaveLength(1);
  expect(stats.compilation.errors[0].message).toMatch(
    /options\.name should be a string/,
  );
});
