// Browser-compatible implementation of face-api.js file system
// This file is used as an alias for face-api.js/build/es6/env/createFileSystem.js

import { createFileSystem } from '../face-api-browser-fs';

// Export the browser-compatible file system function
export default createFileSystem;

// Also export it as a named export for different import styles
export { createFileSystem };