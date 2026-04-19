import React, { useState, useEffect } from 'react';
import axios from '../api';

const PrivacySettings = ({ user, onClose }) => {
  const [privacyStatus, setPrivacyStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportData, setShowExportData] = useState(false);
  const [exportedData, setExportedData] = useState(null);

  useEffect(() => {
    fetchPrivacyStatus();
  }, []);

  const fetchPrivacyStatus = async () => {
    try {
      const response = await axios.get('/privacy/status');
      setPrivacyStatus(response.data.status);
      setLoading(false);
    } catch (err) {
      setError('Failed to load privacy status');
      setLoading(false);
    }
  };

  const updateConsent = async (consentGiven) => {
    try {
      setLoading(true);
      const response = await axios.post('/privacy/consent', {
        consentGiven,
        consentType: 'biometric_processing'
      });

      if (response.data.success) {
        setSuccess('Consent updated successfully');
        await fetchPrivacyStatus();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to update consent');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/privacy/export');
      
      if (response.data.success) {
        setExportedData(response.data.data);
        setShowExportData(true);
        setSuccess('Data exported successfully');
      } else {
        setError('Failed to export data');
      }
    } catch (err) {
      setError('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async () => {
    try {
      setLoading(true);
      const response = await axios.delete('/privacy/delete', {
        data: { confirmDelete: true }
      });

      if (response.data.success) {
        setSuccess('All biometric data deleted successfully');
        setShowDeleteConfirm(false);
        await fetchPrivacyStatus();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to delete data');
    } finally {
      setLoading(false);
    }
  };

  const downloadExportedData = () => {
    const dataStr = JSON.stringify(exportedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `biometric_data_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !privacyStatus) {
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
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading privacy settings...</p>
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      overflow: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>🔒 Privacy & Data Settings</h2>

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            border: '1px solid #f44336'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#e8f5e8',
            color: '#2e7d32',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            border: '1px solid #4caf50'
          }}>
            {success}
          </div>
        )}

        {/* Privacy Status */}
        <div style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Current Status</h3>
          {privacyStatus && (
            <div>
              <p><strong>Has Biometric Data:</strong> {privacyStatus.hasData ? 'Yes' : 'No'}</p>
              <p><strong>Consent Given:</strong> {privacyStatus.consentGiven ? 'Yes' : 'No'}</p>
              <p><strong>Data Active:</strong> {privacyStatus.isActive ? 'Yes' : 'No'}</p>
              {privacyStatus.dataRetentionDate && (
                <p><strong>Data Retention Until:</strong> {new Date(privacyStatus.dataRetentionDate).toLocaleDateString()}</p>
              )}
              {privacyStatus.encodingsCount > 0 && (
                <p><strong>Face Encodings:</strong> {privacyStatus.encodingsCount}</p>
              )}
            </div>
          )}
        </div>

        {/* Consent Management */}
        <div style={{
          background: '#fff3cd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffc107'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Consent Management</h3>
          <p style={{ marginBottom: '15px' }}>
            You can withdraw or give consent for biometric data processing at any time.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => updateConsent(true)}
              disabled={loading || privacyStatus?.consentGiven}
              style={{
                background: privacyStatus?.consentGiven ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: privacyStatus?.consentGiven ? 'not-allowed' : 'pointer'
              }}
            >
              Give Consent
            </button>
            <button
              onClick={() => updateConsent(false)}
              disabled={loading || !privacyStatus?.consentGiven}
              style={{
                background: !privacyStatus?.consentGiven ? '#ccc' : '#f44336',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: !privacyStatus?.consentGiven ? 'not-allowed' : 'pointer'
              }}
            >
              Withdraw Consent
            </button>
          </div>
        </div>

        {/* Data Export */}
        <div style={{
          background: '#e3f2fd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #2196f3'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Export Your Data</h3>
          <p style={{ marginBottom: '15px' }}>
            Download all your biometric data and attendance logs.
          </p>
          <button
            onClick={exportData}
            disabled={loading}
            style={{
              background: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Export Data
          </button>
        </div>

        {/* Data Deletion */}
        <div style={{
          background: '#ffebee',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f44336'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Delete Your Data</h3>
          <p style={{ marginBottom: '15px' }}>
            Permanently delete all your biometric data and attendance logs. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading || !privacyStatus?.hasData}
            style={{
              background: !privacyStatus?.hasData ? '#ccc' : '#f44336',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: !privacyStatus?.hasData ? 'not-allowed' : 'pointer'
            }}
          >
            Delete All Data
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
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
              padding: '30px',
              borderRadius: '10px',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              <h3 style={{ color: '#f44336' }}>⚠️ Confirm Deletion</h3>
              <p>Are you sure you want to permanently delete all your biometric data?</p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                This will remove all face recognition data and attendance logs. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button
                  onClick={deleteData}
                  disabled={loading}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Data Modal */}
        {showExportData && exportedData && (
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
              padding: '30px',
              borderRadius: '10px',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3>📄 Exported Data</h3>
              <div style={{
                background: '#f5f5f5',
                padding: '15px',
                borderRadius: '5px',
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                <p><strong>Export Date:</strong> {new Date(exportedData.exportDate).toLocaleString()}</p>
                <p><strong>Face Data:</strong> {exportedData.faceData ? 'Yes' : 'No'}</p>
                <p><strong>Attendance Logs:</strong> {exportedData.attendanceLogsCount}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={downloadExportedData}
                  style={{
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Download JSON
                </button>
                <button
                  onClick={() => setShowExportData(false)}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacySettings;
