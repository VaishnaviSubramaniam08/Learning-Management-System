import faceDetectionService from '../services/faceDetectionService';

// Mock face-api.js
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
        withFaceExpressions: jest.fn().mockResolvedValue([
          {
            detection: {
              box: { x: 100, y: 100, width: 200, height: 200 },
              score: 0.9
            },
            landmarks: {
              getLeftEye: () => [{ x: 150, y: 150 }],
              getRightEye: () => [{ x: 250, y: 150 }],
              getNose: () => [{ x: 200, y: 180 }, { x: 200, y: 185 }, { x: 200, y: 190 }, { x: 200, y: 195 }]
            },
            descriptor: new Float32Array(128).fill(0.5),
            expressions: {
              happy: 0.8,
              sad: 0.1,
              angry: 0.05,
              fearful: 0.02,
              disgusted: 0.01,
              surprised: 0.02,
              neutral: 0.0
            }
          }
        ])
      })
    })
  })
}));

// Mock navigator and other browser APIs
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  configurable: true
});

Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  configurable: true
});

Object.defineProperty(screen, 'width', {
  value: 1920,
  configurable: true
});

Object.defineProperty(screen, 'height', {
  value: 1080,
  configurable: true
});

// Mock canvas and WebGL
HTMLCanvasElement.prototype.getContext = jest.fn((type) => {
  if (type === '2d') {
    return {
      drawImage: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(400 * 400 * 4).fill(128),
        width: 400,
        height: 400
      })),
      fillText: jest.fn(),
      toDataURL: jest.fn(() => 'data:image/png;base64,mock-data')
    };
  }
  if (type === 'webgl' || type === 'experimental-webgl') {
    return {
      getParameter: jest.fn((param) => {
        if (param === 'VENDOR') return 'Mock Vendor';
        if (param === 'RENDERER') return 'Mock Renderer';
        return 'Mock Value';
      })
    };
  }
  return null;
});

