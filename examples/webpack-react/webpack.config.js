const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ReactHubbleWebpackPlugin } = require('@react-hubble/webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.[contenthash].js',
      clean: true
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        inject: 'body'
      }),
      ...(isDevelopment ? [
        new ReactHubbleWebpackPlugin({
          server: {
            port: 3737,
            host: 'localhost'
          },
          testId: {
            convention: 'data-testid',
            autoGenerate: false
          }
        })
      ] : [])
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      port: 3000,
      hot: true,
      open: true
    },
    devtool: isDevelopment ? 'source-map' : false
  };
};
