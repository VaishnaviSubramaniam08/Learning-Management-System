import React, { useState, useEffect } from 'react';
import axios from '../api';

const Certificate = ({ certificateId, onDownload }) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/courses/certificate/${certificateId}`);
      setCertificate(response.data);
    } catch (error) {
      setError('Error fetching certificate: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      console.log('🔍 Certificate Download Debug - Starting download for certificate:', certificateId);
      
      // Generate PDF certificate from backend
      const response = await axios.get(`/courses/certificate/${certificateId}/download`, {
        responseType: 'blob'
      });
      
      console.log('✅ Certificate Download Debug - PDF received, creating download link');
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificate.certificateNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Certificate Download Debug - Download initiated');
      
      if (onDownload) {
        onDownload(certificate);
      }
    } catch (error) {
      console.error('❌ Certificate Download Error:', error);
      setError('Error downloading certificate: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading certificate...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
  }

  if (!certificate) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Certificate not found</div>;
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      background: 'white', 
      border: '2px solid #gold', 
      borderRadius: '10px',
      padding: '40px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      {/* Certificate Border */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        bottom: '20px',
        border: '3px solid #d4af37',
        borderRadius: '8px',
        pointerEvents: 'none'
      }} />
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          color: '#d4af37', 
          fontSize: '32px', 
          margin: '0 0 10px 0',
          fontFamily: 'serif',
          fontWeight: 'bold'
        }}>
          {certificate.title}
        </h1>
        <div style={{ 
          width: '100px', 
          height: '2px', 
          background: '#d4af37', 
          margin: '0 auto' 
        }} />
      </div>

      {/* Certificate Number */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        fontSize: '14px',
        color: '#666'
      }}>
        Certificate Number: {certificate.certificateNumber}
      </div>

      {/* Main Content */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ 
          fontSize: '18px', 
          lineHeight: '1.6',
          marginBottom: '20px',
          color: '#333'
        }}>
          This is to certify that
        </p>
        
        <h2 style={{ 
          fontSize: '28px', 
          color: '#2c3e50',
          margin: '20px 0',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {certificate.metadata?.studentName || `${certificate.student?.firstName} ${certificate.student?.lastName}`}
        </h2>
        
        <p style={{ 
          fontSize: '18px', 
          lineHeight: '1.6',
          marginBottom: '20px',
          color: '#333'
        }}>
          has successfully completed the course
        </p>
        
        <h3 style={{ 
          fontSize: '24px', 
          color: '#34495e',
          margin: '20px 0',
          fontWeight: 'bold'
        }}>
          {certificate.metadata?.courseTitle || certificate.course?.title}
        </h3>
        
        <p style={{ 
          fontSize: '16px', 
          lineHeight: '1.6',
          marginBottom: '30px',
          color: '#666'
        }}>
          {certificate.description}
        </p>
      </div>

      {/* Course Details */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginBottom: '40px',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <strong>Course Duration:</strong> {certificate.metadata?.courseDuration || certificate.course?.duration} hours
        </div>
        <div>
          <strong>Modules Completed:</strong> {certificate.metadata?.modulesCompleted}/{certificate.metadata?.totalModules}
        </div>
        <div>
          <strong>Completion Score:</strong> {certificate.metadata?.completionScore || 100}%
        </div>
        <div>
          <strong>Completion Date:</strong> {new Date(certificate.completionDate).toLocaleDateString()}
        </div>
      </div>

      {/* Signature Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        marginTop: '60px'
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          {certificate.instructorSignature && (
            <img 
              src={certificate.instructorSignature} 
              alt="Instructor Signature" 
              style={{ 
                maxWidth: '150px', 
                maxHeight: '60px',
                marginBottom: '10px'
              }} 
            />
          )}
          <div style={{ 
            width: '150px', 
            height: '1px', 
            background: '#333', 
            margin: '0 auto 10px auto' 
          }} />
          <p style={{ margin: '0', fontWeight: 'bold' }}>
            {certificate.instructorName}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Course Instructor
          </p>
        </div>
        
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ 
            width: '150px', 
            height: '1px', 
            background: '#333', 
            margin: '0 auto 10px auto' 
          }} />
          <p style={{ margin: '0', fontWeight: 'bold' }}>
            {new Date(certificate.issuedDate).toLocaleDateString()}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Date Issued
          </p>
        </div>
      </div>

      {/* QR Code for Verification */}
      {certificate.qrCodeUrl && (
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px',
          textAlign: 'center'
        }}>
          <img 
            src={certificate.qrCodeUrl} 
            alt="QR Code" 
            style={{ 
              width: '60px', 
              height: '60px',
              marginBottom: '5px'
            }} 
          />
          <p style={{ fontSize: '10px', color: '#666', margin: '0' }}>
            Verify Certificate
          </p>
        </div>
      )}

      {/* Download Button */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={handleDownload}
          style={{
            padding: '12px 24px',
            background: '#d4af37',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          📄 Download Certificate
        </button>
      </div>

      {/* Verification Link */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '20px',
        fontSize: '14px',
        color: '#666'
      }}>
        <p>
          Verify this certificate at: 
          <a 
            href={`/verify/${certificate.certificateNumber}`}
            style={{ color: '#007bff', textDecoration: 'none', marginLeft: '5px' }}
          >
            {window.location.origin}/verify/{certificate.certificateNumber}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Certificate; 