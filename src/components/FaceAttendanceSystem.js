import React, { useState, useEffect, useRef } from 'react';
import axios from '../api';
import io from 'socket.io-client';
import './FaceAttendanceSystem.css';

const FaceAttendanceSystem = ({ user }) => {
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
  const [showAttendanceList, setShowAttendanceList] = useState(false);

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
      console.log('🔍 Face Registration - Checking registration for user:', user?.id);
      const response = await axios.get(`/api/face-recognition/check-registration/${user?.id}`);
      console.log('🔍 Face Registration - Check response:', response.data);
      setHasRegisteredFace(response.data.hasRegistration);
    } catch (error) {
      console.error('❌ Face Registration - Error checking registration:', error);
      console.error('❌ Face Registration - Error response:', error.response?.data);
    }
  };

  const loadTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`/api/face-recognition/attendance/today/${user?.id}?date=${today}`);
      setTodayAttendance(response.data.attendance);
      setAttendanceMarked(response.data.attendance?.status === 'present');
    } catch (error) {
      console.error('Error loading today\'s attendance:', error);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      const response = await axios.get(`/api/face-recognition/attendance/records/${user?.id}`);
      setAttendanceRecords(response.data.records || []);
    } catch (error) {
      console.error('Error loading attendance records:', error);
    }
  };

  const showToastMessage = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const startCamera = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        setDetectionStatus('detecting');
        
        // Start face detection after video loads
        videoRef.current.onloadedmetadata = () => {
          startFaceDetection();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setDetectionStatus('idle');
    setRecognizedUser(null);
  };

  const startFaceDetection = () => {
    const detectFaces = async () => {
      if (!videoRef.current || !isStreaming) return;

      try {
        // Capture frame from video
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        // Send to backend for face recognition
        const response = await axios.post('/api/face-recognition/detect', {
          imageData,
          userId: user?.id
        });

        if (response.data.success) {
          const { recognized, user: recognizedUserData, confidence: conf } = response.data;
          
          if (recognized && recognizedUserData) {
            setRecognizedUser(recognizedUserData);
            setConfidence(conf);
            setDetectionStatus('recognized');
            
            // Emit real-time event
            if (socket) {
              socket.emit('face_recognized', {
                userId: user?.id,
                recognizedUser: recognizedUserData,
                confidence: conf,
                timestamp: new Date().toISOString()
              });
            }

            // Auto-mark attendance if not already marked today
            if (!attendanceMarked) {
              await markAttendance(recognizedUserData, conf);
            }
          } else {
            setDetectionStatus('unknown');
            setRecognizedUser(null);
          }
        }
      } catch (error) {
        console.error('Face detection error:', error);
        setDetectionStatus('error');
      }
    };

    // Run detection every 2 seconds
    const detectionInterval = setInterval(detectFaces, 2000);
    
    // Cleanup interval when component unmounts or camera stops
    return () => clearInterval(detectionInterval);
  };

  const markAttendance = async (recognizedUserData, confidence) => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/face-recognition/mark-attendance', {
        userId: recognizedUserData.id,
        confidence,
        timestamp: new Date().toISOString(),
        location: await getCurrentLocation()
      });

      if (response.data.success) {
        setAttendanceMarked(true);
        setTodayAttendance(response.data.attendance);
        
        // Emit real-time event
        if (socket) {
          socket.emit('attendance_marked', {
            userId: recognizedUserData.id,
            userName: recognizedUserData.name,
            timestamp: new Date().toISOString(),
            confidence
          });
        }

        showToastMessage(`✅ Attendance marked for ${recognizedUserData.name}!`, 'success');
        
        // Refresh attendance records
        loadAttendanceRecords();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      showToastMessage('❌ Failed to mark attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          () => {
            resolve(null); // Location not available
          }
        );
      } else {
        resolve(null);
      }
    });
  };

  const registerFace = async () => {
    if (!videoRef.current || !isStreaming) {
      showToastMessage('❌ Please start camera first', 'error');
      return;
    }

    try {
      setIsRegistering(true);
      console.log('🔍 Face Registration - Starting registration for user:', user?.id);

      // Capture frame from video
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('🔍 Face Registration - Image captured, size:', imageData.length);

      const requestData = {
        imageData,
        userId: user?.id
      };
      console.log('🔍 Face Registration - Sending request with data:', {
        userId: requestData.userId,
        imageDataLength: requestData.imageData.length,
        imageDataPrefix: requestData.imageData.substring(0, 50)
      });

      const response = await axios.post('/api/face-recognition/register', requestData);
      console.log('🔍 Face Registration - Response received:', response.data);

      if (response.data.success) {
        setHasRegisteredFace(true);
        showToastMessage('✅ Face registered successfully!', 'success');
        // Refresh registration status
        checkFaceRegistration();
      } else {
        console.error('❌ Face Registration - Failed:', response.data.message);
        showToastMessage(`❌ Face registration failed: ${response.data.message}`, 'error');
      }
    } catch (error) {
      console.error('❌ Face Registration - Error:', error);
      console.error('❌ Face Registration - Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      showToastMessage(`❌ Face registration failed: ${errorMessage}`, 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const getStatusColor = () => {
    switch (detectionStatus) {
      case 'recognized': return '#10b981';
      case 'detecting': return '#3b82f6';
      case 'unknown': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (detectionStatus) {
      case 'recognized': 
        return `✅ Recognized: ${recognizedUser?.name} (${Math.round(confidence * 100)}%)`;
      case 'detecting': 
        return '🔍 Detecting faces...';
      case 'unknown': 
        return '❓ Unknown face detected';
      case 'error': 
        return '❌ Detection error';
      default: 
        return '⏸️ Camera not active';
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesDate = !filterDate || record.date?.includes(filterDate);
    const matchesName = !filterName || record.userName?.toLowerCase().includes(filterName.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesDate && matchesName && matchesStatus;
  });

  return (
    <div className="face-attendance-container">
      {/* Header */}
      <div className="face-attendance-header">
        <h1>👤 Face Recognition Attendance</h1>
        <div className="header-actions">
          <div className="attendance-status">
            {todayAttendance ? (
              <div className={`status-badge ${todayAttendance.status}`}>
                {todayAttendance.status === 'present' ? '✅ Present Today' : '❌ Absent Today'}
              </div>
            ) : (
              <div className="status-badge pending">⏳ Not Marked</div>
            )}
          </div>
          <button 
            onClick={() => setShowAttendanceList(!showAttendanceList)}
            className="toggle-list-btn"
          >
            {showAttendanceList ? '📹 Camera View' : '📋 Attendance List'}
          </button>
        </div>
      </div>

      {!showAttendanceList ? (
        <>
          {/* Camera Section */}
          <div className="camera-section">
            <div className="camera-container">
              <video
                ref={videoRef}
                className="camera-feed"
                autoPlay
                muted
                playsInline
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {/* Detection Overlay */}
              <div className="detection-overlay">
                <div 
                  className="detection-status"
                  style={{ backgroundColor: getStatusColor() }}
                >
                  {getStatusText()}
                </div>
              </div>

              {/* Camera Controls */}
              <div className="camera-controls">
                {!isStreaming ? (
                  <button 
                    onClick={startCamera} 
                    className="control-btn start-btn"
                    disabled={loading}
                  >
                    {loading ? '⏳ Starting...' : '📹 Start Camera'}
                  </button>
                ) : (
                  <button 
                    onClick={stopCamera} 
                    className="control-btn stop-btn"
                  >
                    ⏹️ Stop Camera
                  </button>
                )}
                
                {!hasRegisteredFace && isStreaming && (
                  <button 
                    onClick={registerFace} 
                    className="control-btn register-btn"
                    disabled={isRegistering}
                  >
                    {isRegistering ? '⏳ Registering...' : '📝 Register Face'}
                  </button>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="instructions">
              <h3>📋 Instructions:</h3>
              <ul>
                <li>Position your face clearly in the camera view</li>
                <li>Ensure good lighting for better recognition</li>
                <li>Look directly at the camera</li>
                <li>Attendance will be marked automatically upon recognition</li>
                {!hasRegisteredFace && <li><strong>First time? Register your face first!</strong></li>}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Attendance Records Section */}
          <div className="attendance-records-section">
            {/* Filters */}
            <div className="filters-section">
              <h3>📊 Attendance Records</h3>
              <div className="filters">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="filter-input"
                  placeholder="Filter by date"
                />
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="filter-input"
                  placeholder="Filter by name"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>

            {/* Records List */}
            <div className="records-list">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <div key={index} className="record-item">
                    <div className="record-info">
                      <div className="record-name">{record.userName || record.name}</div>
                      <div className="record-date">{new Date(record.timestamp || record.date).toLocaleDateString()}</div>
                      <div className="record-time">{new Date(record.timestamp || record.date).toLocaleTimeString()}</div>
                    </div>
                    <div className={`record-status ${record.status}`}>
                      {record.status === 'present' ? '✅ Present' : '❌ Absent'}
                    </div>
                    {record.confidence && (
                      <div className="record-confidence">
                        {Math.round(record.confidence * 100)}% confidence
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-records">
                  <p>📭 No attendance records found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <p>{error}</p>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`toast-notification ${toastType}`}>
          <div className="toast-content">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceAttendanceSystem;
