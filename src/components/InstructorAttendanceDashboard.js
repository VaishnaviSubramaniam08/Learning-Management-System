import React, { useState, useEffect } from "react";
import api from "../api";

export default function InstructorAttendanceDashboard({ instructorId }) {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    course: '',
    date: '',
    startTime: '',
    endTime: '',
    location: {
      latitude: '',
      longitude: '',
      geofenceRadius: 100
    },
    modes: ['qr', 'geofencing'],
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [showQRGenerator, setShowQRGenerator] = useState(false);

  // Fetch instructor's courses and sessions on mount
  useEffect(() => {
    fetchInstructorData();
  }, [instructorId]);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      
      // Fetch instructor's courses
      const coursesRes = await api.get(`/courses?instructor=${instructorId}`);
      setCourses(coursesRes.data);
      
      // Fetch all sessions
      const sessionsRes = await api.get(`/sessions/instructor/${instructorId}`);
      setSessions(sessionsRes.data);
      
    } catch (error) {
      console.error('Error fetching instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle course selection
  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
    setSelectedSessionId("");
    setAttendanceRecords([]);
  };

  // Handle session selection
  const handleSessionChange = (e) => {
    setSelectedSessionId(e.target.value);
    if (e.target.value) {
      fetchSessionAttendance(e.target.value);
    } else {
      setAttendanceRecords([]);
    }
  };

  // Fetch attendance for a specific session
  const fetchSessionAttendance = async (sessionId) => {
    try {
      const response = await api.get(`/attendance/session/${sessionId}`);
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching session attendance:', error);
    }
  };

  // Handle session form changes
  const handleSessionFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setSessionForm(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setSessionForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle attendance mode changes
  const handleModeChange = (mode) => {
    setSessionForm(prev => ({
      ...prev,
      modes: prev.modes.includes(mode)
        ? prev.modes.filter(m => m !== mode)
        : [...prev.modes, mode]
    }));
  };

  // Create new session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    try {
      const sessionData = {
        title: sessionForm.title,
        courseId: selectedCourseId, // Changed from 'course' to 'courseId'
        date: sessionForm.date,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        location: sessionForm.location,
        modes: sessionForm.modes,
        description: sessionForm.description
      };
      
      console.log('Creating session with data:', sessionData);
      
      const response = await api.post('/sessions', sessionData);
      console.log('Session created successfully:', response.data);
      
      setShowSessionForm(false);
      setSessionForm({
        title: '',
        course: '',
        date: '',
        startTime: '',
        endTime: '',
        location: {
          latitude: '',
          longitude: '',
          geofenceRadius: 100
        },
        modes: ['qr', 'geofencing'],
        description: ''
      });
      
      // Refresh sessions
      fetchInstructorData();
      alert('Session created successfully!');
    } catch (error) {
      console.error('Error creating session:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to create session: ${error.response?.data || error.message}`);
    }
  };

  // Generate QR code for session
  const generateQRCode = async (sessionId) => {
    try {
      console.log('Generating QR code for session:', sessionId);
      console.log('Full URL being called:', `${api.defaults.baseURL}/sessions/${sessionId}/qr`);
      const response = await api.post(`/sessions/${sessionId}/qr`);
      console.log('QR code generation response:', response.data);
      setQrCode(response.data.qrCode);
      setShowQRGenerator(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error URL:', error.config?.url);
      alert(`Failed to generate QR code: ${error.response?.data?.message || error.message}`);
    }
  };

  // Mark manual attendance
  const markManualAttendance = async (studentId, sessionId, status) => {
    try {
      await api.post('/attendance/manual', {
        sessionId,
        studentId,
        status,
        notes: `Manually marked as ${status} by instructor`
      });
      
      // Refresh attendance records
      fetchSessionAttendance(sessionId);
      alert(`Attendance marked as ${status}`);
    } catch (error) {
      console.error('Error marking manual attendance:', error);
      alert('Failed to mark attendance.');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return { background: '#d1fae5', color: '#065f46' };
      case 'absent': return { background: '#fee2e2', color: '#dc2626' };
      case 'late': return { background: '#fef3c7', color: '#d97706' };
      case 'excused': return { background: '#e0e7ff', color: '#3730a3' };
      default: return { background: '#f3f4f6', color: '#6b7280' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Loading instructor data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', color: '#374151' }}>🕒 Instructor Attendance Management</h2>
      
      {/* Course and Session Selection */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Select Course:
            </label>
            <select 
              value={selectedCourseId} 
              onChange={handleCourseChange}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                minWidth: '200px'
              }}
            >
              <option value="">Choose a course...</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Select Session:
            </label>
            <select
              value={selectedSessionId}
              onChange={handleSessionChange}
              disabled={!selectedCourseId}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                minWidth: '200px',
                opacity: selectedCourseId ? 1 : 0.6
              }}
            >
              <option value="">Choose a session...</option>
              {sessions
                .filter(session => session.course === selectedCourseId)
                .map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.title} - {new Date(session.date).toLocaleDateString()}
                  </option>
                ))}
            </select>
          </div>
          
          <button
            onClick={() => setShowSessionForm(true)}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '24px'
            }}
          >
            + Create Session
          </button>
        </div>
      </div>

      {/* Create Session Form */}
      {showSessionForm && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#374151' }}>Create New Session</h3>
          
          <form onSubmit={handleCreateSession}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Session Title:
                </label>
                <input
                  type="text"
                  name="title"
                  value={sessionForm.title}
                  onChange={handleSessionFormChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Date:
                </label>
                <input
                  type="date"
                  name="date"
                  value={sessionForm.date}
                  onChange={handleSessionFormChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Start Time:
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={sessionForm.startTime}
                  onChange={handleSessionFormChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  End Time:
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={sessionForm.endTime}
                  onChange={handleSessionFormChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Attendance Methods:
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={sessionForm.modes.includes('qr')}
                    onChange={() => handleModeChange('qr')}
                  />
                  QR Code
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={sessionForm.modes.includes('geofencing')}
                    onChange={() => handleModeChange('geofencing')}
                  />
                  Geofencing
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={sessionForm.modes.includes('manual')}
                    onChange={() => handleModeChange('manual')}
                  />
                  Manual
                </label>
              </div>
            </div>

            {sessionForm.modes.includes('geofencing') && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '12px', color: '#374151' }}>Location Settings</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Latitude:
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="location.latitude"
                      value={sessionForm.location.latitude}
                      onChange={handleSessionFormChange}
                      placeholder="e.g., 40.7128"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Longitude:
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="location.longitude"
                      value={sessionForm.location.longitude}
                      onChange={handleSessionFormChange}
                      placeholder="e.g., -74.0060"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Geofence Radius (meters):
                    </label>
                    <input
                      type="number"
                      name="location.geofenceRadius"
                      value={sessionForm.location.geofenceRadius}
                      onChange={handleSessionFormChange}
                      min="10"
                      max="1000"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Description:
              </label>
              <textarea
                name="description"
                value={sessionForm.description}
                onChange={handleSessionFormChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  background: '#6b46c1',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Create Session
              </button>
              
              <button
                type="button"
                onClick={() => setShowSessionForm(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Session Management */}
      {selectedSessionId && (
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#374151' }}>
              Session: {sessions.find(s => s._id === selectedSessionId)?.title}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => generateQRCode(selectedSessionId)}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Generate QR Code
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('Testing QR generation for session:', selectedSessionId);
                    const response = await api.post(`/sessions/${selectedSessionId}/qr`);
                    console.log('Test QR response:', response.data);
                    alert(`Test QR generated: ${response.data.qrCode}`);
                  } catch (error) {
                    console.error('Test QR error:', error);
                    alert(`Test QR failed: ${error.response?.data?.message || error.message}`);
                  }
                }}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Test QR (Debug)
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('Testing attendance routes health');
                    const response = await api.get('/attendance/health');
                    console.log('Health check response:', response.data);
                    alert(`Attendance routes working: ${response.data.message}`);
                  } catch (error) {
                    console.error('Health check error:', error);
                    alert(`Health check failed: ${error.response?.data?.message || error.message}`);
                  }
                }}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Test Routes
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('Testing sessions routes');
                    const response = await api.get('/sessions/test');
                    console.log('Sessions test response:', response.data);
                    alert(`Sessions routes working: ${response.data.message}`);
                  } catch (error) {
                    console.error('Sessions test error:', error);
                    alert(`Sessions test failed: ${error.response?.data?.message || error.message}`);
                  }
                }}
                style={{
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Test Sessions
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('Testing simple QR generation');
                    const response = await api.post('/sessions/test-qr');
                    console.log('Simple QR test response:', response.data);
                    alert(`Simple QR test: ${response.data.qrCode}`);
                  } catch (error) {
                    console.error('Simple QR test error:', error);
                    alert(`Simple QR test failed: ${error.response?.data?.message || error.message}`);
                  }
                }}
                style={{
                  background: '#ec4899',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Test Simple QR
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('Testing session creation and QR generation');
                    const response = await api.post('/sessions/test-session-qr');
                    console.log('Session QR test response:', response.data);
                    alert(`Session QR test: ${response.data.qrCode}\nSession ID: ${response.data.sessionId}`);
                  } catch (error) {
                    console.error('Session QR test error:', error);
                    console.error('Error details:', error.response?.data);
                    alert(`Session QR test failed: ${error.response?.data?.message || error.message}`);
                  }
                }}
                style={{
                  background: '#06b6d4',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Test Session QR
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          {showQRGenerator && qrCode && (
            <div style={{ 
              background: '#f3f4f6', 
              padding: '16px', 
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <h4 style={{ marginBottom: '12px', color: '#374151' }}>QR Code Generated</h4>
              <div style={{ 
                background: 'white', 
                padding: '16px', 
                borderRadius: '8px',
                display: 'inline-block',
                fontFamily: 'monospace',
                fontSize: '14px',
                wordBreak: 'break-all'
              }}>
                {qrCode}
              </div>
              <p style={{ marginTop: '8px', color: '#6b7280', fontSize: '14px' }}>
                Share this QR code with students to mark attendance
              </p>
            </div>
          )}

          {/* Attendance Statistics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '16px', 
            marginBottom: '20px' 
          }}>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {attendanceRecords.filter(r => r.status === 'present').length}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Present</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {attendanceRecords.filter(r => r.status === 'late').length}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Late</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                {attendanceRecords.filter(r => r.status === 'absent').length}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Absent</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b46c1' }}>
                {attendanceRecords.length}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Total</div>
            </div>
          </div>

          {/* Student Attendance Table */}
          <div>
            <h4 style={{ marginBottom: '12px', color: '#374151' }}>Student Attendance</h4>
            {attendanceRecords.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Student</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Check-in Time</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Method</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>
                          {record.student?.firstName} {record.student?.lastName}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            ...getStatusColor(record.status),
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {record.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {record.method}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => markManualAttendance(record.student._id, selectedSessionId, 'present')}
                              style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => markManualAttendance(record.student._id, selectedSessionId, 'absent')}
                              style={{
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => markManualAttendance(record.student._id, selectedSessionId, 'late')}
                              style={{
                                background: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                <h4>No Attendance Records</h4>
                <p>Attendance records will appear here once students start marking attendance.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Sessions Overview */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#374151' }}>All Sessions</h3>
        
        {sessions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Session</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Course</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Methods</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{session.title}</td>
                    <td style={{ padding: '12px' }}>{courses.find(c => c._id === session.course)?.title}</td>
                    <td style={{ padding: '12px' }}>{new Date(session.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>{session.startTime} - {session.endTime}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {session.modes?.map(mode => (
                          <span key={mode} style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            {mode}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => {
                          setSelectedCourseId(session.course);
                          setSelectedSessionId(session._id);
                          fetchSessionAttendance(session._id);
                        }}
                        style={{
                          background: '#6b46c1',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        View Attendance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
            <h4>No Sessions Created</h4>
            <p>Create your first session to start managing attendance.</p>
          </div>
        )}
      </div>
    </div>
  );
} 