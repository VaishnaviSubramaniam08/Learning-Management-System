// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock face-api.js globally
jest.mock('face-api.js', () => ({
  nets: {
    tinyFaceDetector: {
      loadFromUri: jest.fn().mockResolvedValue(true)
    },
    faceLandmark68Net: {
      loadFromUri: jest.fn().mockResolvedValue(true)
    },
    faceRecognitionNet: {
      loadFromUri: jest.fn().mockResolvedValue(true)
    },
    faceExpressionNet: {
      loadFromUri: jest.fn().mockResolvedValue(true)
    }
  },
  TinyFaceDetectorOptions: jest.fn().mockImplementation(() => ({})),
  detectAllFaces: jest.fn().mockReturnValue({
    withFaceLandmarks: jest.fn().mockReturnValue({
      withFaceDescriptors: jest.fn().mockReturnValue({
        withFaceExpressions: jest.fn().mockResolvedValue([])
      })
    })
  })
}));

// Mock browser APIs
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }]
    })
  },
  configurable: true
});

Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn((success) =>
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      })
    )
  },
  configurable: true
});

// Mock HTMLVideoElement
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  value: jest.fn().mockResolvedValue(undefined),
  configurable: true
});

Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
  value: jest.fn(),
  configurable: true
});

Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
  value: 640,
  configurable: true
});

Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
  value: 480,
  configurable: true
});

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = jest.fn((type) => {
  if (type === '2d') {
    return {
      drawImage: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(640 * 480 * 4),
        width: 640,
        height: 480
      })),
      fillText: jest.fn(),
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      arc: jest.fn()
    };
  }
  return null;
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Global test timeout
jest.setTimeout(10000);
