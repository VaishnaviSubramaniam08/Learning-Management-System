import React, { useState, useEffect } from 'react';
import axios from '../api';

const AttendanceDiagnostic = () => {
  const [diagnosticResults, setDiagnosticResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const addResult = (test, status, message, data = null) => {
    setDiagnosticResults(prev => [...prev, {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setDiagnosticResults([]);

    try {
      // Test 1: Check user authentication
      addResult('User Auth', user ? 'PASS' : 'FAIL', 
        user ? `Logged in as: ${user.firstName} ${user.lastName} (${user.email})` : 'No user found in localStorage');

      if (!user) {
        addResult('Diagnostics', 'FAIL', 'Cannot continue without user authentication');
        setLoading(false);
        return;
      }

      // Test 2: Test attendance summary API
      try {
        const summaryResponse = await axios.get(`/attendance/summary?studentId=${user.id}`);
        addResult('Attendance Summary API', 'PASS', 
          `Found ${summaryResponse.data.summary?.length || 0} records`, summaryResponse.data);
      } catch (error) {
        addResult('Attendance Summary API', 'FAIL', 
          `Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }

      // Test 3: Test face recognition attendance records
      try {
        const faceResponse = await axios.get(`/face-recognition/attendance/records/${user.id}`);
        addResult('Face Recognition Records', 'PASS', 
          `Found ${faceResponse.data.records?.length || 0} face records`, faceResponse.data);
      } catch (error) {
        addResult('Face Recognition Records', 'FAIL', 
          `Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }

      // Test 4: Test today's attendance
      try {
        const todayResponse = await axios.get(`/face-recognition/attendance/today/${user.id}`);
        addResult('Today\'s Attendance', todayResponse.data.attendance ? 'PASS' : 'INFO', 
          todayResponse.data.attendance ? 'Attendance found for today' : 'No attendance for today', 
          todayResponse.data);
      } catch (error) {
        addResult('Today\'s Attendance', 'FAIL', 
          `Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }

      // Test 5: Check localStorage for tokens
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      addResult('Auth Token', token ? 'PASS' : 'FAIL', 
        token ? 'Token found in localStorage' : 'No token found');

    } catch (error) {
      addResult('General Error', 'FAIL', `Unexpected error: ${error.message}`);
    }

    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS': return '#10b981';
      case 'FAIL': return '#ef4444';
      case 'INFO': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#374151', marginBottom: '20px' }}>🔍 Attendance System Diagnostic</h2>
      
      <button
        onClick={runDiagnostics}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}
      >
        {loading ? '🔄 Running Diagnostics...' : '🚀 Run Diagnostics'}
      </button>

      {diagnosticResults.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>📊 Diagnostic Results</h3>
          
          {diagnosticResults.map((result, index) => (
            <div key={index} style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '8px',
              borderLeft: `4px solid ${getStatusColor(result.status)}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#374151' }}>{result.test}</strong>
                  <span style={{
                    marginLeft: '12px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: getStatusColor(result.status),
                    color: 'white'
                  }}>
                    {result.status}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{result.timestamp}</span>
              </div>
              <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>{result.message}</p>
              {result.data && (
                <details style={{ marginTop: '8px' }}>
                  <summary style={{ cursor: 'pointer', color: '#3b82f6' }}>View Data</summary>
                  <pre style={{
                    background: '#f3f4f6',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                    marginTop: '4px'
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceDiagnostic;
