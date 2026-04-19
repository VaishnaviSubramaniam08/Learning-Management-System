import React, { useState, useEffect } from 'react';
import axios from '../api';
import Certificate from './Certificate';

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    if (userData.id) {
      fetchCertificates(userData.id);
    }
  }, []);

  const fetchCertificates = async (studentId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/courses/student/${studentId}/certificates`);
      setCertificates(response.data);
    } catch (error) {
      setError('Error fetching certificates: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateClick = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleDownload = (certificate) => {
    console.log('Certificate downloaded:', certificate.certificateNumber);
  };

  const handleCloseModal = () => {
    setSelectedCertificate(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading certificates...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: 'red'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          margin: '0 0 10px 0', 
          color: '#2c3e50',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          🏆 My Certificates
        </h1>
        <p style={{ 
          margin: '0', 
          color: '#666',
          fontSize: '16px'
        }}>
          View and download your course completion certificates
        </p>
      </div>

      {certificates.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📜</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
            No Certificates Yet
          </h3>
          <p style={{ margin: '0', color: '#666', fontSize: '16px' }}>
            Complete courses to earn certificates. Your achievements will appear here.
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '20px' 
        }}>
          {certificates.map((certificate) => (
            <div
              key={certificate._id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '25px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: '2px solid #f8f9fa',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onClick={() => handleCertificateClick(certificate)}
            >
              {/* Certificate Border */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '4px',
                background: 'linear-gradient(90deg, #d4af37, #f1c40f, #d4af37)'
              }} />

              {/* Certificate Number */}
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#d4af37',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                #{certificate.certificateNumber.split('-')[2]}
              </div>

              {/* Course Title */}
              <h3 style={{
                margin: '0 0 15px 0',
                color: '#2c3e50',
                fontSize: '20px',
                fontWeight: 'bold',
                lineHeight: '1.3'
              }}>
                {certificate.metadata?.courseTitle || certificate.course?.title}
              </h3>

              {/* Course Description */}
              <p style={{
                margin: '0 0 20px 0',
                color: '#666',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {certificate.course?.description?.substring(0, 100)}...
              </p>

              {/* Certificate Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                <div>
                  <strong style={{ color: '#2c3e50' }}>Completion Date:</strong>
                  <br />
                  <span style={{ color: '#666' }}>
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#2c3e50' }}>Score:</strong>
                  <br />
                  <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                    {certificate.metadata?.completionScore || 100}%
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#2c3e50' }}>Modules:</strong>
                  <br />
                  <span style={{ color: '#666' }}>
                    {certificate.metadata?.modulesCompleted}/{certificate.metadata?.totalModules}
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#2c3e50' }}>Duration:</strong>
                  <br />
                  <span style={{ color: '#666' }}>
                    {certificate.metadata?.courseDuration || certificate.course?.duration} hours
                  </span>
                </div>
              </div>

              {/* Instructor */}
              <div style={{
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '6px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                  Instructor
                </div>
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {certificate.instructorName}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCertificateClick(certificate);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#2980b9'}
                  onMouseLeave={(e) => e.target.style.background = '#3498db'}
                >
                  👁️ View Certificate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle download
                    const url = window.URL.createObjectURL(new Blob(['Certificate PDF']));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `certificate-${certificate.certificateNumber}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                  }}
                  style={{
                    padding: '10px 15px',
                    background: '#d4af37',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#b8941f'}
                  onMouseLeave={(e) => e.target.style.background = '#d4af37'}
                >
                  📄 Download
                </button>
              </div>

              {/* Verification Badge */}
              <div style={{
                position: 'absolute',
                bottom: '15px',
                right: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                color: '#27ae60'
              }}>
                <span style={{ fontSize: '16px' }}>✓</span>
                Verified
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '18px',
                zIndex: 1001
              }}
            >
              ×
            </button>
            <Certificate 
              certificateId={selectedCertificate._id} 
              onDownload={handleDownload}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage; 