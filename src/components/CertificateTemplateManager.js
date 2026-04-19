import React, { useState, useEffect } from 'react';
import axios from '../api';

const CertificateTemplateManager = ({ courseId, onTemplateUpdated }) => {
  const [template, setTemplate] = useState({
    title: 'Certificate of Completion',
    description: 'This is to certify that the student has successfully completed the course requirements.',
    instructorSignature: '',
    instructorName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [canCreateCertificates, setCanCreateCertificates] = useState(false);
  const [moduleCount, setModuleCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    if (courseId) {
      fetchTemplate();
    }
  }, [courseId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      console.log('🔍 CertificateTemplateManager Debug - Fetching template for course:', courseId);
      
      const response = await axios.get(`/courses/${courseId}/certificate-template`);
      console.log('✅ CertificateTemplateManager Debug - Response received:', response.data);
      
      setTemplate(response.data.certificateTemplate || template);
      setCanCreateCertificates(response.data.canCreateCertificates);
      setModuleCount(response.data.moduleCount);
      
      console.log('✅ CertificateTemplateManager Debug - State updated:', {
        canCreateCertificates: response.data.canCreateCertificates,
        moduleCount: response.data.moduleCount,
        hasTemplate: !!response.data.certificateTemplate
      });
    } catch (error) {
      console.error('❌ CertificateTemplateManager Debug - Error:', error);
      setMessage('Error fetching certificate template: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemplate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplate(prev => ({
          ...prev,
          instructorSignature: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.put(`/courses/${courseId}/certificate-template`, {
        ...template,
        instructorName: template.instructorName || `${user?.firstName} ${user?.lastName}`
      });

      setMessage('Certificate template created successfully!');
      setCanCreateCertificates(true);
      
      if (onTemplateUpdated) {
        onTemplateUpdated(response.data.certificateTemplate);
      }
    } catch (error) {
      setMessage('Error creating certificate template: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !template) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading certificate template...</div>;
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      background: 'white', 
      padding: '30px', 
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        color: '#2c3e50',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        🏆 Certificate Template Manager
      </h2>

      {/* Module Requirement Check */}
      {!canCreateCertificates && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>
            ⚠️ Module Requirement
          </h4>
          <p style={{ margin: '0', color: '#856404' }}>
            Your course needs at least <strong>5 modules</strong> to create certificates. 
            Currently you have <strong>{moduleCount} modules</strong>.
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#856404', fontSize: '14px' }}>
            Add more modules to your course to enable certificate creation.
          </p>
        </div>
      )}

      {/* Certificate Template Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
            Certificate Title *
          </label>
          <input
            type="text"
            name="title"
            value={template.title}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            placeholder="e.g., Certificate of Advanced JavaScript Mastery"
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
            Certificate Description *
          </label>
          <textarea
            name="description"
            value={template.description}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '16px',
              minHeight: '100px',
              resize: 'vertical'
            }}
            placeholder="Describe what this certificate represents..."
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
            Instructor Name
          </label>
          <input
            type="text"
            name="instructorName"
            value={template.instructorName}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            placeholder={`${user?.firstName} ${user?.lastName}`}
          />
          <small style={{ color: '#666', fontSize: '14px' }}>
            Leave empty to use your profile name
          </small>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
            Digital Signature *
          </label>
          <div style={{
            border: '2px dashed #e1e5e9',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            background: '#f8f9fa'
          }}>
            {template.instructorSignature ? (
              <div>
                <img 
                  src={template.instructorSignature} 
                  alt="Instructor Signature" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '100px',
                    marginBottom: '10px'
                  }} 
                />
                <br />
                <button
                  type="button"
                  onClick={() => setTemplate(prev => ({ ...prev, instructorSignature: '' }))}
                  style={{
                    padding: '8px 16px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Remove Signature
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>✍️</div>
                <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                  Upload your digital signature
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  style={{ display: 'none' }}
                  id="signature-upload"
                />
                <label
                  htmlFor="signature-upload"
                  style={{
                    padding: '10px 20px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Choose Signature Image
                </label>
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                  Recommended: PNG or JPG, max 2MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Preview */}
        {template.title && template.description && (
          <div style={{
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            padding: '20px',
            background: '#f8f9fa'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
              📄 Certificate Preview
            </h4>
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                color: '#d4af37',
                fontSize: '20px'
              }}>
                {template.title}
              </h3>
              <p style={{ 
                margin: '0 0 20px 0', 
                color: '#666',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {template.description}
              </p>
              {template.instructorSignature && (
                <div style={{ marginTop: '20px' }}>
                  <img 
                    src={template.instructorSignature} 
                    alt="Signature Preview" 
                    style={{ 
                      maxWidth: '150px', 
                      maxHeight: '60px',
                      marginBottom: '5px'
                    }} 
                  />
                  <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                    {template.instructorName || `${user?.firstName} ${user?.lastName}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {message && (
          <div style={{ 
            padding: '12px', 
            borderRadius: '6px', 
            background: message.includes('Error') ? '#f8d7da' : '#d4edda',
            color: message.includes('Error') ? '#721c24' : '#155724',
            border: `1px solid ${message.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`
          }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !canCreateCertificates || !template.instructorSignature}
          style={{
            padding: '15px 30px',
            background: loading || !canCreateCertificates || !template.instructorSignature ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || !canCreateCertificates || !template.instructorSignature ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background 0.3s ease'
          }}
        >
          {loading ? 'Creating Template...' : 'Create Certificate Template'}
        </button>

        {!canCreateCertificates && (
          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            Complete your course with at least 5 modules to enable certificate creation
          </p>
        )}
      </form>
    </div>
  );
};

export default CertificateTemplateManager; 