import React, { useState, useRef, useEffect } from 'react';
import axios from '../api';
import faceDetectionService from '../services/faceDetectionService';
import ConsentManager from './ConsentManager';
import QuickConsentButton from './QuickConsentButton';

const FaceRegistration = ({ onClose, onRegistered }) => {
  const [status, setStatus] = useState('Initializing camera...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [capturedImages, setCapturedImages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConsentManager, setShowConsentManager] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const steps = [
    { instruction: 'Look straight at the camera', angle: 'front' },
    { instruction: 'Turn your head slightly to the left', angle: 'left' },
    { instruction: 'Turn your head slightly to the right', angle: 'right' },
    { instruction: 'Tilt your head slightly up', angle: 'up' },
    { instruction: 'Tilt your head slightly down', angle: 'down' }
  ];

  useEffect(() => {
    initializeFaceDetection();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeFaceDetection = async () => {
    setStatus('Checking consent and initializing...');
    try {
      // For new users, we'll show consent manager first
      // Check if user already has face data registered
      try {
        console.log('Checking face registration status...');
        const faceStatusResponse = await axios.get('/face-recognition/status');
        console.log('Face status response:', faceStatusResponse.data);

        if (faceStatusResponse.data.isRegistered) {
          // User already has face data, no need to register again
          setError('Face data already registered. You can update it from your profile settings.');
          setLoading(false);
          return;
        }
      } catch (faceStatusError) {
        console.log('Face status check failed, proceeding with registration:', faceStatusError.message);
        // Continue with registration even if status check fails
      }

      // Check consent status
      try {
        console.log('Checking privacy status...');
        const consentResponse = await axios.get('/privacy/status');
        console.log('Privacy status response:', consentResponse.data);

        if (consentResponse.data.status && !consentResponse.data.status.consentGiven) {
          setShowConsentManager(true);
          setLoading(false);
          return;
        }
      } catch (consentError) {
        console.log('Privacy status check failed, showing consent button:', consentError.message);
        // If privacy check fails, show quick consent button to be safe
        setShowConsentManager(true);
        setLoading(false);
        return;
      }

      setConsentGiven(true);
      setStatus('Initializing face detection...');

      const initialized = await faceDetectionService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize face detection');
      }

      // Check if running in mock mode
      if (faceDetectionService.isMockMode()) {
        setStatus('⚠️ Running in development mode (face detection models not loaded)');
        console.warn('Face detection service is running in mock mode');
      } else {
        setStatus('Face detection initialized successfully');
      }

      startCamera();
    } catch (error) {
      console.error('Initialization error:', error);
      setError('Failed to initialize face detection. Please refresh and try again.');
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          setLoading(false);
          setStatus(`Step ${currentStep + 1}/5: ${steps[currentStep].instruction}`);
        };
      }
    } catch (err) {
      setError('Failed to access camera. Please grant camera permissions.');
      setLoading(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    try {
      setStatus('Capturing face...');

      // Detect faces in current video frame
      const detections = await faceDetectionService.detectFaces(videoRef.current);

      if (!detections || detections.length === 0) {
        setError('No face detected. Please ensure your face is clearly visible.');
        return;
      }

      const detection = detections[0];

      // Validate face quality
      const qualityCheck = faceDetectionService.validateFaceQuality(detection, videoRef.current);
      if (!qualityCheck.valid) {
        setError(qualityCheck.reason);
        return;
      }

      // Extract face encoding
      const faceEncoding = faceDetectionService.extractFaceEncoding(detection);

      if (faceEncoding) {
        const newImage = {
          encoding: faceEncoding,
          angle: steps[currentStep].angle,
          quality: qualityCheck.quality
        };

        setCapturedImages(prev => [...prev, newImage]);

        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
          setStatus(`Step ${currentStep + 2}/5: ${steps[currentStep + 1].instruction}`);
        } else {
          // All images captured, register face
          await registerFace([...capturedImages, newImage]);
        }
      } else {
        setError('Failed to extract face data. Please try again.');
      }
    } catch (error) {
      console.error('Face capture error:', error);
      setError('Face capture failed. Please try again.');
    }
  };



  const registerFace = async (images) => {
    setStatus('Processing and registering face data...');
    setLoading(true);

    try {
      // Register each face encoding
      for (const image of images) {
        await axios.post('/face-recognition/register', {
          faceEncoding: image.encoding,
          quality: image.quality
        });
      }

      setStatus('✅ Face registered successfully!');
      
      setTimeout(() => {
        if (onRegistered) onRegistered();
        if (onClose) onClose();
      }, 2000);

    } catch (err) {
      console.error('Face registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to register face. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setStatus(`Step ${currentStep + 2}/5: ${steps[currentStep + 1].instruction}`);
      setError('');
    }
  };

  const handleConsentUpdate = () => {
    // Consent has been given, proceed with face detection
    setConsentGiven(true);
    setShowConsentManager(false);
    setStatus('Initializing face detection...');

    // Initialize face detection after consent
    const initializeAfterConsent = async () => {
      try {
        const initialized = await faceDetectionService.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize face detection');
        }

        // Check if running in mock mode
        if (faceDetectionService.isMockMode()) {
          setStatus('⚠️ Running in development mode (face detection models not loaded)');
          console.warn('Face detection service is running in mock mode');
        } else {
          setStatus('Face detection initialized successfully');
        }

        startCamera();
      } catch (error) {
        console.error('Initialization error after consent:', error);
        setError('Failed to initialize face detection. Please refresh and try again.');
        setLoading(false);
      }
    };

    initializeAfterConsent();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '600px',
        width: '90%'
      }}>
        <h3>📸 Face Registration</h3>
        
        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            height: '100%',
            backgroundColor: '#4caf50',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>

        {/* Status */}
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: error ? '#ffebee' : '#e8f5e8',
          borderRadius: '5px',
          border: `1px solid ${error ? '#f44336' : '#4caf50'}`
        }}>
          <div style={{
            color: error ? '#f44336' : '#2e7d32',
            fontWeight: 'bold'
          }}>
            {error || status}
          </div>
        </div>

        {/* Video Feed */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          height: '360px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '15px',
          margin: '0 auto 15px'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)'
            }}
          ></video>
          
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          ></canvas>

          {/* Face guide overlay */}
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '25%',
            right: '25%',
            bottom: '15%',
            border: '3px solid #4caf50',
            borderRadius: '50%',
            opacity: 0.7
          }}></div>
        </div>

        {/* Captured Images Counter */}
        <div style={{ marginBottom: '15px' }}>
          <span>Images captured: {capturedImages.length}/5</span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '5px' }}>
            {steps.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: index < capturedImages.length ? '#4caf50' : 
                                 index === currentStep ? '#2196f3' : '#e0e0e0'
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div style={{ marginBottom: '20px', fontSize: '14px' }}>
          <p>Follow the instructions to capture your face from different angles</p>
          <p>This helps improve recognition accuracy and security</p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {!loading && currentStep < steps.length && (
            <>
              <button
                onClick={captureImage}
                style={{
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📸 Capture
              </button>
              
              <button
                onClick={handleSkip}
                style={{
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Skip This Angle
              </button>
            </>
          )}
          
          <button
            onClick={onClose}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Quick Consent Modal */}
      {showConsentManager && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '20px'
          }}>
            <QuickConsentButton
              onConsentGiven={handleConsentUpdate}
            />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={onClose}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceRegistration;