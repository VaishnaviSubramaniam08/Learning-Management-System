import React, { useState, useEffect } from 'react';
import axios from '../api';

const FaceRecognitionDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [verificationStats, setVerificationStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchDashboardData();
    }
  }, [selectedCourse, dateRange]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/courses/instructor/${user.id}`);
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAttendanceData(),
        fetchSecurityAlerts(),
        fetchVerificationStats()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get(`/face-recognition/logs/${selectedCourse}`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      const response = await axios.get('/face-recognition/security-alerts', {
        params: {
          courseId: selectedCourse,
          timeRange: 24 // Last 24 hours
        }
      });
      setSecurityAlerts(response.data);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
    }
  };

  const fetchVerificationStats = async () => {
    try {
      const response = await axios.get(`/face-recognition/course-stats/${selectedCourse}`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      setVerificationStats(response.data);
    } catch (error) {
      console.error('Error fetching verification stats:', error);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'SPOOF_DETECTED': return '🚨';
      case 'LOW_CONFIDENCE': return '⚠️';
      case 'MULTIPLE_ATTEMPTS': return '🔄';
      default: return '⚠️';
    }
  };

  const getAlertColor = (alertType) => {
    switch (alertType) {
      case 'SPOOF_DETECTED': return '#f44336';
      case 'LOW_CONFIDENCE': return '#ff9800';
      case 'MULTIPLE_ATTEMPTS': return '#2196f3';
      default: return '#666';
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>🔐 Face Recognition Dashboard</h1>
        <p style={{ color: '#666' }}>Monitor attendance verification and security alerts</p>
      </div>

      {/* Course Selection */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Course:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minWidth: '200px'
              }}
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Date:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Date:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f44336'
        }}>
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        background: 'white',
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'attendance', label: '✅ Attendance Logs', icon: '✅' },
            { id: 'security', label: '🛡️ Security Alerts', icon: '🛡️' },
            { id: 'analytics', label: '📈 Analytics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '15px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#6b46c1' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                cursor: 'pointer',
                borderRadius: activeTab === tab.id ? '8px 8px 0 0' : '0',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minHeight: '400px'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #6b46c1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div>
                <h2 style={{ marginBottom: '20px' }}>Overview</h2>
                
                {/* Stats Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    background: '#e8f5e8',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #4caf50'
                  }}>
                    <h3 style={{ color: '#2e7d32', marginBottom: '10px' }}>✅ Successful Verifications</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
                      {verificationStats.successfulVerifications || 0}
                    </p>
                  </div>
                  
                  <div style={{
                    background: '#fff3e0',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ff9800'
                  }}>
                    <h3 style={{ color: '#f57c00', marginBottom: '10px' }}>⚠️ Security Alerts</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
                      {securityAlerts.length}
                    </p>
                  </div>
                  
                  <div style={{
                    background: '#e3f2fd',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #2196f3'
                  }}>
                    <h3 style={{ color: '#1976d2', marginBottom: '10px' }}>📊 Average Confidence</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                      {verificationStats.averageConfidence ? 
                        `${(verificationStats.averageConfidence * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 style={{ marginBottom: '15px' }}>Recent Activity</h3>
                  <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {attendanceData.slice(0, 5).map((log, index) => (
                      <div key={index} style={{
                        padding: '15px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        background: log.verificationResult?.success ? '#f8fff8' : '#fff8f8'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{log.student?.firstName} {log.student?.lastName}</strong>
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                              {formatDateTime(log.createdAt)}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              background: log.verificationResult?.success ? '#4caf50' : '#f44336',
                              color: 'white'
                            }}>
                              {log.verificationResult?.success ? 'Verified' : 'Failed'}
                            </span>
                            {log.verificationResult?.confidence && (
                              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                                Confidence: {(log.verificationResult.confidence * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <h2 style={{ marginBottom: '20px' }}>Attendance Logs</h2>
                <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                  {attendanceData.map((log, index) => (
                    <div key={index} style={{
                      padding: '15px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      background: log.verificationResult?.success ? '#f8fff8' : '#fff8f8'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 10px 0' }}>
                            {log.student?.firstName} {log.student?.lastName}
                          </h4>
                          <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                            📅 {formatDateTime(log.createdAt)}
                          </p>
                          <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                            ⏱️ Processing: {log.verificationResult?.processingTime}ms
                          </p>
                          {log.spoofDetection && (
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                              🛡️ Security Score: {(log.spoofDetection.riskScore * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            background: log.verificationResult?.success ? '#4caf50' : '#f44336',
                            color: 'white',
                            display: 'inline-block',
                            marginBottom: '5px'
                          }}>
                            {log.verificationResult?.success ? '✅ Verified' : '❌ Failed'}
                          </span>
                          {log.verificationResult?.confidence && (
                            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                              Confidence: {(log.verificationResult.confidence * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {attendanceData.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#666', padding: '50px' }}>
                      No attendance logs found for the selected period.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 style={{ marginBottom: '20px' }}>Security Alerts</h2>
                <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                  {securityAlerts.map((alert, index) => (
                    <div key={index} style={{
                      padding: '15px',
                      border: `2px solid ${getAlertColor(alert.alertType)}`,
                      borderRadius: '8px',
                      marginBottom: '15px',
                      background: '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '24px', marginRight: '10px' }}>
                          {getAlertIcon(alert.alertType)}
                        </span>
                        <h4 style={{ margin: 0, color: getAlertColor(alert.alertType) }}>
                          {alert.alertType.replace('_', ' ')}
                        </h4>
                      </div>
                      <p style={{ margin: '5px 0', color: '#333' }}>
                        <strong>Student:</strong> {alert.student?.firstName} {alert.student?.lastName}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                        📅 {formatDateTime(alert.timestamp)}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                        🎯 Confidence: {(alert.confidence * 100).toFixed(1)}%
                      </p>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                        🛡️ Risk Score: {(alert.riskScore * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                  {securityAlerts.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#666', padding: '50px' }}>
                      No security alerts found.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 style={{ marginBottom: '20px' }}>Analytics</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  <div style={{
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#f9f9f9'
                  }}>
                    <h3>Verification Success Rate</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
                      {verificationStats.totalAttempts > 0 ? 
                        `${((verificationStats.successfulVerifications / verificationStats.totalAttempts) * 100).toFixed(1)}%` : 
                        'N/A'}
                    </p>
                    <p style={{ color: '#666' }}>
                      {verificationStats.successfulVerifications} of {verificationStats.totalAttempts} attempts
                    </p>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#f9f9f9'
                  }}>
                    <h3>Average Processing Time</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>
                      {verificationStats.averageProcessingTime ? 
                        `${verificationStats.averageProcessingTime.toFixed(0)}ms` : 
                        'N/A'}
                    </p>
                    <p style={{ color: '#666' }}>Per verification attempt</p>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#f9f9f9'
                  }}>
                    <h3>Security Incidents</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f44336' }}>
                      {verificationStats.spoofAttempts || 0}
                    </p>
                    <p style={{ color: '#666' }}>Spoof attempts detected</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FaceRecognitionDashboard;
