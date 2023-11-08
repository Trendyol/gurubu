// webpack.config.js
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: process.env.WEBPACK_BUILD_MODE || "production",
  target: 'node',
  entry: './server.js',
  output: {
    filename: 'server.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  externals: [nodeExternals()],
};