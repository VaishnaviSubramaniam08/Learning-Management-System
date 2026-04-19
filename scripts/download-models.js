const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const modelsDir = path.join(__dirname, '../public/models');

// Ensure models directory exists
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
  console.log('Created models directory');
}

// Model files to download
const modelFiles = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

// Base URL for the model files
const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// Download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Download all model files
async function downloadModels() {
  console.log('Downloading face-api.js models...');
  
  for (const modelFile of modelFiles) {
    const url = `${baseUrl}/${modelFile}`;
    const dest = path.join(modelsDir, modelFile);
    
    console.log(`Downloading ${modelFile}...`);
    try {
      await downloadFile(url, dest);
      console.log(`Downloaded ${modelFile}`);
    } catch (error) {
      console.error(`Error downloading ${modelFile}:`, error.message);
    }
  }
  
  console.log('All models downloaded successfully!');
}

// Run the download
downloadModels().catch(console.error);