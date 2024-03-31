const Dotenv = require('dotenv-webpack');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = (env,argv)=>{
  // 判断当前是否为生产模式
  const isProduction = argv.mode === 'production';
  // 根据是生产模式还是开发模式，选择不同的.env文件
  const envPath = isProduction ? './.env.production' : './.env';

  return {
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader'
          ]
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new Dotenv({
        path: envPath, // 加载指定的.env文件
      }),
      new HtmlWebpackPlugin({
        template: 'src/index.html' // 指向你的模板文件
      }),
      new webpack.DefinePlugin({
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
    }
  }
};
