const path = require('path');

const webpack = require('webpack');

const threadLoader = require('../../../dist'); // eslint-disable-line import/no-extraneous-dependencies

module.exports = (env) => {
  const workerPool = {
    workers: +env.threads,
    workerParallelJobs: 2,
    poolTimeout: env.watch ? Infinity : 2000,
  };
  // Do not warmup here to avoid spawning worker processes at config require time
  // Warmup is unnecessary for this integration fixture and can keep handles open
  return {
    mode: 'none',
    context: __dirname,
    devtool: false,
    entry: ['./index.js'],
    output: {
      path: path.resolve('dist'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /file\.js$/,
          use: [
            env.threads !== 0 && {
              loader: path.resolve(__dirname, '../../../dist/index.js'),
              options: workerPool,
            },
            {
              loader: require.resolve('./error-loader'),
            },
          ].filter(Boolean),
        },
      ],
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
  };
};
