import React, { useState } from 'react';
import api from '../api';

const APIDebugTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, message, details = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    // Test 1: Health Check
    try {
      console.log('🧪 Testing health endpoint...');
      const response = await api.get('/health');
      addResult('Health Check', true, 'Backend is responding', response.data);
    } catch (error) {
      addResult('Health Check', false, 'Backend not responding', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url
      });
    }

    // Test 2: Auth endpoint (should fail without credentials)
    try {
      console.log('🧪 Testing auth endpoint...');
      await api.post('/auth/login', { email: 'test@test.com', password: 'test', role: 'student' });
      addResult('Auth Endpoint', true, 'Auth endpoint accessible');
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        addResult('Auth Endpoint', true, 'Auth endpoint accessible (expected auth error)', {
          status: error.response.status,
          message: error.response.data?.message
        });
      } else if (error.response?.status === 404) {
        addResult('Auth Endpoint', false, 'Auth endpoint not found (404)', {
          status: error.response.status,
          url: error.config?.url
        });
      } else {
        addResult('Auth Endpoint', false, 'Auth endpoint error', {
          status: error.response?.status,
          message: error.message
        });
      }
    }

    // Test 3: Direct backend call (bypass proxy)
    try {
      console.log('🧪 Testing direct backend call...');
      const directResponse = await fetch('http://localhost:5000/api/health');
      const data = await directResponse.json();
      addResult('Direct Backend Call', true, 'Direct backend accessible', data);
    } catch (error) {
      addResult('Direct Backend Call', false, 'Direct backend not accessible', {
        message: error.message
      });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔧 API Debug Test</h2>
      <p>This component tests your API connectivity and helps debug 404 errors.</p>
      
      <button 
        onClick={runTests} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Running Tests...' : 'Run API Tests'}
      </button>

      <div>
        <h3>Test Results:</h3>
        {testResults.length === 0 && !loading && (
          <p>Click "Run API Tests" to start debugging</p>
        )}
        
        {testResults.map((result, index) => (
          <div 
            key={index}
            style={{
              padding: '10px',
              margin: '10px 0',
              border: `2px solid ${result.success ? '#28a745' : '#dc3545'}`,
              borderRadius: '4px',
              backgroundColor: result.success ? '#d4edda' : '#f8d7da'
            }}
          >
            <h4 style={{ margin: '0 0 5px 0' }}>
              {result.success ? '✅' : '❌'} {result.test}
            </h4>
            <p style={{ margin: '5px 0' }}><strong>Result:</strong> {result.message}</p>
            <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
              <strong>Time:</strong> {result.timestamp}
            </p>
            {result.details && (
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer' }}>View Details</summary>
                <pre style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4>🔍 Current Configuration:</h4>
        <ul>
          <li><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</li>
          <li><strong>API Base URL:</strong> {process.env.REACT_APP_API_BASE_URL || 'Not set'}</li>
          <li><strong>Current Window Location:</strong> {window.location.origin}</li>
        </ul>
      </div>
    </div>
  );
};

export default APIDebugTest;