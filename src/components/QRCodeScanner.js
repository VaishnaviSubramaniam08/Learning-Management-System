import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRCodeScanner = ({ onScan, onClose, isActive }) => {
  const [scanner, setScanner] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    let html5QrCode;

    const startScanner = async () => {
      try {
        setScanning(true);
        setError('');

        // Create scanner instance
        html5QrCode = new Html5Qrcode('qr-reader');
        setScanner(html5QrCode);

        // Request camera permissions
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          setPermissionGranted(true);
          
          // Start scanning
          await html5QrCode.start(
            { facingMode: 'environment' }, // Prefer back camera
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              // On successful scan
              handleScanSuccess(decodedText, html5QrCode);
            },
            (errorMessage) => {
              // Ignore errors during scanning as they're usually just frames without QR codes
              console.log(errorMessage);
            }
          );
        } else {
          setError('No camera devices found. Please ensure your device has a camera and you have granted permission.');
          setScanning(false);
        }
      } catch (err) {
        console.error('Error starting QR scanner:', err);
        setError('Failed to start camera. Please ensure you have granted camera permissions.');
        setScanning(false);
      }
    };

    if (isActive) {
      startScanner();
    }

    // Cleanup function
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop()
          .catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, [isActive, onScan]);

  const handleScanSuccess = async (decodedText, scanner) => {
    try {
      // Stop scanning
      if (scanner && scanner.isScanning) {
        await scanner.stop();
      }
      
      // Call the onScan callback with the decoded QR code
      onScan(decodedText);
    } catch (err) {
      console.error('Error handling scan result:', err);
      setError('Error processing scan result. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleClose = () => {
    if (scanner && scanner.isScanning) {
      scanner.stop()
        .then(() => {
          onClose();
        })
        .catch(err => {
          console.error('Error stopping scanner:', err);
          onClose();
        });
    } else {
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#333'
          }}
        >
          ×
        </button>

        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          📱 QR Code Scanner
        </h3>

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          {scanning ? (
            <p>📷 Point your camera at the QR code</p>
          ) : permissionGranted ? (
            <p>✅ Camera ready</p>
          ) : (
            <p>⚠️ Please allow camera access when prompted</p>
          )}
        </div>

        <div
          id="qr-reader"
          style={{
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
            overflow: 'hidden',
            borderRadius: '10px',
            border: '1px solid #ddd'
          }}
        ></div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleClose}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;