describe('FaceDetectionService', () => {
  beforeEach(() => {
    // Reset service state
    faceDetectionService.isInitialized = false;
    faceDetectionService.modelsLoaded = false;
    faceDetectionService.livenessHistory = [];
    faceDetectionService.currentChallenge = null;
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await faceDetectionService.initialize();
      expect(result).toBe(true);
      expect(faceDetectionService.isReady()).toBe(true);
    });

    it('should generate device fingerprint', async () => {
      await faceDetectionService.initialize();
      expect(faceDetectionService.deviceFingerprint).toBeDefined();
      expect(faceDetectionService.deviceFingerprint.userAgent).toBeDefined();
      expect(faceDetectionService.deviceFingerprint.screenResolution).toBe('1920x1080');
    });

    it('should detect suspicious devices', () => {
      faceDetectionService.deviceFingerprint = {
        userAgent: 'HeadlessChrome/91.0.4472.114'
      };
      expect(faceDetectionService.isDeviceSuspicious()).toBe(true);
    });
  });

  describe('Face Detection', () => {
    beforeEach(async () => {
      await faceDetectionService.initialize();
    });

    it('should detect faces in video', async () => {
      const mockVideo = {
        videoWidth: 640,
        videoHeight: 480
      };

      const detections = await faceDetectionService.detectFaces(mockVideo);
      expect(detections).toBeDefined();
      expect(Array.isArray(detections)).toBe(true);
    });

    it('should extract face encoding', () => {
      const mockDetection = {
        descriptor: new Float32Array(128).fill(0.5)
      };

      const encoding = faceDetectionService.extractFaceEncoding(mockDetection);
      expect(encoding).toBeDefined();
      expect(Array.isArray(encoding)).toBe(true);
      expect(encoding.length).toBe(128);
    });

    it('should validate face quality', () => {
      const mockVideo = {
        videoWidth: 640,
        videoHeight: 480
      };

      const mockDetection = {
        detection: {
          box: { x: 200, y: 150, width: 200, height: 200 },
          score: 0.9
        }
      };

      const result = faceDetectionService.validateFaceQuality(mockDetection, mockVideo);
      expect(result.valid).toBe(true);
      expect(result.quality).toBe(0.9);
    });

    it('should reject poor quality faces', () => {
      const mockVideo = {
        videoWidth: 640,
        videoHeight: 480
      };

      const mockDetection = {
        detection: {
          box: { x: 200, y: 150, width: 50, height: 50 }, // Too small
          score: 0.9
        }
      };

      const result = faceDetectionService.validateFaceQuality(mockDetection, mockVideo);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('too small');
    });
  });

  describe('Liveness Detection', () => {
    beforeEach(async () => {
      await faceDetectionService.initialize();
    });

    it('should perform liveness detection', () => {
      const mockVideo = {
        videoWidth: 640,
        videoHeight: 480
      };

      const mockDetection = {
        detection: {
          box: { x: 200, y: 150, width: 200, height: 200 },
          score: 0.9
        },
        landmarks: {
          getLeftEye: () => [{ x: 150, y: 150 }],
          getRightEye: () => [{ x: 250, y: 150 }],
          getNose: () => [{ x: 200, y: 180 }, { x: 200, y: 185 }, { x: 200, y: 190 }, { x: 200, y: 195 }]
        },
        expressions: {
          happy: 0.8
        }
      };

      const result = faceDetectionService.performLivenessDetection(mockDetection, mockVideo);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('isLive');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('securityScore');
    });

    it('should detect eye movement', () => {
      // Simulate eye movement history
      faceDetectionService.livenessHistory = [
        { leftEye: { x: 150, y: 150 }, rightEye: { x: 250, y: 150 } },
        { leftEye: { x: 155, y: 150 }, rightEye: { x: 255, y: 150 } },
        { leftEye: { x: 160, y: 150 }, rightEye: { x: 260, y: 150 } }
      ];

      const result = faceDetectionService.detectEyeMovement();
      expect(typeof result).toBe('boolean');
    });

    it('should detect head movement', () => {
      // Simulate head movement history
      faceDetectionService.livenessHistory = [
        { nose: { x: 200, y: 180 } },
        { nose: { x: 205, y: 180 } },
        { nose: { x: 210, y: 180 } }
      ];

      const result = faceDetectionService.detectHeadMovement();
      expect(typeof result).toBe('boolean');
    });

    it('should detect blinking', () => {
      // Simulate blinking pattern
      faceDetectionService.livenessHistory = Array.from({ length: 15 }, (_, i) => ({
        eyeAspectRatio: i % 5 === 2 ? 0.2 : 0.4 // Simulate blinks
      }));

      const result = faceDetectionService.detectBlinking();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Challenge-Response System', () => {
    beforeEach(async () => {
      await faceDetectionService.initialize();
    });

    it('should generate challenges', () => {
      const challenge = faceDetectionService.generateChallenge();
      expect(challenge).toBeDefined();
      expect(challenge.type).toBeDefined();
      expect(['blink', 'smile', 'turn_left', 'turn_right', 'nod']).toContain(challenge.type);
      expect(challenge.startTime).toBeDefined();
      expect(challenge.completed).toBe(false);
    });

    it('should verify smile challenge', () => {
      faceDetectionService.currentChallenge = {
        type: 'smile',
        startTime: Date.now(),
        completed: false,
        attempts: 0
      };

      const mockDetection = {
        expressions: {
          happy: 0.8
        }
      };

      const result = faceDetectionService.verifyChallengeResponse(mockDetection, {});
      expect(result.success).toBe(true);
      expect(result.message).toContain('Smile detected');
    });

    it('should verify blink challenge', () => {
      faceDetectionService.currentChallenge = {
        type: 'blink',
        startTime: Date.now(),
        completed: false,
        attempts: 0
      };

      // Simulate blinking pattern
      faceDetectionService.livenessHistory = Array.from({ length: 15 }, (_, i) => ({
        eyeAspectRatio: i % 5 === 2 ? 0.2 : 0.4
      }));

      const result = faceDetectionService.verifyChallengeResponse({}, {});
      expect(result.success).toBe(true);
      expect(result.message).toContain('Blink detected');
    });
  });

  describe('Texture Analysis', () => {
    beforeEach(async () => {
      await faceDetectionService.initialize();
    });

    it('should perform texture analysis', () => {
      const mockVideo = document.createElement('video');
      const mockDetection = {
        detection: {
          box: { x: 100, y: 100, width: 200, height: 200 }
        }
      };

      const result = faceDetectionService.performAdvancedTextureAnalysis(mockVideo, mockDetection);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('variance');
      expect(result).toHaveProperty('entropy');
      expect(result).toHaveProperty('isRealTexture');
    });

    it('should calculate texture metrics', () => {
      const mockData = new Uint8ClampedArray(400 * 400 * 4).fill(128);
      const result = faceDetectionService.calculateTextureMetrics(mockData, 400, 400);
      
      expect(result).toHaveProperty('variance');
      expect(result).toHaveProperty('entropy');
      expect(result).toHaveProperty('edgeDensity');
      expect(result).toHaveProperty('lbp');
    });
  });

  describe('Security Features', () => {
    beforeEach(async () => {
      await faceDetectionService.initialize();
    });

    it('should get device security info', () => {
      const info = faceDetectionService.getDeviceSecurityInfo();
      expect(info).toHaveProperty('fingerprint');
      expect(info).toHaveProperty('isSuspicious');
      expect(info).toHaveProperty('timestamp');
      expect(info).toHaveProperty('challengeSupported');
    });

    it('should reset liveness history', () => {
      faceDetectionService.livenessHistory = [{ test: 'data' }];
      faceDetectionService.currentChallenge = { test: 'challenge' };
      
      faceDetectionService.resetLivenessHistory();
      
      expect(faceDetectionService.livenessHistory).toEqual([]);
      expect(faceDetectionService.currentChallenge).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization failures gracefully', async () => {
      // Mock a failure
      const originalLoadFromUri = require('face-api.js').nets.tinyFaceDetector.loadFromUri;
      require('face-api.js').nets.tinyFaceDetector.loadFromUri = jest.fn().mockRejectedValue(new Error('Load failed'));
      
      const result = await faceDetectionService.initialize();
      expect(result).toBe(false);
      
      // Restore original mock
      require('face-api.js').nets.tinyFaceDetector.loadFromUri = originalLoadFromUri;
    });

    it('should handle null detection gracefully', () => {
      const result = faceDetectionService.extractFaceEncoding(null);
      expect(result).toBeNull();
    });

    it('should handle invalid face encoding', () => {
      const mockDetection = {
        descriptor: null
      };
      
      const result = faceDetectionService.extractFaceEncoding(mockDetection);
      expect(result).toBeNull();
    });
  });
});
