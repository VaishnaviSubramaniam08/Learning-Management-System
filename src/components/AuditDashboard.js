import React, { useState, useEffect } from 'react';
import axios from '../api';

const AuditDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [auditReport, setAuditReport] = useState(null);
  const [securityMetrics, setSecurityMetrics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    eventType: '',
    studentId: '',
    limit: 100
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user, filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAuditReport(),
        fetchSecurityMetrics(),
        fetchSystemHealth()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditReport = async () => {
    try {
      const response = await axios.get('/audit/report', { params: filters });
      setAuditReport(response.data.report);
    } catch (error) {
      console.error('Error fetching audit report:', error);
    }
  };

  const fetchSecurityMetrics = async () => {
    try {
      const response = await axios.get('/audit/security-metrics', {
        params: { timeRange: 24 }
      });
      setSecurityMetrics(response.data.metrics);
    } catch (error) {
      console.error('Error fetching security metrics:', error);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await axios.get('/audit/system-health');
      setSystemHealth(response.data.health);
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const exportAuditData = async (format = 'json') => {
    try {
      const response = await axios.get('/audit/export', {
        params: { ...filters, format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_report_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting audit data:', error);
      setError('Failed to export audit data');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      face_verification: '#4caf50',
      face_registration: '#2196f3',
      spoof_detected: '#f44336',
      security_alert: '#ff9800',
      data_access: '#9c27b0',
      data_deletion: '#f44336'
    };
    return colors[eventType] || '#666';
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to view the audit dashboard.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>🔍 Audit & Security Dashboard</h1>
        <p style={{ color: '#666' }}>Monitor system security, audit trails, and compliance</p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Filters</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Date:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Date:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Event Type:</label>
            <select
              value={filters.eventType}
              onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Events</option>
              <option value="face_verification">Face Verification</option>
              <option value="face_registration">Face Registration</option>
              <option value="spoof_detected">Spoof Detected</option>
              <option value="security_alert">Security Alert</option>
              <option value="data_access">Data Access</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Limit:</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </div>
          <button
            onClick={() => exportAuditData('json')}
            style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export JSON
          </button>
          <button
            onClick={() => exportAuditData('csv')}
            style={{
              background: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export CSV
          </button>
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
            { id: 'audit-logs', label: '📋 Audit Logs', icon: '📋' },
            { id: 'security', label: '🛡️ Security', icon: '🛡️' },
            { id: 'system-health', label: '💚 System Health', icon: '💚' }
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
        minHeight: '500px'
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
            <p>Loading audit data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && auditReport && (
              <div>
                <h2 style={{ marginBottom: '20px' }}>Overview</h2>
                
                {/* Summary Cards */}
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
                    <h3 style={{ color: '#2e7d32', marginBottom: '10px' }}>✅ Total Verifications</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
                      {auditReport.summary.totalVerificationAttempts}
                    </p>
                  </div>
                  
                  <div style={{
                    background: '#e8f5e8',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #4caf50'
                  }}>
                    <h3 style={{ color: '#2e7d32', marginBottom: '10px' }}>✅ Successful</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
                      {auditReport.summary.successfulVerifications}
                    </p>
                  </div>
                  
                  <div style={{
                    background: '#ffebee',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #f44336'
                  }}>
                    <h3 style={{ color: '#c62828', marginBottom: '10px' }}>🚨 Spoof Attempts</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#c62828' }}>
                      {auditReport.summary.spoofAttempts}
                    </p>
                  </div>
                  
                  <div style={{
                    background: '#e3f2fd',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #2196f3'
                  }}>
                    <h3 style={{ color: '#1976d2', marginBottom: '10px' }}>👥 Registered Users</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                      {auditReport.summary.registeredUsers}
                    </p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 style={{ marginBottom: '15px' }}>Recent Verification Activity</h3>
                  <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                    {auditReport.verificationLogs.slice(0, 10).map((log, index) => (
                      <div key={index} style={{
                        padding: '15px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        background: log.success ? '#f8fff8' : '#fff8f8'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{log.student?.firstName} {log.student?.lastName}</strong>
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                              {formatDateTime(log.timestamp)}
                            </p>
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '12px' }}>
                              IP: {log.deviceInfo?.ipAddress}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              background: log.success ? '#4caf50' : '#f44336',
                              color: 'white'
                            }}>
                              {log.success ? 'Success' : 'Failed'}
                            </span>
                            {log.spoofDetected && (
                              <p style={{ margin: '5px 0', fontSize: '12px', color: '#f44336' }}>
                                🚨 Spoof Detected
                              </p>
                            )}
                            <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                              Confidence: {(log.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && securityMetrics && (
              <div>
                <h2 style={{ marginBottom: '20px' }}>Security Metrics (Last 24 Hours)</h2>
                
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
                    <h3>Success Rate</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
                      {securityMetrics.successRate}%
                    </p>
                    <p style={{ color: '#666' }}>
                      {securityMetrics.successfulVerifications} of {securityMetrics.totalAttempts} attempts
                    </p>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#f9f9f9'
                  }}>
                    <h3>Security Incidents</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f44336' }}>
                      {securityMetrics.spoofAttempts}
                    </p>
                    <p style={{ color: '#666' }}>Spoof attempts detected</p>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#f9f9f9'
                  }}>
                    <h3>Average Confidence</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>
                      {(securityMetrics.averageConfidence * 100).toFixed(1)}%
                    </p>
                    <p style={{ color: '#666' }}>Verification confidence</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system-health' && systemHealth && (
              <div>
                <h2 style={{ marginBottom: '20px' }}>System Health</h2>
                
                <div style={{ marginBottom: '30px' }}>
                  <div style={{
                    padding: '15px',
                    background: systemHealth.systemAlerts.length === 0 ? '#e8f5e8' : '#fff3e0',
                    border: `1px solid ${systemHealth.systemAlerts.length === 0 ? '#4caf50' : '#ff9800'}`,
                    borderRadius: '8px'
                  }}>
                    <h3 style={{
                      color: systemHealth.systemAlerts.length === 0 ? '#2e7d32' : '#f57c00'
                    }}>
                      {systemHealth.systemAlerts.length === 0 ? '✅ System Healthy' : '⚠️ Alerts Present'}
                    </h3>
                    <p>Auditing: {systemHealth.auditingEnabled ? 'Enabled' : 'Disabled'}</p>
                    <p>Log Status: {systemHealth.logFileStatus}</p>
                  </div>
                </div>

                {systemHealth.systemAlerts.length > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <h3>System Alerts</h3>
                    {systemHealth.systemAlerts.map((alert, index) => (
                      <div key={index} style={{
                        padding: '15px',
                        background: '#fff3e0',
                        border: '1px solid #ff9800',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}>
                        <h4 style={{ color: '#f57c00' }}>{alert.level.toUpperCase()}</h4>
                        <p>{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {systemHealth.recommendations.length > 0 && (
                  <div>
                    <h3>Recommendations</h3>
                    {systemHealth.recommendations.map((rec, index) => (
                      <div key={index} style={{
                        padding: '15px',
                        background: '#e3f2fd',
                        border: '1px solid #2196f3',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}>
                        <p>{rec}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditDashboard;
