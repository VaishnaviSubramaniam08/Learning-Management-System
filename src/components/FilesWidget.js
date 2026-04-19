import React, { useState, useEffect } from 'react';
import axios from '../api';
import { formatFileSize, getFileIcon } from '../utils/fileValidation';

const FilesWidget = ({ userId, onNavigateToFiles }) => {
  const [recentFiles, setRecentFiles] = useState([]);
  const [fileStats, setFileStats] = useState({
    total: 0,
    totalSize: 0,
    byType: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchRecentFiles();
    }
  }, [userId]);

  const fetchRecentFiles = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('/file-upload/my-files', {
        params: {
          page: 1,
          limit: 5 // Get only recent 5 files
        }
      });
      
      const files = response.data || [];
      setRecentFiles(files);
      
      // Calculate stats
      const stats = {
        total: files.length,
        totalSize: files.reduce((sum, file) => sum + file.fileSize, 0),
        byType: {}
      };
      
      files.forEach(file => {
        const type = file.uploadType || 'general';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });
      
      setFileStats(stats);
    } catch (error) {
      console.error('Error fetching recent files:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
      'general': 'General'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{ color: '#6b7280' }}>📁 Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ margin: 0, color: '#374151' }}>📁 My Files</h3>
        <button
          onClick={onNavigateToFiles}
          style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          View All
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>📊</div>
          <p style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 'bold', color: '#0c4a6e' }}>
            {fileStats.total}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#0369a1' }}>total files</p>
        </div>

        <div style={{
          background: '#f0fdf4',
          border: '1px solid #22c55e',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>💾</div>
          <p style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 'bold', color: '#14532d' }}>
            {formatFileSize(fileStats.totalSize)}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#166534' }}>storage used</p>
        </div>

        <div style={{
          background: '#fefce8',
          border: '1px solid #eab308',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>📈</div>
          <p style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 'bold', color: '#713f12' }}>
            {Object.keys(fileStats.byType).length}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#a16207' }}>file types</p>
        </div>
      </div>

      {/* Recent Files */}
      {recentFiles.length > 0 ? (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>📄 Recent Files</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentFiles.slice(0, 3).map((file, index) => (
              <div key={index} style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{ fontSize: '16px' }}>
                    {getFileIcon(file.originalName, file.mimeType)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      margin: '0 0 4px 0', 
                      fontWeight: 'bold', 
                      color: '#374151', 
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {file.originalName}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      {formatDate(file.uploadedAt)} • {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                </div>
                <div style={{
                  background: '#e5e7eb',
                  color: '#374151',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  {getUploadTypeLabel(file.uploadType)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>No files yet</h4>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>
            Upload your first file to get started
          </p>
          <button
            onClick={() => onNavigateToFiles && onNavigateToFiles('fileUpload')}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📤 Upload Files
          </button>
        </div>
      )}

      {/* File Types Breakdown */}
      {Object.keys(fileStats.byType).length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>📊 File Types</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(fileStats.byType).map(([type, count]) => (
              <div key={type} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 12px',
                background: '#f3f4f6',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                <span style={{ color: '#374151' }}>{getUploadTypeLabel(type)}</span>
                <span style={{ 
                  background: '#6366f1',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesWidget;
