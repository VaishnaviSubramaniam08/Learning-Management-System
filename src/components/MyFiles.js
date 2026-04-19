import React, { useState, useEffect } from 'react';
import axios from '../api';
import { formatFileSize, getFileIcon } from '../utils/fileValidation';

const MyFiles = ({ user }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (user?.id) {
      fetchMyFiles();
    }
  }, [user, filter, sortBy]);

  const fetchMyFiles = async () => {
    try {
      setLoading(true);
      console.log('📁 My Files Debug - Fetching files for user:', user.id);
      
      const response = await axios.get('/file-upload/my-files', {
        params: {
          uploadType: filter !== 'all' ? filter : undefined,
          page: 1,
          limit: 50
        }
      });
      
      console.log('✅ My Files Debug - Files fetched:', response.data.files?.length || 0);
      setFiles(response.data || []);
    } catch (error) {
      console.error('❌ My Files Debug - Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      console.log('📥 Download Debug - Downloading file:', fileName);
      
      const response = await axios.get(`/file-upload/download/${fileId}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download Debug - File downloaded successfully');
    } catch (error) {
      console.error('❌ Download Debug - Error downloading file:', error);
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
      fetchMyFiles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      case 'oldest':
        return new Date(a.uploadedAt) - new Date(b.uploadedAt);
      case 'name':
        return a.originalName.localeCompare(b.originalName);
      case 'size':
        return b.fileSize - a.fileSize;
      default:
        return 0;
    }
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
      'assignment_submission': 'Assignment',
      'course_material': 'Course Material',
      'document': 'Document',
      'general': 'General',
      'profile_picture': 'Profile Picture'
    };
    return labels[type] || type;
  };

  const getUploadTypeColor = (type) => {
    const colors = {
      'assignment_submission': '#3b82f6',
      'course_material': '#10b981',
      'document': '#8b5cf6',
      'general': '#6b7280',
      'profile_picture': '#f59e0b'
    };
    return colors[type] || '#6b7280';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        📁 Loading your files...
      </div>
    );
  }

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
          📁 My Files
        </h1>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px'
        }}>
          View and manage all your uploaded files
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '30px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Search */}
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

        {/* Filter */}
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
          <option value="assignment_submission">Assignments</option>
          <option value="document">Documents</option>
          <option value="course_material">Course Materials</option>
          <option value="general">General</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white'
          }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A-Z</option>
          <option value="size">Largest First</option>
        </select>

        {/* Refresh Button */}
        <button
          onClick={fetchMyFiles}
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

      {/* File Count */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#0c4a6e'
      }}>
        📊 Showing {sortedFiles.length} of {files.length} files
        {searchTerm && ` (filtered by "${searchTerm}")`}
      </div>

      {/* Files List */}
      {sortedFiles.length === 0 ? (
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
              📁 No files uploaded yet
              <br />
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                Upload your first file using the File Uploads tab
              </span>
            </>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {sortedFiles.map((file) => (
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
  );
};

export default MyFiles;
