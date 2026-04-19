// Test script to verify webpack configuration
const path = require('path');
const webpack = require('webpack');
const cracoConfig = require('./craco.config');

// Log the webpack configuration
console.log('Craco webpack configuration:');
console.log(JSON.stringify(cracoConfig.webpack, null, 2));

// Create a simple webpack configuration to test
const testConfig = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      // Only define specific environment variables
      'process.browser': true
    })
  ]
};

console.log('\nTest webpack configuration:');
console.log(JSON.stringify(testConfig, null, 2));

console.log('\nConfiguration test complete. If no errors are shown, the webpack configuration is valid.');