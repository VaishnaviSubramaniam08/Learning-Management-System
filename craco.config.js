const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules that are not available in the browser
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "fs": false,
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "util": require.resolve("util"),
        "assert": require.resolve("assert"),
        "url": require.resolve("url"),
        "os": require.resolve("os-browserify/browser"),
        "https": require.resolve("https-browserify"),
        "http": require.resolve("stream-http"),
        "zlib": require.resolve("browserify-zlib"),
        "querystring": require.resolve("querystring-es3"),
        "vm": require.resolve("vm-browserify"),
        "process": false
      };

      // Add plugins to provide global variables
      const webpack = require('webpack');
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer']
        }),
        new webpack.DefinePlugin({
          // Instead of setting the entire process.env object which conflicts with webpack's internal setting
          // Set specific environment variables that you need
          'process.browser': true,
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        })
      );

      // Ignore specific modules that cause issues with face-api.js
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        // Ignore Node.js specific modules in face-api.js
        'fs': false,
        'child_process': false,
        'net': false,
        'tls': false,
        'dns': false,
        // Replace face-api.js createFileSystem with our browser-compatible version
        'face-api.js/build/es6/env/createFileSystem': path.resolve(__dirname, 'src/utils/face-api-browser-fs.js'),
        // Explicitly alias the entire env directory to handle all Node.js imports
        'face-api.js/build/es6/env': path.resolve(__dirname, 'src/utils/face-api-browser-env')
      };
      
      // Add specific rules to handle face-api.js Node.js imports
      webpackConfig.module.rules.push(
        {
          test: /face-api\.js[\/\\]build[\/\\]es6[\/\\]env[\/\\]createFileSystem\.js$/,
          use: 'null-loader',
          include: /node_modules/
        },
        {
          // This will handle any direct fs imports in face-api.js
          test: /face-api\.js/,
          parser: {
            amd: false,
            commonjs: true,
            system: false,
            harmony: true,
            requireInclude: false,
            requireEnsure: false,
            requireContext: false,
            browserify: false,
            requireJs: false,
            node: false
          }
        }
      );
      

      return webpackConfig;
    },
  },
};