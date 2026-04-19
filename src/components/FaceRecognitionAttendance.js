
import React, { useState, useEffect, useRef } from 'react';
import axios from '../api';
import io from 'socket.io-client';
import './FaceRecognitionAttendance.css';

const FaceRecognitionAttendance = ({ user, onAttendanceMarked, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('idle');
  const [recognizedUser, setRecognizedUser] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasRegisteredFace, setHasRegisteredFace] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join face recognition room
    newSocket.emit('face_recognition_join', user?.id);

    // Listen for real-time attendance updates
    newSocket.on('attendance_marked', (data) => {
      console.log('📋 Attendance marked:', data);
      setAttendanceRecords(prev => [data, ...prev]);
      showToastMessage('✅ Attendance marked successfully!', 'success');
    });

    newSocket.on('face_recognition_result', (data) => {
      console.log('👤 Face recognition result:', data);
      if (data.success) {
        setRecognizedUser(data.user);
        setConfidence(data.confidence);
        setDetectionStatus('recognized');
      } else {
        setDetectionStatus('unknown');
      }
    });

    // Check if user has registered face data
    checkFaceRegistration();

    // Load today's attendance
    loadTodayAttendance();

    // Load attendance records
    loadAttendanceRecords();

    // Check if user is admin
    setIsAdmin(user?.role === 'admin' || user?.role === 'instructor');

    return () => {
      newSocket.disconnect();
      stopCamera();
    };
  }, [user]);

  const checkFaceRegistration = async () => {
    try {
      const response = await axios.get(`/face-recognition/check-registration/${user?.id}`);
      setHasRegisteredFace(response.data.hasRegistration);
    } catch (error) {
      console.error('Error checking face registration:', error);
    }
  };

  const loadFaceAPI = async () => {
    setStatus('Loading face recognition models...');
    try {
      const initialized = await faceDetectionService.initialize();

      if (!initialized) {
        throw new Error('Failed to initialize face detection models');
      }

      setStatus('Face recognition models loaded');
      startVideo();
    } catch (err) {
      console.error('Error loading face-api models:', err);
      setError('Failed to load face recognition models. Please refresh and try again.');
      setLoading(false);
    }
  };

  const startVideo = async () => {
    setStatus('Requesting camera access...');
    try {
      // Get current position
      try {
        const pos = await getCurrentPosition();
        setPosition(pos.coords);
      } catch (posErr) {
        console.warn('Could not get position:', posErr);
      }

      // Access webcam with enhanced settings for face recognition
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          setStatus('Camera ready. Position your face in the frame...');
          setLoading(false);
          startFaceDetection();
        };
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      setLoading(false);
    }
  };

  const startFaceDetection = async () => {
    setStatus('Detecting face...');

    if (verificationAttempts >= 3) {
      setError('Maximum verification attempts reached. Please try again later.');
      return;
    }

    if (!faceDetectionService.isReady()) {
      setError('Face detection models not ready. Please wait and try again.');
      return;
    }

    try {
      // Start continuous face detection
      const detectionInterval = setInterval(async () => {
        if (!videoRef.current) {
          clearInterval(detectionInterval);
          return;
        }

        const detections = await faceDetectionService.detectFaces(videoRef.current);

        if (detections && detections.length > 0) {
          const detection = detections[0]; // Use first detected face

          // Validate face quality
          const qualityCheck = faceDetectionService.validateFaceQuality(detection, videoRef.current);

          if (!qualityCheck.valid) {
            setStatus(qualityCheck.reason);
            return;
          }

          setStatus('Face detected! Performing liveness check...');
          clearInterval(detectionInterval);
          performLivenessCheck(detection);
        } else {
          setStatus('No face detected. Please position your face in the frame.');
        }
      }, 500); // Check every 500ms

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(detectionInterval);
        if (status.includes('Detecting face')) {
          setError('Face detection timeout. Please ensure your face is visible and try again.');
        }
      }, 30000);

    } catch (error) {
      console.error('Face detection error:', error);
      setError('Face detection failed. Please try again.');
    }
  };

  const performLivenessCheck = async (initialDetection) => {
    setStatus('Please blink naturally and move your head slightly...');

    try {
      // Reset liveness history for fresh detection
      faceDetectionService.resetLivenessHistory();

      let livenessFrames = 0;
      const maxFrames = 60; // 30 seconds at 2fps
      let bestDetection = initialDetection;

      const livenessInterval = setInterval(async () => {
        if (!videoRef.current) {
          clearInterval(livenessInterval);
          return;
        }

        const detections = await faceDetectionService.detectFaces(videoRef.current);

        if (detections && detections.length > 0) {
          const detection = detections[0];
          const livenessResult = faceDetectionService.performLivenessDetection(detection, videoRef.current);

          // Update best detection if this one is better
          if (detection.detection.score > bestDetection.detection.score) {
            bestDetection = detection;
          }

          livenessFrames++;

          // Update status based on liveness checks
          const checks = livenessResult.checks;
          let statusMessage = 'Liveness check: ';
          if (checks.blinking) statusMessage += '✓ Blinking ';
          if (checks.eyeMovement) statusMessage += '✓ Eye movement ';
          if (checks.headMovement) statusMessage += '✓ Head movement ';

          setStatus(statusMessage);

          // Enhanced security check based on security level
          const securityPassed = checkSecurityLevel(livenessResult);

          if (securityPassed) {
            clearInterval(livenessInterval);

            // For enhanced security, require challenge-response
            if (securityLevel === 'enhanced' && !challengeCompleted) {
              setShowChallenge(true);
              setStatus('Security challenge required...');
              return;
            }

            setStatus('Liveness verified! Processing face recognition...');
            startCountdown(bestDetection, livenessResult.livenessData);
            return;
          }

          if (livenessFrames >= maxFrames) {
            clearInterval(livenessInterval);
            setSpoofDetected(true);
            setError('Liveness check failed. Please ensure natural movement and try again.');
            return;
          }
        } else {
          setStatus('Face lost during liveness check. Please keep your face in frame.');
        }
      }, 500); // Check every 500ms

    } catch (error) {
      console.error('Liveness check error:', error);
      setError('Liveness check failed. Please try again.');
    }
  };

  const startCountdown = (detection, livenessData) => {
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          verifyFaceAndMarkAttendance(detection, livenessData);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const verifyFaceAndMarkAttendance = async (detection, livenessData) => {
    setStatus('Verifying identity...');
    setVerificationAttempts(prev => prev + 1);

    try {
      // Extract face encoding from detection
      const faceEncoding = faceDetectionService.extractFaceEncoding(detection);

      if (!faceEncoding) {
        setError('Failed to extract face data. Please try again.');
        return;
      }

      // Verify face with backend
      const response = await axios.post('/face-recognition/verify', {
        faceEncoding,
        sessionId,
        courseId,
        livenessData,
        location: position ? {
          latitude: position.latitude,
          longitude: position.longitude
        } : null
      });
      
      if (response.data.success) {
        setStatus('✅ Identity verified! Attendance marked successfully!');
        
        // Notify parent component
        if (onAttendanceMarked) {
          onAttendanceMarked({
            status: 'Present',
            method: 'Face Recognition',
            location: position ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` : 'Unknown',
            confidence: response.data.confidence,
            processingTime: response.data.processingTime
          });
        }
        
        // Close after delay
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        if (response.data.spoofDetected) {
          setSpoofDetected(true);
          setError('Security check failed. Spoof attempt detected.');
        } else {
          setError(`Verification failed: ${response.data.message}`);
        }
      }
      
    } catch (err) {
      console.error('Error verifying face:', err);
      setError(err.response?.data?.message || 'Face verification failed. Please try again.');
    }
  };

  // Check security level requirements
  const checkSecurityLevel = (livenessResult) => {
    switch (securityLevel) {
      case 'standard':
        return livenessResult.isLive && livenessResult.confidence > 0.6;
      case 'enhanced':
        return livenessResult.isLive &&
               livenessResult.confidence > 0.7 &&
               livenessResult.securityScore > 0.5;
      case 'maximum':
        return livenessResult.isLive &&
               livenessResult.confidence > 0.8 &&
               livenessResult.securityScore > 0.7 &&
               livenessResult.checks.textureAnalysis &&
               livenessResult.checks.deviceSecurity;
      default:
        return livenessResult.isLive && livenessResult.confidence > 0.7;
    }
  };

  // Handle challenge completion
  const handleChallengeComplete = (challengeData) => {
    setChallengeCompleted(true);
    setShowChallenge(false);
    setStatus('Challenge completed! Continuing verification...');

    // Continue with face recognition after challenge
    setTimeout(() => {
      setStatus('Processing face recognition...');
      // The liveness check should continue from where it left off
    }, 1000);
  };

  // Handle challenge failure
  const handleChallengeFailed = (challengeData) => {
    setShowChallenge(false);
    setSpoofDetected(true);
    setError('Security challenge failed. Please try again.');
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      }
    });
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (onClose) onClose();
  };

  const handleRetry = () => {
    setError('');
    setSpoofDetected(false);
    setVerificationAttempts(0);
    setCountdown(null);
    startFaceDetection();
  };

  if (!isRegistered) {
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
          padding: '30px',
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h3>❌ Face Not Registered</h3>
          <p>You need to register your face before using face recognition attendance.</p>
          <button onClick={handleClose} style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'white', 
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
        <h3>🔐 Face Recognition Attendance</h3>
        
        {/* Status Display */}
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px',
          backgroundColor: error ? '#ffebee' : spoofDetected ? '#fff3e0' : '#e8f5e8',
          borderRadius: '5px',
          border: `1px solid ${error ? '#f44336' : spoofDetected ? '#ff9800' : '#4caf50'}`
        }}>
          {countdown && (
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
              {countdown}
            </div>
          )}
          <div style={{ 
            color: error ? '#f44336' : spoofDetected ? '#ff9800' : '#2e7d32',
            fontWeight: 'bold'
          }}>
            {error || status}
          </div>
          {spoofDetected && (
            <div style={{ fontSize: '12px', color: '#ff9800', marginTop: '5px' }}>
              Security measures detected suspicious activity
            </div>
          )}
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
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          )}
          
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
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: 'scaleX(-1)'
            }}
          ></canvas>

          {/* Challenge Response Verification */}
          {showChallenge && (
            <ChallengeResponseVerification
              videoRef={videoRef}
              onChallengeComplete={handleChallengeComplete}
              onChallengeFailed={handleChallengeFailed}
              isActive={showChallenge}
            />
          )}

          {/* Face detection overlay */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            right: '20%',
            bottom: '20%',
            border: '2px solid #4caf50',
            borderRadius: '50%',
            opacity: loading ? 0 : 0.7
          }}></div>
        </div>

        {/* Security Indicators */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          marginBottom: '15px',
          fontSize: '12px'
        }}>
          <div>🔒 Encrypted Processing</div>
          <div>👁️ Liveness Detection</div>
          <div>🛡️ Spoof Protection</div>
        </div>

        {/* Instructions */}
        <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '14px' }}>
          <p>📏 Center your face in the circle</p>
          <p>💡 Ensure good lighting</p>
          <p>👀 Look directly at the camera</p>
          {verificationAttempts > 0 && (
            <p style={{ color: '#ff9800' }}>
              Attempt {verificationAttempts}/3
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {error && (
            <button
              onClick={handleRetry}
              style={{
                background: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Retry
            </button>
          )}
          
          <button
            onClick={handleClose}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionAttendance;

