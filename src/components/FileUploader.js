import React, { useState, useEffect, useRef } from 'react';
import axios from '../api';

const FileUploader = ({ user, courseId, moduleId, uploadType = 'general', onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [allowedTypes, setAllowedTypes] = useState({});
  const [myFiles, setMyFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [filters, setFilters] = useState({
    uploadType: '',
    status: '',
    courseId: ''
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    description: '',
    tags: '',
    deadline: '',
    isRequired: false,
    accessLevel: 'private',
    allowedViewers: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAllowedTypes();
    fetchMyFiles();
  }, [user]);

  useEffect(() => {
    if (courseId) {
      setFilters(prev => ({ ...prev, courseId }));
    }
  }, [courseId]);

  const fetchAllowedTypes = async () => {
    try {
      const response = await axios.get('/file-upload/allowed-types');
      setAllowedTypes(response.data);
    } catch (error) {
      console.error('Error fetching allowed types:', error);
    }
  };

  const fetchMyFiles = async () => {
    if (!user?.id) return;
    
    try {
      const params = new URLSearchParams();
      if (filters.uploadType) params.append('uploadType', filters.uploadType);
      if (filters.status) params.append('status', filters.status);
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (moduleId) params.append('moduleId', moduleId);

      const response = await axios.get(`/file-upload/my-files?${params}`);
      setMyFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const validateFile = (file) => {
    const maxSize = allowedTypes.maxFileSize || 10 * 1024 * 1024; // 10MB default
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    
    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${(maxSize / (1024 * 1024)).toFixed(1)}MB limit` };
    }
    
    // Check file extension
    if (allowedTypes.restrictedExtensions && allowedTypes.restrictedExtensions.includes(extension)) {
      return { valid: false, error: 'File type not allowed for security reasons' };
    }
    
    if (allowedTypes.allowedExtensions && !allowedTypes.allowedExtensions.includes(extension)) {
      return { valid: false, error: 'File type not supported' };
    }
    
    return { valid: true };
  };

  const uploadFile = async (fileData) => {
    const validation = validateFile(fileData.file);
    if (!validation.valid) {
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'error', error: validation.error }
          : f
      ));
      return;
    }

    setFiles(prev => prev.map(f => 
      f.id === fileData.id ? { ...f, status: 'uploading' } : f
    ));

    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('courseId', courseId || '');
    formData.append('moduleId', moduleId || '');
    formData.append('uploadType', uploadType);
    formData.append('description', uploadForm.description);
    formData.append('tags', uploadForm.tags);
    formData.append('deadline', uploadForm.deadline);
    formData.append('isRequired', uploadForm.isRequired);
    formData.append('accessLevel', uploadForm.accessLevel);
    formData.append('allowedViewers', uploadForm.allowedViewers);

    try {
      const response = await axios.post('/file-upload/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [fileData.id]: progress }));
        }
      });

      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'success', uploadedFile: response.data.file }
          : f
      ));

      if (onUploadComplete) {
        onUploadComplete(response.data.file);
      }

      // Refresh file list
      fetchMyFiles();
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'error', error: error.response?.data?.message || 'Upload failed' }
          : f
      ));
    }
  };

  const handleUploadAll = async () => {
    setUploading(true);
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const fileData of pendingFiles) {
      await uploadFile(fileData);
    }
    
    setUploading(false);
    setShowUploadModal(false);
    setUploadForm({
      description: '',
      tags: '',
      deadline: '',
      isRequired: false,
      accessLevel: 'private',
      allowedViewers: ''
    });
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const downloadFile = async (fileId) => {
    try {
      const response = await axios.get(`/file-upload/download/${fileId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', response.headers['content-disposition']?.split('filename=')[1] || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file');
    }
  };

  const deleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`/file-upload/${fileId}`);
        fetchMyFiles();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting file');
      }
    }
  };

  const replaceFile = async (fileId) => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', uploadForm.description);

    try {
      await axios.put(`/file-upload/replace/${fileId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      setSelectedFile(null);
      setShowUploadModal(false);
      fetchMyFiles();
    } catch (error) {
      console.error('Replace error:', error);
      alert('Error replacing file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded': return '#10b981';
      case 'late': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'approved': return '#3b82f6';
      case 'uploading': return '#3b82f6';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '24px' }}>
          📤 File Upload System
        </h2>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Upload assignments, documents, and other course materials
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'upload' ? '#6b46c1' : 'transparent',
            color: activeTab === 'upload' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'upload' ? '2px solid #6b46c1' : 'none',
            fontWeight: activeTab === 'upload' ? 'bold' : 'normal'
          }}
        >
          Upload Files
        </button>
        <button
          onClick={() => setActiveTab('my-files')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'my-files' ? '#6b46c1' : 'transparent',
            color: activeTab === 'my-files' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'my-files' ? '2px solid #6b46c1' : 'none',
            fontWeight: activeTab === 'my-files' ? 'bold' : 'normal'
          }}
        >
          My Files ({myFiles.length})
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div>
          {/* File Type Info */}
          <div style={{ 
            background: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>📋 Supported File Types</h4>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              <strong>Documents:</strong> PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV<br/>
              <strong>Images:</strong> JPG, PNG, GIF, BMP, WEBP<br/>
              <strong>Code:</strong> PY, JAVA, CPP, C, JS, HTML, CSS, JSON, XML<br/>
              <strong>Archives:</strong> ZIP, RAR, 7Z, TAR, GZ<br/>
              <strong>Max Size:</strong> {allowedTypes.maxFileSize ? (allowedTypes.maxFileSize / (1024 * 1024)).toFixed(1) : 10}MB
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed',
              borderColor: dragActive ? '#6b46c1' : '#d1d5db',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              background: dragActive ? '#f3f4f6' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>
              {dragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
              or click to browse files
            </p>
            <button
              style={{
                padding: '8px 16px',
                background: '#6b46c1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Selected Files</h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                {files.map(fileData => (
                  <div key={fileData.id} style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '24px' }}>
                      {fileData.status === 'success' ? '✅' : 
                       fileData.status === 'error' ? '❌' : 
                       fileData.status === 'uploading' ? '⏳' : '📄'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#374151' }}>
                        {fileData.file.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {formatFileSize(fileData.file.size)}
                      </div>
                      {fileData.error && (
                        <div style={{ fontSize: '14px', color: '#ef4444', marginTop: '4px' }}>
                          {fileData.error}
                        </div>
                      )}
                      {fileData.status === 'uploading' && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{
                            width: '100%',
                            height: '4px',
                            background: '#e5e7eb',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${uploadProgress[fileData.id] || 0}%`,
                              height: '100%',
                              background: '#6b46c1',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            {uploadProgress[fileData.id] || 0}%
                          </div>
                        </div>
                      )}
                    </div>
                    {fileData.status === 'pending' && (
                      <button
                        onClick={() => removeFile(fileData.id)}
                        style={{
                          padding: '4px 8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {files.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowUploadModal(true)}
                disabled={uploading || files.every(f => f.status === 'success' || f.status === 'error')}
                style={{
                  padding: '12px 24px',
                  background: uploading || files.every(f => f.status === 'success' || f.status === 'error') ? '#d1d5db' : '#6b46c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: uploading || files.every(f => f.status === 'success' || f.status === 'error') ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Files Tab */}
      {activeTab === 'my-files' && (
        <div>
          {/* Filters */}
          <div style={{ 
            background: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <select
                value={filters.uploadType}
                onChange={(e) => setFilters({ ...filters, uploadType: e.target.value })}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Types</option>
                <option value="assignment">Assignment</option>
                <option value="contest">Contest</option>
                <option value="general">General</option>
                <option value="certificate">Certificate</option>
                <option value="profile">Profile</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Status</option>
                <option value="uploaded">Uploaded</option>
                <option value="late">Late</option>
                <option value="rejected">Rejected</option>
                <option value="approved">Approved</option>
              </select>
              <button
                onClick={fetchMyFiles}
                style={{
                  padding: '8px 16px',
                  background: '#6b46c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Files List */}
          {myFiles.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#6b7280',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
              <h3 style={{ margin: '0 0 8px 0' }}>No files uploaded yet</h3>
              <p style={{ margin: 0 }}>Upload your first file to get started</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {myFiles.map(file => (
                <div key={file._id} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>{file.originalName}</h3>
                      <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                        {file.description || 'No description'}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '2px 6px',
                          background: '#f3f4f6',
                          color: '#374151',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {file.uploadType}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          background: getStatusColor(file.status),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {file.status}
                        </span>
                        {file.isLate && (
                          <span style={{
                            padding: '2px 6px',
                            background: '#f59e0b',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            Late
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {formatFileSize(file.fileSize)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {formatDate(file.uploadedAt)}
                      </div>
                    </div>
                  </div>

                  {file.tags && file.tags.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {file.tags.map(tag => (
                          <span key={tag} style={{
                            padding: '4px 8px',
                            background: '#e0e7ff',
                            color: '#3730a3',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => downloadFile(file._id)}
                      style={{
                        padding: '6px 12px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Download
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setShowUploadModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Replace
                    </button>
                    <button
                      onClick={() => deleteFile(file._id)}
                      style={{
                        padding: '6px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
              {selectedFile ? 'Replace File' : 'Upload Files'}
            </h3>
            
            {selectedFile && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#374151' }}>Replacing:</strong> {selectedFile.originalName}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Describe your file..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                placeholder="e.g., assignment, java, project"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                Deadline (optional)
              </label>
              <input
                type="datetime-local"
                value={uploadForm.deadline}
                onChange={(e) => setUploadForm({ ...uploadForm, deadline: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontWeight: 'bold' }}>
                Access Level
              </label>
              <select
                value={uploadForm.accessLevel}
                onChange={(e) => setUploadForm({ ...uploadForm, accessLevel: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="private">Private (Only you)</option>
                <option value="course">Course (Instructor can view)</option>
                <option value="public">Public (Anyone can view)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setUploadForm({
                    description: '',
                    tags: '',
                    deadline: '',
                    isRequired: false,
                    accessLevel: 'private',
                    allowedViewers: ''
                  });
                }}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={selectedFile ? replaceFile : handleUploadAll}
                disabled={uploading}
                style={{
                  padding: '8px 16px',
                  background: uploading ? '#d1d5db' : '#6b46c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {uploading ? 'Uploading...' : (selectedFile ? 'Replace File' : 'Upload Files')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 