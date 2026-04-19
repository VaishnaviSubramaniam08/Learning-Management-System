import React, { useState, useEffect, useRef } from 'react';
import axios from '../api';
import { validateFiles, formatFileSize, getFileIcon, createValidationErrorMessage, getMaxFileSize } from '../utils/fileValidation';

const InstructorFileManager = ({ user }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [myFiles, setMyFiles] = useState([]);
  const [courseFiles, setCourseFiles] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    tags: '',
    courseId: '',
    uploadType: 'course_material',
    accessLevel: 'course',
    releaseDate: '',
    language: 'en'
  });
  const [dragActive, setDragActive] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
      fetchMyFiles();
    }
  }, [user]);

  useEffect(() => {
    if (uploadForm.courseId) {
      fetchCourseFiles(uploadForm.courseId);
    }
  }, [uploadForm.courseId]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/courses/instructor/${user.id}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchMyFiles = async () => {
    try {
      const response = await axios.get('/file-upload/my-files', {
        params: {
          page: 1,
          limit: 50
        }
      });
      setMyFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching my files:', error);
      setMyFiles([]);
    }
  };

  const fetchCourseFiles = async (courseId) => {
    try {
      const response = await axios.get(`/file-upload/course/${courseId}`);
      setCourseFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching course files:', error);
      setCourseFiles([]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    // Validate files
    const validation = validateFiles(selectedFiles, uploadForm.uploadType, 'instructor', 10);
    if (!validation.isValid) {
      alert(createValidationErrorMessage(validation.errors));
      return;
    }

    setUploading(true);

    try {
      if (selectedFiles.length === 1) {
        // Single file upload
        const formData = new FormData();
        formData.append('file', selectedFiles[0]);
        
        Object.keys(uploadForm).forEach(key => {
          if (uploadForm[key]) {
            formData.append(key, uploadForm[key]);
          }
        });

        await axios.post('/file-upload/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        alert('File uploaded successfully!');
      } else {
        // Multiple files upload
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        
        formData.append('courseId', uploadForm.courseId);
        formData.append('uploadType', uploadForm.uploadType);

        await axios.post('/file-upload/bulk-upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        alert(`${selectedFiles.length} files uploaded successfully!`);
      }
      
      // Reset form and refresh files
      setSelectedFiles([]);
      setUploadForm({
        title: '',
        description: '',
        tags: '',
        courseId: uploadForm.courseId, // Keep course selected
        uploadType: 'course_material',
        accessLevel: 'course',
        releaseDate: '',
        language: 'en'
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      fetchMyFiles();
      if (uploadForm.courseId) {
        fetchCourseFiles(uploadForm.courseId);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await axios.get(`/file-upload/download/${fileId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await axios.delete(`/file-upload/file/${fileId}`);
      alert('File deleted successfully!');
      fetchMyFiles();
      if (uploadForm.courseId) {
        fetchCourseFiles(uploadForm.courseId);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredFiles = (activeTab === 'myFiles' ? myFiles : courseFiles).filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || file.uploadType === filter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUploadTypeLabel = (type) => {
    const labels = {
      'course_material': 'Course Material',
      'assignment_submission': 'Assignment',
      'document': 'Document',
      'general': 'General'
    };
    return labels[type] || type;
  };

  const getUploadTypeColor = (type) => {
    const colors = {
      'course_material': '#10b981',
      'assignment_submission': '#3b82f6',
      'document': '#8b5cf6',
      'general': '#6b7280'
    };
    return colors[type] || '#6b7280';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          margin: '0 0 10px 0',
          color: '#1f2937',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          📁 Instructor File Manager
        </h1>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Upload course materials, manage files, and share resources with students
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '30px'
      }}>
        {[
          { key: 'upload', label: '📤 Upload Files', icon: '📤' },
          { key: 'myFiles', label: '📁 My Files', icon: '📁' },
          { key: 'courseFiles', label: '📚 Course Files', icon: '📚' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? '#3b82f6' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#6b7280',
              border: 'none',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px 8px 0 0',
              marginRight: '4px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div>
          <form onSubmit={handleUpload}>
            {/* File Upload Section */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>📤 Upload Files</h3>
              
              {/* Drag and Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                style={{
                  border: `2px dashed ${dragActive ? '#3b82f6' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: '40px',
                  textAlign: 'center',
                  background: dragActive ? '#f0f9ff' : '#f9fafb',
                  marginBottom: '20px',
                  cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {selectedFiles.length > 0 ? '📁' : '📤'}
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>
                  {selectedFiles.length > 0 
                    ? `${selectedFiles.length} file(s) selected`
                    : 'Drop files here or click to browse'
                  }
                </p>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                  Maximum file size: {formatFileSize(getMaxFileSize('course_material', 'instructor'))}
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.zip,.rar"
                />
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Selected Files:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        background: '#f3f4f6',
                        borderRadius: '6px'
                      }}>
                        <span style={{ fontSize: '16px' }}>
                          {getFileIcon(file.name, file.type)}
                        </span>
                        <span style={{ flex: 1, color: '#374151' }}>{file.name}</span>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>
                          {formatFileSize(file.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Form */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>📝 File Details</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                    Course *
                  </label>
                  <select
                    value={uploadForm.courseId}
                    onChange={(e) => setUploadForm({...uploadForm, courseId: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                    Upload Type
                  </label>
                  <select
                    value={uploadForm.uploadType}
                    onChange={(e) => setUploadForm({...uploadForm, uploadType: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="course_material">Course Material</option>
                    <option value="document">Document</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  placeholder="Enter file title..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Enter file description..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                    Access Level
                  </label>
                  <select
                    value={uploadForm.accessLevel}
                    onChange={(e) => setUploadForm({...uploadForm, accessLevel: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="course">Course (All Students)</option>
                    <option value="instructor">Instructor Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                    Release Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={uploadForm.releaseDate}
                    onChange={(e) => setUploadForm({...uploadForm, releaseDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              style={{
                background: uploading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '16px 32px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
            </button>
          </form>
        </div>
      )}

      {/* My Files Tab */}
      {(activeTab === 'myFiles' || activeTab === 'courseFiles') && (
        <div>
          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="🔍 Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                minWidth: '200px',
                flex: 1
              }}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="all">All Files</option>
              <option value="course_material">Course Materials</option>
              <option value="document">Documents</option>
              <option value="general">General</option>
            </select>

            {activeTab === 'courseFiles' && (
              <select
                value={uploadForm.courseId}
                onChange={(e) => {
                  setUploadForm({...uploadForm, courseId: e.target.value});
                  if (e.target.value) {
                    fetchCourseFiles(e.target.value);
                  }
                }}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => {
                fetchMyFiles();
                if (uploadForm.courseId) {
                  fetchCourseFiles(uploadForm.courseId);
                }
              }}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* Files List */}
          {filteredFiles.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#6b7280',
              fontSize: '18px'
            }}>
              {searchTerm ? (
                <>
                  🔍 No files found matching "{searchTerm}"
                  <br />
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      marginTop: '16px'
                    }}
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  📁 No files found
                  <br />
                  <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                    {activeTab === 'courseFiles' && !uploadForm.courseId 
                      ? 'Select a course to view files'
                      : 'Upload your first file using the Upload tab'
                    }
                  </span>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredFiles.map((file) => (
                <div key={file._id} style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <span style={{ fontSize: '24px' }}>
                        {getFileIcon(file.originalName, file.mimeType)}
                      </span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: '0 0 4px 0',
                          color: '#1f2937',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>
                          {file.originalName}
                        </h3>
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          <span>📅 {formatDate(file.uploadedAt)}</span>
                          <span>📏 {formatFileSize(file.fileSize)}</span>
                          <span>📂 {file.course?.title || 'No Course'}</span>
                          <span>👤 {file.uploader?.firstName || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: getUploadTypeColor(file.uploadType),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {getUploadTypeLabel(file.uploadType)}
                      </span>
                      
                      <button
                        onClick={() => handleDownload(file._id, file.originalName)}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        📥 Download
                      </button>
                      
                      <button
                        onClick={() => handleDelete(file._id, file.originalName)}
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
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  
                  {file.description && (
                    <p style={{
                      margin: '8px 0 0 0',
                      color: '#6b7280',
                      fontSize: '14px',
                      fontStyle: 'italic'
                    }}>
                      "{file.description}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstructorFileManager;
