import React, { useState } from 'react';
import axios from '../api';

const QuickConsentButton = ({ onConsentGiven, style = {} }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const giveConsent = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Sending consent request...');
      const response = await axios.post('/privacy/consent', {
        consentGiven: true,
        consentType: 'biometric_processing'
      });

      console.log('Consent response:', response.data);

      if (response.data.success) {
        console.log('Consent recorded successfully');
        if (onConsentGiven) {
          onConsentGiven();
        }
      } else {
        console.error('Consent failed:', response.data);
        setError(response.data.message || 'Failed to record consent');
      }
    } catch (err) {
      console.error('Consent error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || err.message || 'Failed to record consent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', ...style }}>
      <div style={{
        background: '#e3f2fd',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #2196f3'
      }}>
        <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>🔒 Consent Required</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          To use face recognition for attendance, we need your consent to process your biometric data.
          Your data will be encrypted and stored securely.
        </p>
        
        <div style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px',
          textAlign: 'left'
        }}>
          <h4 style={{ marginBottom: '10px' }}>What we collect:</h4>
          <ul style={{ paddingLeft: '20px', color: '#666' }}>
            <li>Facial feature measurements (face encodings)</li>
            <li>Face quality metrics</li>
            <li>Verification timestamps</li>
          </ul>
          
          <h4 style={{ marginBottom: '10px', marginTop: '15px' }}>How we protect it:</h4>
          <ul style={{ paddingLeft: '20px', color: '#666' }}>
            <li>AES-256 encryption for all biometric data</li>
            <li>Secure storage with access controls</li>
            <li>Data retention limit of 2 years</li>
            <li>You can withdraw consent anytime</li>
          </ul>
        </div>

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={giveConsent}
          disabled={loading}
          style={{
            background: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Processing...' : '✅ I Give Consent'}
        </button>
        
        <p style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginTop: '10px',
          fontStyle: 'italic'
        }}>
          By clicking "I Give Consent", you agree to our biometric data processing for attendance verification.
        </p>
      </div>
    </div>
  );
};

export default QuickConsentButton;
