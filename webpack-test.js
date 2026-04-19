// Simple webpack test script
const webpack = require('webpack');
const path = require('path');

// Create a minimal webpack configuration
const config = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist-test'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    // Use our fixed DefinePlugin configuration
    new webpack.DefinePlugin({
      // Only define specific environment variables instead of the entire process.env
      'process.browser': true,
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ]
};

console.log('Running webpack with test configuration...');

// Run webpack with our test configuration
webpack(config, (err, stats) => {
  if (err) {
    console.error('Webpack error:', err);
    return;
  }

  // Check for compilation errors
  if (stats.hasErrors()) {
    console.error('Webpack compilation errors:');
    const info = stats.toJson();
    console.error(info.errors);
    return;
  }

  // Check for compilation warnings
  if (stats.hasWarnings()) {
    console.warn('Webpack compilation warnings:');
    const info = stats.toJson();
    console.warn(info.warnings);
  } else {
    console.log('Webpack compilation successful with no warnings!');
  }

  // Log the stats summary
  console.log(stats.toString({
    chunks: false,
    colors: true
  }));
});