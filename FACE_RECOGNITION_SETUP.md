# Face Recognition Setup Guide

## Overview

This guide will help you set up the face recognition feature for the attendance system. The face recognition feature uses face-api.js, which requires pre-trained models to function correctly.

## Prerequisites

- Node.js installed on your system
- npm or yarn package manager

## Setup Steps

### 1. Download Face Recognition Models

The face recognition feature requires pre-trained models to function correctly. These models need to be downloaded and placed in the correct directory.

Run the following command to download the required models:

```bash
npm run download-models
```

This will download the following models to the `public/models` directory:
- Tiny Face Detector model
- Face Landmark 68 model
- Face Recognition model
- Face Expression model

### 2. Start the Application

After downloading the models, you can start the application:

```bash
npm start
```

## Troubleshooting

### Module not found: Error: Can't resolve 'fs'

If you encounter this error, it's because face-api.js is trying to use Node.js modules in a browser environment. We've implemented a fix for this by:

1. Creating a browser-compatible version of the file system module
2. Configuring webpack to use this browser-compatible version

If you still encounter this error, try the following steps:

1. Clear your browser cache
2. Delete the `node_modules` directory and reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```
3. Rebuild the application:
   ```bash
   npm run build
   ```

### Face Recognition Not Working

If face recognition is not working correctly, check the following:

1. Make sure you've downloaded the models using `npm run download-models`
2. Check that the models are correctly placed in the `public/models` directory
3. Ensure your camera is working and has the necessary permissions
4. Check the browser console for any errors

## Using Face Recognition for Attendance

1. Register your face by navigating to the profile section and clicking on "Register Face"
2. Follow the on-screen instructions to complete the registration process
3. Once registered, you can use face recognition to mark attendance for your classes
4. When attending a class, select "Face Recognition" as the attendance method
5. Position your face within the frame and follow the on-screen instructions
6. The system will verify your identity and mark your attendance automatically

## Privacy and Security

The face recognition system is designed with privacy and security in mind:

1. Face data is encrypted and stored securely
2. The system includes liveness detection to prevent spoofing
3. You can revoke consent and delete your face data at any time
4. Face data is only used for attendance purposes and is not shared with third parties