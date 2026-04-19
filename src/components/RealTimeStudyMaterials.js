import React, { useState } from 'react';
import StudentQuestionPapers from './StudentQuestionPapers';
import StudentStudyMaterials from './StudentStudyMaterials';

const RealTimeStudyMaterials = ({ user }) => {
  const [activeTab, setActiveTab] = useState('instructorMaterials');

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📚 Study Materials</h2>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('instructorMaterials')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'instructorMaterials' ? '#3b82f6' : 'transparent',
            color: activeTab === 'instructorMaterials' ? 'white' : '#64748b',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            marginRight: '8px',
            transition: 'all 0.2s'
          }}
        >
          📖 Study Materials
        </button>
        <button
          onClick={() => setActiveTab('questionPapers')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'questionPapers' ? '#3b82f6' : 'transparent',
            color: activeTab === 'questionPapers' ? 'white' : '#64748b',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          📄 Question Papers
        </button>
      </div>

      {/* Tab Content */}
      {/* Instructor Study Materials Tab */}
      {activeTab === 'instructorMaterials' && (
        <StudentStudyMaterials user={user} />
      )}

      {/* Question Papers Tab */}
      {activeTab === 'questionPapers' && (
        <StudentQuestionPapers user={user} />
      )}
    </div>
  );
};

