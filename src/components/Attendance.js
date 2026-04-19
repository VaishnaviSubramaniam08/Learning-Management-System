import React, { useState, useEffect } from 'react';
import axios from '../api';
import QRCodeScanner from './QRCodeScanner';
import QRCodeGenerator from './QRCodeGenerator';
import GeolocationTracker from './GeolocationTracker';
import FaceAttendanceSystem from './FaceAttendanceSystem';

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const initialAttendance = [
  { date: '2024-06-01', course: 'React Basics', status: 'Present', location: '12.9716, 77.5946', method: 'QR Code' },
  { date: '2024-05-31', course: 'React Basics', status: 'Absent', location: '-', method: '-' },
  { date: '2024-05-30', course: 'JavaScript Advanced', status: 'Present', location: '12.9716, 77.5946', method: 'Geolocation' },
];

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState(initialAttendance);
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showLocationTracker, setShowLocationTracker] = useState(false);
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [scannedQRCode, setScannedQRCode] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attendanceStats, setAttendanceStats] = useState({ percent: 0, present: 0, absent: 0, geoCheckins: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const presentCount = attendanceData.filter(a => a.status === 'Present').length;
  const percent = Math.round((presentCount / attendanceData.length) * 100);

  useEffect(() => {
    // Get user data from localStorage
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUser(userData);
        fetchUserData(userData.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const [sessionsRes, attendanceRes] = await Promise.all([
        axios.get('/sessions'),
        axios.get(`/attendance/summary?studentId=${userId}`)
      ]);
      setSessions(sessionsRes.data);
      setAttendanceStats(attendanceRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleQRScan = async (qrCode) => {
    setScannedQRCode(qrCode);
    setShowQRScanner(false);
    setLoading(true);
    setError('');

    try {
      // Get current location for QR check-in
      const position = await getCurrentPosition();
      
      // Try daily QR first, then fallback to session QR
      let response;
      try {
        response = await axios.post('/attendance/daily-qr-checkin', {
          qrCode: qrCode,
          studentId: user.id,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setAttendanceStatus('✅ Daily attendance marked successfully via QR Code!');
      } catch (dailyQRError) {
        // If daily QR fails, try session QR
        response = await axios.post('/attendance/qr-checkin', {
          qrCode: qrCode,
          studentId: user.id,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setAttendanceStatus('✅ Session attendance marked successfully via QR Code!');
      }

      if (response.data) {
        addAttendanceRecord('Present', 'QR Code', `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      }
    } catch (err) {
      setError(err.response?.data || 'Failed to mark attendance. Please try again.');
      setAttendanceStatus('❌ Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = async (location) => {
    // Check if we have a target location (session location)
    if (selectedSession && selectedSession.location) {
      const distance = calculateDistance(
        location.latitude, location.longitude,
        selectedSession.location.latitude, selectedSession.location.longitude
      );

      if (distance <= (selectedSession.location.geofenceRadius || 100)) {
        // Within geofence, mark attendance
        try {
          const response = await axios.post('/attendance/geo-checkin', {
            sessionId: selectedSession._id,
            studentId: user.id,
            latitude: location.latitude,
            longitude: location.longitude
          });

          if (response.data) {
            setAttendanceStatus('✅ Attendance marked successfully via Geolocation!');
            addAttendanceRecord('Present', 'Geolocation', `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
            setShowLocationTracker(false);
          }
        } catch (err) {
          setError(err.response?.data || 'Failed to mark attendance via geolocation.');
          setAttendanceStatus('❌ Failed to mark attendance');
        }
      }
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const addAttendanceRecord = (status, method, location) => {
    const newRecord = {
      date: getToday(),
      course: selectedSession?.course?.title || 'Unknown Course',
      status: status,
      location: location,
      method: method
    };
    setAttendanceData([newRecord, ...attendanceData]);
  };

  const handleManualAttendance = async () => {
    if (!selectedSession) {
      setError('Please select a session first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/attendance/manual', {
        sessionId: selectedSession._id,
        studentId: user.id,
        status: 'present',
        notes: 'Manual attendance marking'
      });

      if (response.data) {
        setAttendanceStatus('✅ Manual attendance marked successfully!');
        addAttendanceRecord('Present', 'Manual', 'Manual entry');
      }
    } catch (err) {
      setError(err.response?.data || 'Failed to mark manual attendance.');
      setAttendanceStatus('❌ Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const clearStatus = () => {
    setAttendanceStatus('');
    setError('');
    setScannedQRCode('');
  };

  const createTestSession = async () => {
    try {
      const response = await axios.post('/sessions/test');
      setAttendanceStatus(`Test session created! ID: ${response.data._id}`);
      // Auto-generate QR code for the test session
      setTimeout(() => {
        setSelectedSession(response.data._id);
        setShowQRGenerator(true);
      }, 1000);
    } catch (err) {
      setAttendanceStatus('Failed to create test session');
    }
  };

  useEffect(() => {
    if (user?.id) {
      axios.get(`/attendance/records?studentId=${user.id}`)
        .then(res => setAttendanceRecords(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  const geoCheckins = attendanceRecords.filter(rec => rec.method === 'Geolocation').length;

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>📊 Attendance Management</h2>
      
      {/* User Info */}
      {user && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Welcome, {user.firstName} {user.lastName}</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <strong>Role:</strong> {user.role}
            </div>
            <div>
              <strong>Student ID:</strong> {user.id}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Stats */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📈 Attendance Statistics</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            background: '#e8f5e8',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{percent}%</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Attendance Rate</div>
          </div>
          <div style={{
            background: '#fff3cd',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>{presentCount}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Present Days</div>
          </div>
          <div style={{
            background: '#f8d7da',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>{attendanceData.length - presentCount}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Absent Days</div>
          </div>
          <div style={{
            background: '#e3f2fd',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>{attendanceStats.geoCheckins || 0}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Geo Check-ins</div>
          </div>
          <div style={{
            background: '#e3f2fd',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>{geoCheckins}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Geo Check-ins (Frontend)</div>
          </div>
        </div>
      </div>

      {/* Session Selection */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🎯 Select Session</h3>
        <select
          value={selectedSession?._id || ''}
          onChange={(e) => {
            const session = sessions.find(s => s._id === e.target.value);
            setSelectedSession(session);
          }}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            fontSize: '16px',
            marginBottom: '15px'
          }}
        >
          <option value="">Select a session...</option>
          {sessions.map(session => (
            <option key={session._id} value={session._id}>
              {session.title} - {new Date(session.date).toLocaleDateString()} ({session.startTime})
            </option>
          ))}
        </select>

        {selectedSession && (
          <div style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '10px',
            border: '2px solid #667eea'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Selected Session:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div><strong>Title:</strong> {selectedSession.title}</div>
              <div><strong>Date:</strong> {new Date(selectedSession.date).toLocaleDateString()}</div>
              <div><strong>Time:</strong> {selectedSession.startTime} - {selectedSession.endTime}</div>
              {selectedSession.location && (
                <div><strong>Location:</strong> {selectedSession.location.latitude.toFixed(4)}, {selectedSession.location.longitude.toFixed(4)}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Attendance Methods */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📱 Attendance Methods</h3>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {/* Student QR scan tip */}
          <div style={{ width: '100%', marginBottom: '10px', color: '#764ba2', fontWeight: 'bold', fontSize: '15px' }}>
            📢 Ask your instructor to generate and display the QR code for this session before scanning.
          </div>
          <button
            onClick={() => {
              if (!selectedSession) {
                alert('Please select a session first!');
                return;
              }
              setShowQRScanner(true);
            }}
            className="btn-primary"
          >
            📱 Scan QR Code
          </button>

          <button
            onClick={() => setShowLocationTracker(true)}
            disabled={!selectedSession || loading}
            style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '15px 25px',
              cursor: selectedSession && !loading ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              opacity: selectedSession && !loading ? 1 : 0.6
            }}
          >
            📍 Location Check-in
          </button>
          
          <button
            onClick={() => setShowFaceRecognition(true)}
            disabled={!selectedSession || loading}
            style={{
              background: 'linear-gradient(135deg, #3b5998 0%, #8b9dc3 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '15px 25px',
              cursor: selectedSession && !loading ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              opacity: selectedSession && !loading ? 1 : 0.6
            }}
          >
            👤 Face Recognition
          </button>

          <button
            onClick={handleManualAttendance}
            disabled={!selectedSession || loading}
            style={{
              background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '15px 25px',
              cursor: selectedSession && !loading ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              opacity: selectedSession && !loading ? 1 : 0.6
            }}
          >
            ✏️ Manual Entry
          </button>

          {user?.role === 'instructor' && (
            <>
              <button
                onClick={createTestSession}
                style={{
                  background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '15px 25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🧪 Create Test Session
              </button>
              <button
                onClick={() => setShowQRGenerator(true)}
                style={{
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '15px 25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🎯 Generate QR Code
              </button>
            </>
          )}
        </div>

        {/* Status Messages */}
        {loading && (
          <div style={{
            background: '#e3f2fd',
            color: '#1976d2',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            🔄 Processing attendance...
          </div>
        )}

        {attendanceStatus && (
          <div style={{
            background: attendanceStatus.includes('✅') ? '#e8f5e8' : '#f8d7da',
            color: attendanceStatus.includes('✅') ? '#155724' : '#721c24',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            {attendanceStatus}
            <button
              onClick={clearStatus}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                float: 'right',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            ❌ {error}
            <button
              onClick={clearStatus}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                float: 'right',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>
        )}

        {scannedQRCode && (
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <strong>Scanned QR Code:</strong> {scannedQRCode}
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📋 Attendance History</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Course</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Method</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((rec, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{rec.date}</td>
                  <td style={{ padding: '12px' }}>{rec.course}</td>
                  <td style={{ 
                    padding: '12px', 
                    color: rec.status === 'Present' ? '#28a745' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {rec.status === 'Present' ? '✅ Present' : '❌ Absent'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: rec.method === 'QR Code' ? '#667eea' : 
                                 rec.method === 'Geolocation' ? '#28a745' : '#ffc107',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {rec.method}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                    {rec.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      {showQRScanner && (
        <QRCodeScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
          isActive={showQRScanner}
        />
      )}

      {/* QR Code Generator Modal */}
      {showQRGenerator && (
        <QRCodeGenerator
          sessionId={selectedSession?._id}
          onClose={() => setShowQRGenerator(false)}
        />
      )}

      {/* Geolocation Tracker Modal */}
      {showLocationTracker && (
        <GeolocationTracker
          onLocationUpdate={handleLocationUpdate}
          targetLocation={selectedSession?.location}
          geofenceRadius={selectedSession?.location?.geofenceRadius || 100}
          onClose={() => setShowLocationTracker(false)}
        />
      )}
      
      {/* Face Recognition Modal */}
      {showFaceRecognition && (
        <FaceAttendanceSystem
          user={user}
          onAttendanceMarked={(data) => {
            setAttendanceStatus(`✅ Attendance marked successfully via ${data.method}!`);
            addAttendanceRecord(data.status, data.method, data.location);
            setShowFaceRecognition(false);
          }}
          onClose={() => setShowFaceRecognition(false)}
          isActive={showFaceRecognition}
        />
      )}
    </div>
  );
}