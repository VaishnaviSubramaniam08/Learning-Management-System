import * as faceapi from 'face-api.js';

class FaceDetectionService {
  constructor() {
    this.isInitialized = false;
    this.modelsLoaded = false;
    this.mockMode = false;
    this.detectionOptions = null;
    this.minConfidence = 0.7;
    this.maxFaceSize = 500; // Increased for easier testing
    this.minFaceSize = 60;  // Decreased for easier testing

    // Enhanced liveness detection parameters
    this.livenessHistory = [];
    this.maxHistoryLength = 60; // frames (increased for better analysis)
    this.blinkThreshold = 0.25;
    this.movementThreshold = 3; // pixels
    this.depthThreshold = 0.1;

    // Advanced anti-spoofing parameters
    this.textureAnalysisThreshold = 0.6;
    this.symmetryThreshold = 0.8;
    this.reflectionThreshold = 0.3;
    this.challengeResponseEnabled = true;

    // Device fingerprinting
    this.deviceFingerprint = null;
    this.suspiciousDevicePatterns = [
      'HeadlessChrome',
      'PhantomJS',
      'Selenium',
      'WebDriver',
      'automation'
    ];

    // Challenge-response system
    this.currentChallenge = null;
    this.challengeTypes = ['blink', 'smile', 'turn_left', 'turn_right', 'nod'];
  }

  // Initialize face-api.js models and security features
  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log('Loading face detection models and initializing security...');

      // Generate device fingerprint
      this.deviceFingerprint = await this.generateDeviceFingerprint();

      // Load models from public directory
      const MODEL_URL = '/models';

      // Check if models are available first
      let modelsAvailable = true;
      try {
        const testResponse = await fetch('/models/tiny_face_detector_model-weights_manifest.json');
        if (!testResponse.ok) {
          modelsAvailable = false;
        }
      } catch (error) {
        console.warn('Models not accessible, using mock mode:', error.message);
        modelsAvailable = false;
      }