export default RealTimeStudyMaterials;

  // Socket.io connection
  useEffect(() => {
    if (user) {
      socketRef.current = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');
      
      // Join user room for notifications
      socketRef.current.emit('join_user_room', user.id);
      
      // Join exam category rooms based on user preferences
      if (filters.examCategory) {
        socketRef.current.emit('join_exam_room', filters.examCategory);
      }
      
      // Listen for real-time events
      socketRef.current.on('new_study_material', (data) => {
        setRealTimeUpdates(prev => [data, ...prev.slice(0, 4)]); // Keep last 5 updates
        setNotifications(prev => [
          {
            id: Date.now(),
            type: 'success',
            message: `New ${data.studyMaterial.contentType} material: ${data.studyMaterial.title}`,
            timestamp: new Date()
          },
          ...prev.slice(0, 9)
        ]);
        
        // Add to materials list if it matches current filters
        if (!filters.examCategory || data.studyMaterial.examCategory === filters.examCategory) {
          setMaterials(prev => [data.studyMaterial, ...prev]);
        }
      });
      
      // Download progress events
      socketRef.current.on('download_started', (data) => {
        setDownloadProgress(prev => ({
          ...prev,
          [data.downloadId]: { ...data, percentage: 0, status: 'downloading' }
        }));
      });
      
      socketRef.current.on('download_progress_update', (data) => {
        setDownloadProgress(prev => ({
          ...prev,
          [data.downloadId]: { ...prev[data.downloadId], ...data }
        }));
      });
      
      socketRef.current.on('download_completed', (data) => {
        setDownloadProgress(prev => ({
          ...prev,
          [data.downloadId]: { ...prev[data.downloadId], percentage: 100, status: 'completed' }
        }));
        
        setTimeout(() => {
          setDownloadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[data.downloadId];
            return newProgress;
          });
        }, 3000);
      });
      
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, filters.examCategory]);

  // Fetch study materials
  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(`/study-materials?${queryParams}`);
      setMaterials(response.data.studyMaterials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'error',
          message: 'Failed to fetch study materials',
          timestamp: new Date()
        },
        ...prev.slice(0, 9)
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Join new exam room if exam category changed
    if (key === 'examCategory' && value && socketRef.current) {
      socketRef.current.emit('join_exam_room', value);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Auto-detect content type based on file extension
      const extension = file.name.split('.').pop().toLowerCase();
      const typeMap = {
        'pdf': 'PDF',
        'doc': 'DOC',
        'docx': 'DOC',
        'ppt': 'PPT',
        'pptx': 'PPT',
        'mp4': 'Video',
        'avi': 'Video',
        'mp3': 'Audio',
        'wav': 'Audio',
        'jpg': 'Image',
        'jpeg': 'Image',
        'png': 'Image'
      };
      
      if (typeMap[extension]) {
        setUploadForm(prev => ({ ...prev, contentType: typeMap[extension] }));
      }
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      Object.entries(uploadForm).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      const response = await axios.post('/study-materials/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'success',
          message: 'Study material uploaded successfully!',
          timestamp: new Date()
        },
        ...prev.slice(0, 9)
      ]);
      
      // Reset form
      setUploadForm({
        title: '',
        description: '',
        examCategory: 'JEE',
        subject: '',
        topic: '',
        subtopic: '',
        contentType: 'PDF',
        difficulty: 'Intermediate',
        tags: '',
        accessLevel: 'public'
      });
      setSelectedFile(null);
      setShowUploadForm(false);
      
      // Refresh materials list
      fetchMaterials();
      
    } catch (error) {
      console.error('Upload error:', error);
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'error',
          message: error.response?.data?.message || 'Upload failed',
          timestamp: new Date()
        },
        ...prev.slice(0, 9)
      ]);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      // Emit download start event
      if (socketRef.current) {
        socketRef.current.emit('start_download', {
          userId: user.id,
          studyMaterialId: material._id,
          fileName: material.fileName,
          fileSize: material.fileSize
        });
        
        // Record view activity
        socketRef.current.emit('view_material', {
          userId: user.id,
          studyMaterialId: material._id
        });
      }
      
      // Trigger download
      const downloadUrl = material.isGridFS 
        ? `/api/study-materials/download/gridfs/${material.gridFSId}`
        : `/api/study-materials/download/${material._id}`;
      
      window.open(downloadUrl, '_blank');
      
    } catch (error) {
      console.error('Download error:', error);
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'error',
          message: 'Download failed',
          timestamp: new Date()
        },
        ...prev.slice(0, 9)
      ]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📚 Study Materials</h2>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('instructorMaterials')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'instructorMaterials' ? '#3b82f6' : 'transparent',
            color: activeTab === 'instructorMaterials' ? 'white' : '#64748b',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            marginRight: '8px',
            transition: 'all 0.2s'
          }}
        >
          📖 Study Materials
        </button>
        <button
          onClick={() => setActiveTab('questionPapers')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'questionPapers' ? '#3b82f6' : 'transparent',
            color: activeTab === 'questionPapers' ? 'white' : '#64748b',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          📄 Question Papers
        </button>
      </div>

      {/* Tab Content */}
      {/* Instructor Study Materials Tab */}
      {activeTab === 'instructorMaterials' && (
        <StudentStudyMaterials user={user} />
      )}

      {/* Question Papers Tab */}
      {activeTab === 'questionPapers' && (
        <StudentQuestionPapers user={user} />
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RealTimeStudyMaterials;
            
            <textarea
              placeholder="Description *"
              value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              required
              rows="3"
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                marginBottom: '15px',
                resize: 'vertical'
              }}
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Subject *"
                value={uploadForm.subject}
                onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                placeholder="Topic *"
                value={uploadForm.topic}
                onChange={(e) => setUploadForm(prev => ({ ...prev, topic: e.target.value }))}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                placeholder="Subtopic (optional)"
                value={uploadForm.subtopic}
                onChange={(e) => setUploadForm(prev => ({ ...prev, subtopic: e.target.value }))}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <select
                value={uploadForm.contentType}
                onChange={(e) => setUploadForm(prev => ({ ...prev, contentType: e.target.value }))}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="PDF">PDF</option>
                <option value="Video">Video</option>
                <option value="PPT">PowerPoint</option>
                <option value="DOC">Document</option>
                <option value="Audio">Audio</option>
                <option value="Image">Image</option>
                <option value="Interactive">Interactive</option>
              </select>
              <select
                value={uploadForm.difficulty}
                onChange={(e) => setUploadForm(prev => ({ ...prev, difficulty: e.target.value }))}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select
                value={uploadForm.accessLevel}
                onChange={(e) => setUploadForm(prev => ({ ...prev, accessLevel: e.target.value }))}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="public">Public</option>
                <option value="premium">Premium</option>
                <option value="course_specific">Course Specific</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={uploadForm.tags}
              onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                marginBottom: '15px'
              }}
            />
            
            <div style={{ marginBottom: '15px' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mp3,.wav,.jpg,.jpeg,.png,.gif"
                style={{ marginBottom: '10px' }}
              />
              {selectedFile && (
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                style={{
                  background: uploading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Material'}
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '15px' }}>🔍 Filter Materials</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <select
            value={filters.examCategory}
            onChange={(e) => handleFilterChange('examCategory', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">All Exam Categories</option>
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="GATE">GATE</option>
            <option value="UPSC">UPSC</option>
            <option value="SSC">SSC</option>
            <option value="Banking">Banking</option>
            <option value="Railway">Railway</option>
            <option value="Defense">Defense</option>
            <option value="State_PSC">State PSC</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="text"
            placeholder="Subject"
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />

          <input
            type="text"
            placeholder="Topic"
            value={filters.topic}
            onChange={(e) => handleFilterChange('topic', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />

          <select
            value={filters.contentType}
            onChange={(e) => handleFilterChange('contentType', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">All Content Types</option>
            <option value="PDF">PDF</option>
            <option value="Video">Video</option>
            <option value="PPT">PowerPoint</option>
            <option value="DOC">Document</option>
            <option value="Audio">Audio</option>
            <option value="Image">Image</option>
            <option value="Interactive">Interactive</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">All Difficulty Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <input
            type="text"
            placeholder="Search materials..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      {/* Download Progress */}
      {Object.keys(downloadProgress).length > 0 && (
        <div style={{
          background: '#e3f2fd',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #2196f3'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📥 Download Progress</h4>
          {Object.entries(downloadProgress).map(([downloadId, progress]) => (
            <div key={downloadId} style={{
              background: 'white',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '5px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{progress.fileName}</span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {progress.percentage}% ({formatFileSize(progress.downloadedBytes || 0)} / {formatFileSize(progress.fileSize)})
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: '#e0e0e0',
                borderRadius: '3px',
                marginTop: '5px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress.percentage}%`,
                  height: '100%',
                  background: progress.status === 'completed' ? '#4caf50' : '#2196f3',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Materials List */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6' }}>
          <h3 style={{ margin: 0 }}>📖 Study Materials ({materials.length})</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Loading study materials...</p>
          </div>
        ) : materials.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>No study materials found matching your criteria.</p>
            <p>Try adjusting your filters or upload new materials!</p>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gap: '15px' }}>
              {materials.map((material) => (
                <div key={material._id} style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '15px',
                  background: '#fafafa',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{material.title}</h4>
                      <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                        {material.description}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                        <span style={{
                          background: '#e3f2fd',
                          color: '#1976d2',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {material.examCategory}
                        </span>
                        <span style={{
                          background: '#f3e5f5',
                          color: '#7b1fa2',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {material.subject}
                        </span>
                        <span style={{
                          background: '#e8f5e8',
                          color: '#388e3c',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {material.topic}
                        </span>
                        <span style={{
                          background: '#fff3e0',
                          color: '#f57c00',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {material.contentType}
                        </span>
                        <span style={{
                          background: '#fce4ec',
                          color: '#c2185b',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {material.difficulty}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#666' }}>
                        <span>📥 {material.downloadCount} downloads</span>
                        <span>👁️ {material.viewCount} views</span>
                        <span>⭐ {material.rating.toFixed(1)} ({material.ratingCount} ratings)</span>
                        <span>📁 {formatFileSize(material.fileSize)}</span>
                        <span>🕒 {formatTimeAgo(material.createdAt)}</span>
                      </div>

                      {material.uploader && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                          Uploaded by: <strong>{material.uploader.name}</strong> ({material.uploader.role})
                        </div>
                      )}

                      {material.tags && material.tags.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          {material.tags.map((tag, index) => (
                            <span key={index} style={{
                              background: '#f5f5f5',
                              color: '#666',
                              padding: '1px 6px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              marginRight: '4px'
                            }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ marginLeft: '15px' }}>
                      <button
                        onClick={() => handleDownload(material)}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#218838'}
                        onMouseLeave={(e) => e.target.style.background = '#28a745'}
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
        </div>
      )}

      {/* Instructor Study Materials Tab */}
      {activeTab === 'instructorMaterials' && (
        <StudentStudyMaterials user={user} />
      )}

      {/* Question Papers Tab */}
      {activeTab === 'questionPapers' && (
        <StudentQuestionPapers user={user} />
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RealTimeStudyMaterials;
