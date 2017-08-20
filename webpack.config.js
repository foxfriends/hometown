'use strict';
const path = require('path');

module.exports = [{
  entry: path.resolve('public_html/script/index.js'),
  output: {
    path: path.resolve('public_html/script'),
    filename: 'index.min.js'
  },
  module: {
    loaders: [
      { test: /\.spec\.js$/, loader: 'mocha-loader'},
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  }
}];