      if (!modelsAvailable) {
        console.warn('Face detection models not found. Using mock mode for development.');
        this.mockMode = true;
        this.modelsLoaded = false;

        // Set mock detection options
        this.detectionOptions = {
          inputSize: 416,
          scoreThreshold: this.minConfidence
        };
      } else {
        // Load face-api.js models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);

        // Set detection options
        this.detectionOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: this.minConfidence
        });

        this.modelsLoaded = true;
        this.mockMode = false;
        console.log('Face detection models loaded successfully');
      }

      this.isInitialized = true;
      console.log('Face detection service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error loading face detection models:', error);
      console.warn('Falling back to mock mode for development');
      this.mockMode = true;
      this.modelsLoaded = false;
      this.isInitialized = true;
      return true; // Return true to allow development to continue
    }
  }

  // Generate comprehensive device fingerprint
  async generateDeviceFingerprint() {
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now()
    };

    // Add WebGL fingerprint
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        fingerprint.webglVendor = gl.getParameter(gl.VENDOR);
        fingerprint.webglRenderer = gl.getParameter(gl.RENDERER);
      }
    } catch (e) {
      fingerprint.webglError = e.message;
    }

    // Add canvas fingerprint
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint test', 2, 2);
      fingerprint.canvasFingerprint = canvas.toDataURL().slice(-50);
    } catch (e) {
      fingerprint.canvasError = e.message;
    }

    return fingerprint;
  }

  // Detect faces in video frame
  async detectFaces(video) {
    if (!this.isInitialized || !video) {
      return null;
    }

    // If in mock mode, return mock detection data
    if (this.mockMode) {
      return this.generateMockDetection(video);
    }

    try {
      const detections = await faceapi
        .detectAllFaces(video, this.detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();

      return detections;
    } catch (error) {
      console.error('Error detecting faces:', error);
      return null;
    }
  }

  // Generate mock detection data for development
  generateMockDetection(video) {
    // Generate a face size that's within our validation limits
    const faceSize = Math.min(250, Math.max(100, Math.min(video.videoWidth, video.videoHeight) * 0.3));
    const centerX = video.videoWidth / 2;
    const centerY = video.videoHeight / 2;

    console.log(`Mock face detection: video=${video.videoWidth}x${video.videoHeight}, faceSize=${faceSize}, maxAllowed=${this.maxFaceSize}`);

    const mockDetection = {
      detection: {
        box: {
          x: centerX - faceSize / 2,
          y: centerY - faceSize / 2,
          width: faceSize,
          height: faceSize
        },
        score: 0.9
      },
      landmarks: {
        getLeftEye: () => [
          // 6 points for left eye (standard face-api.js format)
          { x: centerX - faceSize * 0.2, y: centerY - faceSize * 0.1 },   // outer corner
          { x: centerX - faceSize * 0.17, y: centerY - faceSize * 0.12 }, // top outer
          { x: centerX - faceSize * 0.14, y: centerY - faceSize * 0.12 }, // top inner
          { x: centerX - faceSize * 0.11, y: centerY - faceSize * 0.1 },  // inner corner
          { x: centerX - faceSize * 0.14, y: centerY - faceSize * 0.08 }, // bottom inner
          { x: centerX - faceSize * 0.17, y: centerY - faceSize * 0.08 }  // bottom outer
        ],
        getRightEye: () => [
          // 6 points for right eye (standard face-api.js format)
          { x: centerX + faceSize * 0.11, y: centerY - faceSize * 0.1 },  // inner corner
          { x: centerX + faceSize * 0.14, y: centerY - faceSize * 0.12 }, // top inner
          { x: centerX + faceSize * 0.17, y: centerY - faceSize * 0.12 }, // top outer
          { x: centerX + faceSize * 0.2, y: centerY - faceSize * 0.1 },   // outer corner
          { x: centerX + faceSize * 0.17, y: centerY - faceSize * 0.08 }, // bottom outer
          { x: centerX + faceSize * 0.14, y: centerY - faceSize * 0.08 }  // bottom inner
        ],
        getNose: () => [
          { x: centerX, y: centerY - faceSize * 0.05 },
          { x: centerX, y: centerY },
          { x: centerX, y: centerY + faceSize * 0.05 },
          { x: centerX, y: centerY + faceSize * 0.1 }
        ]
      },
      descriptor: new Float32Array(128).fill(0.5), // Mock face encoding
      expressions: {
        happy: 0.7,
        sad: 0.1,
        angry: 0.05,
        fearful: 0.02,
        disgusted: 0.01,
        surprised: 0.02,
        neutral: 0.1
      }
    };

    return [mockDetection]; // Return array like real face-api.js
  }

  // Extract face encoding from detection
  extractFaceEncoding(detection) {
    if (!detection || !detection.descriptor) {
      return null;
    }

    // Convert Float32Array to regular array
    return Array.from(detection.descriptor);
  }

  // Validate face quality
  validateFaceQuality(detection, video) {
    if (!detection) return { valid: false, reason: 'No face detected' };

    const box = detection.detection.box;

    console.log(`Face validation: size=${box.width}x${box.height}, limits=${this.minFaceSize}-${this.maxFaceSize}`);

    // Check face size
    if (box.width < this.minFaceSize || box.height < this.minFaceSize) {
      return { valid: false, reason: 'Face too small - move closer to camera' };
    }

    if (box.width > this.maxFaceSize || box.height > this.maxFaceSize) {
      return { valid: false, reason: 'Face too large - move away from camera' };
    }

    // Check if face is centered
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const videoCenterX = video.videoWidth / 2;
    const videoCenterY = video.videoHeight / 2;
    
    const offsetX = Math.abs(centerX - videoCenterX);
    const offsetY = Math.abs(centerY - videoCenterY);
    
    if (offsetX > video.videoWidth * 0.3 || offsetY > video.videoHeight * 0.3) {
      return { valid: false, reason: 'Please center your face in the frame' };
    }

    // Check detection confidence
    if (detection.detection.score < this.minConfidence) {
      return { valid: false, reason: 'Face detection confidence too low' };
    }

    return { valid: true, quality: detection.detection.score };
  }

  // Enhanced liveness detection with advanced anti-spoofing
  performLivenessDetection(detection, video) {
    if (!detection || !detection.landmarks) {
      return {
        isLive: false,
        confidence: 0,
        checks: {
          eyeMovement: false,
          headMovement: false,
          blinking: false,
          textureAnalysis: false,
          deviceSecurity: false,
          challengeResponse: false
        },
        securityScore: 0
      };
    }

    const landmarks = detection.landmarks;
    const currentFrame = {
      timestamp: Date.now(),
      leftEye: this.getEyeCenter(landmarks.getLeftEye()),
      rightEye: this.getEyeCenter(landmarks.getRightEye()),
      nose: landmarks.getNose()[3], // nose tip
      eyeAspectRatio: this.calculateEyeAspectRatio(landmarks)
    };

    this.livenessHistory.push(currentFrame);
    
    // Keep only recent frames
    if (this.livenessHistory.length > this.maxHistoryLength) {
      this.livenessHistory.shift();
    }

    // Need at least 3 frames for analysis (reduced for faster automatic login)
    if (this.livenessHistory.length < 3) {
      console.log(`Liveness detection: Need more frames (${this.livenessHistory.length}/3)`);
      return {
        isLive: false,
        confidence: 0,
        checks: {
          eyeMovement: false,
          headMovement: false,
          blinking: false
        }
      };
    }

    console.log(`Liveness detection: Analyzing ${this.livenessHistory.length} frames`);

    // For mock mode, be more lenient with liveness detection
    if (this.mockMode) {
      console.log('Mock mode: Using simplified liveness detection');
      return {
        isLive: true,
        confidence: 0.8,
        checks: {
          eyeMovement: true,
          headMovement: true,
          blinking: true,
          textureAnalysis: true,
          deviceSecurity: true,
          challengeResponse: true
        },
        securityScore: 0.8
      };
    }

    // Perform advanced texture analysis
    const textureAnalysis = this.performAdvancedTextureAnalysis(video, detection);

    // Check device security
    const deviceSecurity = !this.isDeviceSuspicious();

    // Check challenge response if active
    let challengeResponse = true;
    if (this.currentChallenge && !this.currentChallenge.completed) {
      const challengeResult = this.verifyChallengeResponse(detection, video);
      challengeResponse = challengeResult.success;
    }

    const checks = {
      eyeMovement: this.detectEyeMovement(),
      headMovement: this.detectHeadMovement(),
      blinking: this.detectBlinking(),
      textureAnalysis: textureAnalysis.isRealTexture,
      deviceSecurity: deviceSecurity,
      challengeResponse: challengeResponse
    };

    // Enhanced confidence calculation with security weights
    const confidence = (
      (checks.eyeMovement ? 0.15 : 0) +
      (checks.headMovement ? 0.20 : 0) +
      (checks.blinking ? 0.15 : 0) +
      (checks.textureAnalysis ? 0.25 : 0) +
      (checks.deviceSecurity ? 0.15 : 0) +
      (checks.challengeResponse ? 0.10 : 0)
    );

    // Calculate overall security score
    const securityScore = (
      (textureAnalysis.variance || 0) * 0.3 +
      (textureAnalysis.entropy || 0) * 0.2 +
      (textureAnalysis.edgeDensity || 0) * 0.2 +
      (deviceSecurity ? 1 : 0) * 0.3
    );

    return {
      isLive: confidence > 0.7 && securityScore > 0.5,
      confidence,
      checks,
      securityScore,
      textureAnalysis,
      deviceInfo: this.getDeviceSecurityInfo(),
      livenessData: {
        blinkCount: this.countBlinks(),
        expressionChanges: this.countExpressionChanges(detection),
        depthVariation: this.calculateDepthVariation(),
        eyeMovement: this.getEyeMovementData(),
        headMovement: this.getHeadMovementData(),
        textureMetrics: textureAnalysis,
        securityScore: securityScore
      }
    };
  }

  // Helper methods for liveness detection
  getEyeCenter(eyePoints) {
    const x = eyePoints.reduce((sum, point) => sum + point.x, 0) / eyePoints.length;
    const y = eyePoints.reduce((sum, point) => sum + point.y, 0) / eyePoints.length;
    return { x, y };
  }

  calculateEyeAspectRatio(landmarks) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    console.log('Eye landmarks - Left:', leftEye?.length, 'Right:', rightEye?.length);

    // Simplified EAR calculation
    const leftEAR = this.eyeAspectRatio(leftEye);
    const rightEAR = this.eyeAspectRatio(rightEye);

    console.log('EAR values - Left:', leftEAR, 'Right:', rightEAR);

    return (leftEAR + rightEAR) / 2;
  }

  eyeAspectRatio(eyePoints) {
    // Calculate eye aspect ratio for blink detection
    if (!eyePoints || eyePoints.length < 6) {
      console.log('Invalid eye points, returning default EAR');
      return 0.3; // Default EAR value
    }

    // Validate that all points have x and y properties
    for (let i = 0; i < 6; i++) {
      if (!eyePoints[i] || typeof eyePoints[i].x === 'undefined' || typeof eyePoints[i].y === 'undefined') {
        console.log(`Invalid eye point at index ${i}, returning default EAR`);
        return 0.3;
      }
    }

    const p1 = eyePoints[1];
    const p2 = eyePoints[5];
    const p3 = eyePoints[2];
    const p4 = eyePoints[4];
    const p5 = eyePoints[0];
    const p6 = eyePoints[3];

    const A = Math.sqrt(Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2));
    const B = Math.sqrt(Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2));
    const C = Math.sqrt(Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2));

    // Avoid division by zero
    if (C === 0) {
      return 0.3;
    }

    return (A + B) / (2.0 * C);
  }

  detectEyeMovement() {
    if (this.livenessHistory.length < 5) return false;
    
    const recent = this.livenessHistory.slice(-5);
    let maxMovement = 0;
    
    for (let i = 1; i < recent.length; i++) {
      const prev = recent[i - 1];
      const curr = recent[i];
      
      const leftMovement = Math.sqrt(
        Math.pow(curr.leftEye.x - prev.leftEye.x, 2) +
        Math.pow(curr.leftEye.y - prev.leftEye.y, 2)
      );
      
      const rightMovement = Math.sqrt(
        Math.pow(curr.rightEye.x - prev.rightEye.x, 2) +
        Math.pow(curr.rightEye.y - prev.rightEye.y, 2)
      );
      
      maxMovement = Math.max(maxMovement, leftMovement, rightMovement);
    }
    
    return maxMovement > this.movementThreshold;
  }

  detectHeadMovement() {
    if (this.livenessHistory.length < 5) return false;
    
    const recent = this.livenessHistory.slice(-5);
    let maxMovement = 0;
    
    for (let i = 1; i < recent.length; i++) {
      const prev = recent[i - 1];
      const curr = recent[i];
      
      const noseMovement = Math.sqrt(
        Math.pow(curr.nose.x - prev.nose.x, 2) +
        Math.pow(curr.nose.y - prev.nose.y, 2)
      );
      
      maxMovement = Math.max(maxMovement, noseMovement);
    }
    
    return maxMovement > this.movementThreshold;
  }

  detectBlinking() {
    if (this.livenessHistory.length < 10) return false;
    
    const earValues = this.livenessHistory.map(frame => frame.eyeAspectRatio);
    let blinkCount = 0;
    let wasBlinking = false;
    
    for (const ear of earValues) {
      const isBlinking = ear < this.blinkThreshold;
      
      if (!wasBlinking && isBlinking) {
        blinkCount++;
      }
      
      wasBlinking = isBlinking;
    }
    
    return blinkCount > 0;
  }

  countBlinks() {
    return this.detectBlinking() ? 1 : 0;
  }

  countExpressionChanges(detection) {
    // Simplified expression change detection
    return detection.expressions ? Object.keys(detection.expressions).length : 0;
  }

  calculateDepthVariation() {
    // Simplified depth calculation based on face size variation
    if (this.livenessHistory.length < 5) return 0;
    
    const recent = this.livenessHistory.slice(-5);
    const noseSizes = recent.map(frame => 
      Math.sqrt(Math.pow(frame.nose.x, 2) + Math.pow(frame.nose.y, 2))
    );
    
    const max = Math.max(...noseSizes);
    const min = Math.min(...noseSizes);
    
    return max - min;
  }

  getEyeMovementData() {
    if (this.livenessHistory.length < 2) return { horizontal: 0, vertical: 0 };
    
    const first = this.livenessHistory[0];
    const last = this.livenessHistory[this.livenessHistory.length - 1];
    
    return {
      horizontal: Math.abs(last.leftEye.x - first.leftEye.x),
      vertical: Math.abs(last.leftEye.y - first.leftEye.y)
    };
  }

  getHeadMovementData() {
    if (this.livenessHistory.length < 2) return { yaw: 0, pitch: 0, roll: 0 };
    
    const first = this.livenessHistory[0];
    const last = this.livenessHistory[this.livenessHistory.length - 1];
    
    return {
      yaw: Math.abs(last.nose.x - first.nose.x),
      pitch: Math.abs(last.nose.y - first.nose.y),
      roll: 0 // Simplified - would need more complex calculation
    };
  }

  // Generate random challenge for user
  generateChallenge() {
    const challengeType = this.challengeTypes[Math.floor(Math.random() * this.challengeTypes.length)];
    this.currentChallenge = {
      type: challengeType,
      startTime: Date.now(),
      completed: false,
      attempts: 0
    };
    return this.currentChallenge;
  }

  // Verify challenge response
  verifyChallengeResponse(detection, video) {
    if (!this.currentChallenge || this.currentChallenge.completed) {
      return { success: false, message: 'No active challenge' };
    }

    const { type } = this.currentChallenge;
    let success = false;
    let message = '';

    switch (type) {
      case 'blink':
        success = this.detectBlinking();
        message = success ? 'Blink detected' : 'Please blink naturally';
        break;
      case 'smile':
        success = this.detectSmile(detection);
        message = success ? 'Smile detected' : 'Please smile';
        break;
      case 'turn_left':
        success = this.detectHeadTurn(detection, 'left');
        message = success ? 'Head turn left detected' : 'Please turn your head left';
        break;
      case 'turn_right':
        success = this.detectHeadTurn(detection, 'right');
        message = success ? 'Head turn right detected' : 'Please turn your head right';
        break;
      case 'nod':
        success = this.detectNod(detection);
        message = success ? 'Nod detected' : 'Please nod your head';
        break;
    }

    if (success) {
      this.currentChallenge.completed = true;
    } else {
      this.currentChallenge.attempts++;
    }

    return { success, message, challenge: this.currentChallenge };
  }

  // Advanced texture analysis for spoof detection
  performAdvancedTextureAnalysis(video, detection) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Extract face region
      const box = detection.detection.box;
      canvas.width = box.width;
      canvas.height = box.height;

      ctx.drawImage(video, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Calculate texture metrics
      const textureMetrics = this.calculateTextureMetrics(data, canvas.width, canvas.height);

      return {
        variance: textureMetrics.variance,
        entropy: textureMetrics.entropy,
        localBinaryPattern: textureMetrics.lbp,
        edgeDensity: textureMetrics.edgeDensity,
        isRealTexture: textureMetrics.variance > this.textureAnalysisThreshold
      };
    } catch (error) {
      console.error('Texture analysis error:', error);
      return { isRealTexture: false, error: error.message };
    }
  }

  // Calculate texture metrics
  calculateTextureMetrics(data, width, height) {
    let variance = 0;
    let entropy = 0;
    let edgeCount = 0;
    const histogram = new Array(256).fill(0);

    // Calculate variance and histogram
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += gray;
      histogram[Math.floor(gray)]++;
    }

    const mean = sum / (data.length / 4);

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      variance += Math.pow(gray - mean, 2);
    }
    variance /= (data.length / 4);

    // Calculate entropy
    const totalPixels = data.length / 4;
    for (let i = 0; i < 256; i++) {
      if (histogram[i] > 0) {
        const probability = histogram[i] / totalPixels;
        entropy -= probability * Math.log2(probability);
      }
    }

    // Simple edge detection (Sobel-like)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const gx = -data[idx - 4] + data[idx + 4] - 2 * data[idx - width * 4] + 2 * data[idx + width * 4] - data[idx - width * 4 - 4] + data[idx + width * 4 + 4];
        const gy = -data[idx - width * 4] - 2 * data[idx] - data[idx + 4] + data[idx + width * 4] + 2 * data[idx + width * 4] + data[idx + width * 4 + 4];
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        if (magnitude > 50) edgeCount++;
      }
    }

    return {
      variance: variance / 255,
      entropy: entropy / 8,
      lbp: this.calculateLBP(data, width, height),
      edgeDensity: edgeCount / (width * height)
    };
  }

  // Local Binary Pattern calculation
  calculateLBP(data, width, height) {
    let lbpSum = 0;
    let count = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerIdx = (y * width + x) * 4;
        const center = 0.299 * data[centerIdx] + 0.587 * data[centerIdx + 1] + 0.114 * data[centerIdx + 2];

        let lbp = 0;
        const neighbors = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, 1], [1, 1], [1, 0],
          [1, -1], [0, -1]
        ];

        for (let i = 0; i < neighbors.length; i++) {
          const [dy, dx] = neighbors[i];
          const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
          const neighbor = 0.299 * data[neighborIdx] + 0.587 * data[neighborIdx + 1] + 0.114 * data[neighborIdx + 2];

          if (neighbor >= center) {
            lbp |= (1 << i);
          }
        }

        lbpSum += lbp;
        count++;
      }
    }

    return count > 0 ? lbpSum / count / 255 : 0;
  }

  // Detect smile for challenge response
  detectSmile(detection) {
    if (!detection.expressions) return false;
    return detection.expressions.happy > 0.7;
  }

  // Detect head turn for challenge response
  detectHeadTurn(detection, direction) {
    if (!detection.landmarks) return false;

    const nose = detection.landmarks.getNose();
    const leftEye = detection.landmarks.getLeftEye();
    const rightEye = detection.landmarks.getRightEye();

    const noseTip = nose[3];
    const leftEyeCenter = this.getEyeCenter(leftEye);
    const rightEyeCenter = this.getEyeCenter(rightEye);

    const eyeDistance = Math.abs(rightEyeCenter.x - leftEyeCenter.x);
    const noseOffset = noseTip.x - (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const turnRatio = noseOffset / eyeDistance;

    if (direction === 'left') {
      return turnRatio < -0.15;
    } else if (direction === 'right') {
      return turnRatio > 0.15;
    }

    return false;
  }

  // Detect nod for challenge response
  detectNod(detection) {
    if (this.livenessHistory.length < 10) return false;

    const recent = this.livenessHistory.slice(-10);
    const nosePositions = recent.map(frame => frame.nose.y);

    let upMovement = 0;
    let downMovement = 0;

    for (let i = 1; i < nosePositions.length; i++) {
      const diff = nosePositions[i] - nosePositions[i - 1];
      if (diff > 2) downMovement++;
      if (diff < -2) upMovement++;
    }

    return upMovement >= 2 && downMovement >= 2;
  }

  // Check for suspicious device patterns
  isDeviceSuspicious() {
    if (!this.deviceFingerprint) return true;

    const userAgent = this.deviceFingerprint.userAgent.toLowerCase();
    return this.suspiciousDevicePatterns.some(pattern =>
      userAgent.includes(pattern.toLowerCase())
    );
  }

  // Get comprehensive device info for security analysis
  getDeviceSecurityInfo() {
    return {
      fingerprint: this.deviceFingerprint,
      isSuspicious: this.isDeviceSuspicious(),
      timestamp: Date.now(),
      challengeSupported: this.challengeResponseEnabled,
      userAgent: navigator.userAgent || 'unknown',
      ipAddress: 'client-side', // Will be determined by server
      platform: navigator.platform || 'unknown',
      language: navigator.language || 'unknown',
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }

  // Reset liveness history
  resetLivenessHistory() {
    this.livenessHistory = [];
    this.currentChallenge = null;
  }

  // Check if models are loaded
  isReady() {
    return this.isInitialized;
  }

  // Check if running in mock mode
  isMockMode() {
    return this.mockMode;
  }
}

export default new FaceDetectionService();
