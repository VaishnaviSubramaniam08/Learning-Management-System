// Browser-compatible implementation of face-api.js env module
import { createFileSystem } from '../face-api-browser-fs';

// Create a mock fs module that face-api.js can use
const fs = {
  // Provide the methods that face-api.js actually uses
  readFileSync: (filePath) => {
    console.warn('Browser environment: readFileSync called, but this is not supported in browsers');
    return null;
  },
  existsSync: (filePath) => {
    console.warn('Browser environment: existsSync called, but this is not supported in browsers');
    return false;
  },
  readdirSync: (dirPath) => {
    console.warn('Browser environment: readdirSync called, but this is not supported in browsers');
    return [];
  },
  // Add any other fs methods that face-api.js might use
};

// Export the browser-compatible file system
export { fs };

// Export other environment variables needed by face-api.js
export const env = {
  browser: true,
  node: false
};

// Export the createFileSystem function for direct imports
export { createFileSystem };