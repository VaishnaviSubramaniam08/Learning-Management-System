// This file patches face-api.js to work in browser environments

// Apply the patch when this module is imported
applyFaceApiPatch();

function applyFaceApiPatch() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  try {
    // Create a mock fs module and attach it to the window
    window.fs = {
      readFileSync: (filePath) => {
        console.warn('Browser environment: readFileSync called with', filePath);
        return Buffer.from([]);
      },
      existsSync: (filePath) => {
        console.warn('Browser environment: existsSync called with', filePath);
        return false;
      },
      readdirSync: (dirPath) => {
        console.warn('Browser environment: readdirSync called with', dirPath);
        return [];
      }
    };

    console.log('face-api.js patch applied successfully');
  } catch (error) {
    console.error('Error applying face-api.js patch:', error);
  }
}

export default applyFaceApiPatch;