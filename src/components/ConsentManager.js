import React, { useState, useEffect } from 'react';
import axios from '../api';

const ConsentManager = ({ user, onConsentUpdate }) => {
  const [consentStatus, setConsentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [consentData, setConsentData] = useState({
    biometricProcessing: false,
    dataRetention: false,
    thirdPartySharing: false,
    marketingCommunications: false
  });

  useEffect(() => {
    fetchConsentStatus();
  }, []);

  const fetchConsentStatus = async () => {
    try {
      const response = await axios.get('/privacy/status');
      setConsentStatus(response.data.status);
      
      if (response.data.status.consentGiven) {
        setConsentData({
          biometricProcessing: true,
          dataRetention: true,
          thirdPartySharing: false,
          marketingCommunications: false
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching consent status:', error);
      setLoading(false);
    }
  };

  const updateConsent = async (consentType, consentGiven) => {
    try {
      setLoading(true);
      const response = await axios.post('/privacy/consent', {
        consentGiven,
        consentType
      });

      if (response.data.success) {
        await fetchConsentStatus();
        if (onConsentUpdate) {
          onConsentUpdate({ consentType, consentGiven });
        }
      }
    } catch (error) {
      console.error('Error updating consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentSubmit = async () => {
    try {
      setLoading(true);
      
      // Update biometric processing consent
      await updateConsent('biometric_processing', consentData.biometricProcessing);
      
      setShowConsentForm(false);
    } catch (error) {
      console.error('Error submitting consent:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !consentStatus) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '50px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #6b46c1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>🔒 Privacy & Consent Management</h2>

      {/* Current Consent Status */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Current Consent Status</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          <div style={{
            padding: '15px',
            border: `2px solid ${consentStatus?.consentGiven ? '#4caf50' : '#f44336'}`,
            borderRadius: '8px',
            background: consentStatus?.consentGiven ? '#f8fff8' : '#fff8f8'
          }}>
            <h4 style={{
              color: consentStatus?.consentGiven ? '#2e7d32' : '#c62828',
              marginBottom: '10px'
            }}>
              {consentStatus?.consentGiven ? '✅ Consent Given' : '❌ Consent Not Given'}
            </h4>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Biometric data processing for attendance verification
            </p>
            {consentStatus?.consentDate && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                Last updated: {new Date(consentStatus.consentDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div style={{
            padding: '15px',
            border: `2px solid ${consentStatus?.isActive ? '#4caf50' : '#ff9800'}`,
            borderRadius: '8px',
            background: consentStatus?.isActive ? '#f8fff8' : '#fff8e1'
          }}>
            <h4 style={{
              color: consentStatus?.isActive ? '#2e7d32' : '#f57c00',
              marginBottom: '10px'
            }}>
              {consentStatus?.isActive ? '🟢 Data Active' : '🟡 Data Inactive'}
            </h4>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Your biometric data is {consentStatus?.isActive ? 'actively used' : 'not being used'} for verification
            </p>
            {consentStatus?.encodingsCount > 0 && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                Face encodings stored: {consentStatus.encodingsCount}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Information */}
      <div style={{
        background: '#e3f2fd',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #2196f3'
      }}>
        <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>📋 What We Collect & Why</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ color: '#333', marginBottom: '8px' }}>Biometric Data:</h4>
          <ul style={{ paddingLeft: '20px', color: '#666' }}>
            <li>Facial feature measurements (face encodings)</li>
            <li>Face quality metrics</li>
            <li>Liveness detection data</li>
          </ul>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ color: '#333', marginBottom: '8px' }}>Purpose:</h4>
          <ul style={{ paddingLeft: '20px', color: '#666' }}>
            <li>Automated attendance verification</li>
            <li>Security and fraud prevention</li>
            <li>System improvement and analytics</li>
          </ul>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ color: '#333', marginBottom: '8px' }}>Data Protection:</h4>
          <ul style={{ paddingLeft: '20px', color: '#666' }}>
            <li>AES-256 encryption for all biometric data</li>
            <li>Secure storage with access controls</li>
            <li>Regular security audits and monitoring</li>
            <li>Data retention limit of 2 years</li>
          </ul>
        </div>
      </div>

      {/* Consent Management Actions */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Manage Your Consent</h3>

        {!consentStatus?.consentGiven && (
          <div style={{
            background: '#fff3e0',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '1px solid #ff9800'
          }}>
            <h4 style={{ color: '#f57c00', marginBottom: '10px' }}>⚠️ Consent Required</h4>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              To use face recognition for attendance, you need to give consent for biometric data processing.
              Click "Give Consent" below to enable this feature.
            </p>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {!consentStatus?.consentGiven ? (
            <button
              onClick={() => updateConsent('biometric_processing', true)}
              disabled={loading}
              style={{
                background: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {loading ? 'Processing...' : '✅ Give Consent'}
            </button>
          ) : (
            <button
              onClick={() => updateConsent('biometric_processing', false)}
              disabled={loading}
              style={{
                background: '#f44336',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Withdraw Consent
            </button>
          )}

          <button
            onClick={() => setShowConsentForm(true)}
            disabled={loading}
            style={{
              background: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Update Preferences
          </button>
        </div>
      </div>

      {/* Your Rights */}
      <div style={{
        background: '#fff3e0',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ff9800'
      }}>
        <h3 style={{ color: '#f57c00', marginBottom: '15px' }}>⚖️ Your Rights</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <h4 style={{ color: '#333', marginBottom: '8px' }}>Right to Access</h4>
            <p style={{ fontSize: '14px', color: '#666' }}>
              View and download all your biometric data
            </p>
          </div>
          
          <div>
            <h4 style={{ color: '#333', marginBottom: '8px' }}>Right to Rectification</h4>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Update or correct your biometric data
            </p>
          </div>
          
          <div>
            <h4 style={{ color: '#333', marginBottom: '8px' }}>Right to Erasure</h4>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Delete all your biometric data permanently
            </p>
          </div>
          
          <div>
            <h4 style={{ color: '#333', marginBottom: '8px' }}>Right to Portability</h4>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Export your data in a machine-readable format
            </p>
          </div>
        </div>
      </div>

      {/* Consent Form Modal */}
      {showConsentForm && (
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Update Consent Preferences</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '15px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '10px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={consentData.biometricProcessing}
                  onChange={(e) => setConsentData(prev => ({
                    ...prev,
                    biometricProcessing: e.target.checked
                  }))}
                  style={{ transform: 'scale(1.2)' }}
                />
                <div>
                  <strong>Biometric Data Processing</strong>
                  <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0 0' }}>
                    Allow processing of facial biometric data for attendance verification
                  </p>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '15px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '10px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={consentData.dataRetention}
                  onChange={(e) => setConsentData(prev => ({
                    ...prev,
                    dataRetention: e.target.checked
                  }))}
                  style={{ transform: 'scale(1.2)' }}
                />
                <div>
                  <strong>Data Retention</strong>
                  <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0 0' }}>
                    Store biometric data for up to 2 years for system improvement
                  </p>
                </div>
              </label>
            </div>

            <div style={{
              background: '#f5f5f5',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                By providing consent, you acknowledge that you have read and understood our privacy policy. 
                You can withdraw consent at any time, which will deactivate your biometric data processing.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleConsentSubmit}
                disabled={loading}
                style={{
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Updating...' : 'Update Consent'}
              </button>
              <button
                onClick={() => setShowConsentForm(false)}
                style={{
                  background: '#6c757d',
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentManager;
