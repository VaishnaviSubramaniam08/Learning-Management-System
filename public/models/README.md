# Face-API.js Models

This directory contains the pre-trained models for face-api.js.

## Required Models

The following models need to be downloaded and placed in this directory:

1. **tiny_face_detector_model-weights_manifest.json**
2. **tiny_face_detector_model-shard1**
3. **face_landmark_68_model-weights_manifest.json**
4. **face_landmark_68_model-shard1**
5. **face_recognition_model-weights_manifest.json**
6. **face_recognition_model-shard1**
7. **face_recognition_model-shard2**
8. **face_expression_model-weights_manifest.json**
9. **face_expression_model-shard1**

## Download Instructions

You can download these models from the face-api.js repository:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Or use the provided download script:
```bash
npm run download-models
```

## Model Descriptions

- **Tiny Face Detector**: Lightweight face detection model
- **Face Landmark 68**: 68-point facial landmark detection
- **Face Recognition**: Face encoding/embedding generation
- **Face Expression**: Facial expression recognition

## Usage

These models are automatically loaded by the FaceDetectionService when the application starts.
