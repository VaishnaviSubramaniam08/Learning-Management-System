import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { getAuthToken } from '../api';
import faceDetectionService from '../services/faceDetectionService';

const AutoFaceLogin = ({ onLoginSuccess, userToken }) => {
  const [status, setStatus] = useState('Initializing face recognition...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [matchAttempts, setMatchAttempts] = useState(0);
  const [countdown, setCountdown] = useState(10);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const navigate = useNavigate();

  const maxAttempts = 15; // 15 attempts over ~10 seconds
  const attemptInterval = 700; // Check every 700ms

  useEffect(() => {
    initializeAutoLogin();
    startCountdown();
    
    return () => {
      cleanup();
    };
  }, []);

  const startCountdown = () => {
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    setError('Face recognition timeout. Please try manual login.');
    cleanup();
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const initializeAutoLogin = async () => {
    try {
      setStatus('Checking face registration status...');

      // Use passed token or get from storage using the utility function
      const token = userToken || getAuthToken();
      console.log('AutoFaceLogin - Token check:', !!token);
      console.log('AutoFaceLogin - Token source:', userToken ? 'passed as prop' : 'from storage');
      console.log('AutoFaceLogin - Token length:', token ? token.length : 0);

      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      // Verify token format (JWT should have 3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('❌ Invalid JWT token format. Expected 3 parts, got:', tokenParts.length);
        setError('Invalid token format. Please login again.');
        setLoading(false);
        return;
      }

      console.log('✅ Token format validation passed');
      console.log('AutoFaceLogin - Token will be sent in request headers');

      // Test token with a simple API call first
      try {
        const testResponse = await axios.get('/face-recognition/status');
        console.log('✅ Token test successful:', testResponse.status);
      } catch (testError) {
        console.error('❌ Token test failed:', testError.response?.status, testError.response?.data);
        setError(`Token validation failed: ${testError.response?.data?.message || 'Invalid token'}`);
        setLoading(false);
        return;
      }

      // Check if user has registered face data
      const statusResponse = await axios.get('/face-recognition/status');
      if (!statusResponse.data.isRegistered) {
        setError('No face data registered. Please register your face first.');
        setLoading(false);
        return;
      }

      // Check if attendance already marked today
      const attendanceResponse = await axios.get('/attendance/today-status');
      if (attendanceResponse.data.attendanceMarked) {
        setAttendanceMarked(true);
        setStatus('Attendance already marked today. Proceeding to dashboard...');
        setTimeout(() => {
          onLoginSuccess();
        }, 2000);
        return;
      }

      setStatus('Initializing face detection...');
      const initialized = await faceDetectionService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize face detection');
      }

      if (faceDetectionService.isMockMode()) {
        setStatus('⚠️ Development mode - Starting camera...');
      } else {
        setStatus('Starting camera for face recognition...');
      }

      await startCamera();
      startFaceRecognition();

    } catch (error) {
      console.error('Auto login initialization error:', error);
      setError(`Initialization failed: ${error.message}`);
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setLoading(false);
          setStatus('Look at the camera for automatic login...');
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setError('Camera access denied. Please enable camera permissions.');
      setLoading(false);
    }
  };

  const startFaceRecognition = () => {
    intervalRef.current = setInterval(async () => {
      if (matchAttempts >= maxAttempts) {
        setError('Face recognition failed. Please try manual login.');
        cleanup();
        return;
      }

      await attemptFaceMatch();
      setMatchAttempts(prev => prev + 1);
    }, attemptInterval);
  };

  const attemptFaceMatch = async () => {
    try {
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        return;
      }

      // Detect faces in current video frame
      const detections = await faceDetectionService.detectFaces(videoRef.current);
      
      if (!detections || detections.length === 0) {
        setStatus(`No face detected... (${countdown}s remaining)`);
        return;
      }

      const detection = detections[0];
      
      // Validate face quality
      const qualityCheck = faceDetectionService.validateFaceQuality(detection, videoRef.current);
      if (!qualityCheck.valid) {
        setStatus(`${qualityCheck.reason} (${countdown}s remaining)`);
        return;
      }

      // Perform liveness detection
      const livenessResult = faceDetectionService.performLivenessDetection(detection, videoRef.current);
      console.log('Liveness detection result:', livenessResult);

      if (!livenessResult.isLive) {
        setStatus(`Please look directly at camera (${countdown}s remaining)`);
        return;
      }

      setStatus('✅ Face detected! Verifying identity...');

      // Extract face encoding
      const faceEncoding = faceDetectionService.extractFaceEncoding(detection);
      console.log('Face encoding extracted:', faceEncoding ? 'Success' : 'Failed', faceEncoding?.length);

      if (!faceEncoding) {
        setStatus(`Face encoding failed (${countdown}s remaining)`);
        return;
      }

      // Send for verification
      console.log('Sending verification request...');
      const verificationResult = await verifyFaceForLogin(faceEncoding, detection, livenessResult);
      console.log('Verification result:', verificationResult);

      if (verificationResult.success) {
        // Face found and verified - redirect to dashboard immediately
        setStatus('✅ Face verified! Redirecting to dashboard...');
        handleSuccessfulLogin(verificationResult);
        return; // Stop further attempts
      } else {
        setStatus(`Verification failed: ${verificationResult.message} (${countdown}s remaining)`);
      }

    } catch (error) {
      console.error('Face matching error:', error);
      setStatus(`Recognition error (${countdown}s remaining)`);
    }
  };

  const verifyFaceForLogin = async (faceEncoding, detection, livenessResult) => {
    try {
      console.log('Making API call to /face-recognition/verify-login');

      // Get token and ensure it's available
      const token = userToken || localStorage.getItem('token');
      console.log('Verification - Token available:', !!token);
      console.log('Verification - Token value (first 20 chars):', token ? token.substring(0, 20) + '...' : 'null');
      console.log('Verification - userToken:', !!userToken);
      console.log('Verification - localStorage token:', !!localStorage.getItem('token'));

      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('Request data:', {
        faceEncodingLength: faceEncoding.length,
        livenessData: livenessResult,
        qualityScore: detection.detection.score
      });

      // Create request with explicit headers
      const requestConfig = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('Request config headers:', requestConfig.headers);
      console.log('Authorization header:', requestConfig.headers.Authorization);

      const response = await axios.post('/face-recognition/verify-login', {
        faceEncoding,
        livenessData: {
          isLive: livenessResult.isLive,
          confidence: livenessResult.confidence,
          securityScore: livenessResult.securityScore,
          checks: livenessResult.checks
        },
        deviceInfo: faceDetectionService.getDeviceSecurityInfo(),
        qualityScore: detection.detection.score
      }, requestConfig);

      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Verification API error:', error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Verification failed'
      };
    }
  };

  const handleSuccessfulLogin = (result) => {
    cleanup();
    setStatus('✅ Face verified successfully!');

    if (result.attendanceMarked) {
      setStatus('✅ Face verified! Attendance marked. Redirecting to dashboard...');
      setAttendanceMarked(true);
    } else {
      setStatus('✅ Face verified! Redirecting to dashboard...');
    }

    // Redirect immediately to dashboard
    setTimeout(() => {
      onLoginSuccess(result.user);
      // Force navigation to dashboard
      navigate('/student-dashboard');
    }, 1500);
  };

  const handleManualLogin = () => {
    cleanup();
    // Redirect to manual login form
    window.location.href = '/login';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>
          🎯 Automatic Face Login
        </h1>

        {/* Status Display */}
        <div style={{
          padding: '15px',
          background: error ? '#ffebee' :
                     (status.includes('✅') || attendanceMarked) ? '#e8f5e8' :
                     status.includes('Face detected') ? '#fff3e0' : '#e3f2fd',
          borderRadius: '8px',
          marginBottom: '20px',
          border: `2px solid ${error ? '#f44336' :
                                (status.includes('✅') || attendanceMarked) ? '#4caf50' :
                                status.includes('Face detected') ? '#ff9800' : '#2196f3'}`
        }}>
          <p style={{
            color: error ? '#c62828' :
                   (status.includes('✅') || attendanceMarked) ? '#2e7d32' :
                   status.includes('Face detected') ? '#f57c00' : '#1976d2',
            fontWeight: 'bold',
            margin: 0,
            fontSize: status.includes('✅') ? '18px' : '16px'
          }}>
            {error || status}
          </p>

          {!error && !attendanceMarked && !status.includes('✅') && countdown > 0 && (
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
              Timeout in {countdown} seconds
            </p>
          )}
        </div>

        {/* Video Feed */}
        {!error && !attendanceMarked && (
          <div style={{
            position: 'relative',
            marginBottom: '20px',
            borderRadius: '10px',
            overflow: 'hidden',
            background: '#000'
          }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                borderRadius: '10px'
              }}
              playsInline
              muted
            />
            
            {loading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                background: 'rgba(0,0,0,0.7)',
                padding: '10px 20px',
                borderRadius: '5px'
              }}>
                Loading camera...
              </div>
            )}

            {/* Attempt Counter */}
            {!loading && matchAttempts > 0 && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '12px'
              }}>
                Attempt {matchAttempts}/{maxAttempts}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={handleManualLogin}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Use Manual Login
          </button>

          {error && (
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Try Again
            </button>
          )}
        </div>

        {/* Instructions */}
        {!error && !attendanceMarked && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f5f5f5',
            borderRadius: '8px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Instructions:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
              <li>Look directly at the camera</li>
              <li>Ensure good lighting on your face</li>
              <li>Keep your face centered in the frame</li>
              <li>Stay still during recognition</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoFaceLogin;
