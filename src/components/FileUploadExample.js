import React, { useState } from 'react';
import { validateFiles, formatFileSize, getFileIcon, createValidationErrorMessage, getMaxFileSize } from '../utils/fileValidation';

const FileUploadExample = ({ userRole = 'student', uploadType = 'assignment_submission' }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
      setSelectedFiles([]);
      setValidationResult(null);
      return;
    }

    // Validate files
    const result = validateFiles(files, uploadType, userRole, 10);
    setValidationResult(result);
    
    if (result.isValid) {
      setSelectedFiles(files);
    } else {
      // Show only valid files if any exist
      if (result.validFiles.length > 0) {
        const validFiles = result.validFiles.map(f => f.file);
        setSelectedFiles(validFiles);
      } else {
        setSelectedFiles([]);
      }
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    if (newFiles.length > 0) {
      const result = validateFiles(newFiles, uploadType, userRole, 10);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('uploadType', uploadType);
      
      // Simulate upload (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Files uploaded successfully!');
      setSelectedFiles([]);
      setValidationResult(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const maxFileSize = getMaxFileSize(uploadType, userRole);
  const maxFileSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      background: 'white'
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
        📤 File Upload Example
      </h2>
      
      {/* Upload Info */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#0c4a6e' }}>Upload Guidelines</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#0369a1' }}>
          <li>Maximum file size: <strong>{maxFileSizeMB}MB</strong></li>
          <li>User role: <strong>{userRole}</strong></li>
          <li>Upload type: <strong>{uploadType}</strong></li>
          <li>Allowed types: PDF, DOC, DOCX, images, archives, etc.</li>
          <li>Maximum 10 files per upload</li>
        </ul>
      </div>

      {/* File Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: 'bold',
          color: '#374151'
        }}>
          Select Files
        </label>
        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            background: '#f9fafb'
          }}
        />
      </div>

      {/* Validation Results */}
      {validationResult && !validationResult.isValid && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>❌ Validation Errors</h4>
          <div style={{ color: '#991b1b', fontSize: '14px', whiteSpace: 'pre-line' }}>
            {createValidationErrorMessage(validationResult)}
          </div>
          {validationResult.validFiles.length > 0 && (
            <p style={{ margin: '8px 0 0 0', color: '#059669', fontSize: '14px' }}>
              ✅ {validationResult.validFiles.length} valid files will be uploaded.
            </p>
          )}
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
            📁 Selected Files ({selectedFiles.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedFiles.map((file, index) => (
              <div key={index} style={{
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {getFileIcon(file.name, file.type)}
                  </span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#374151' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          {/* Total Size */}
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#0c4a6e'
          }}>
            📊 Total size: {formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            setSelectedFiles([]);
            setValidationResult(null);
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.value = '';
          }}
          disabled={uploading || selectedFiles.length === 0}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: uploading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: uploading || selectedFiles.length === 0 ? 0.5 : 1
          }}
        >
          Clear All
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0 || (validationResult && !validationResult.isValid)}
          style={{
            background: uploading || selectedFiles.length === 0 || (validationResult && !validationResult.isValid) ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: uploading || selectedFiles.length === 0 || (validationResult && !validationResult.isValid) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {uploading ? '⏳ Uploading...' : `📤 Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
};

export default FileUploadExample;
