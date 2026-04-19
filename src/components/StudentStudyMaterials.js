import React, { useState, useEffect } from 'react';

const StudentStudyMaterials = ({ user, onBack }) => {
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // Subject options
  const SUBJECT_OPTIONS = [
    'ALL', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 
    'Geography', 'Economics', 'Political Science', 'Computer Science', 
    'Accountancy', 'Business Studies', 'Psychology', 'Sociology'
  ];

  // Category options
  const CATEGORY_OPTIONS = {
    ALL: { icon: '📚', color: '#6366f1', description: 'All categories' },
    Notes: { icon: '📝', color: '#3b82f6', description: 'Study notes and summaries' },
    Assignments: { icon: '📋', color: '#ef4444', description: 'Practice assignments' },
    'Reference Materials': { icon: '📚', color: '#10b981', description: 'Reference books and materials' },
    Presentations: { icon: '📊', color: '#f59e0b', description: 'PowerPoint presentations' },
    Videos: { icon: '🎥', color: '#8b5cf6', description: 'Educational videos' },
    Worksheets: { icon: '📄', color: '#06b6d4', description: 'Practice worksheets' },
    'Lab Manuals': { icon: '🔬', color: '#84cc16', description: 'Laboratory manuals' },
    'Sample Papers': { icon: '📃', color: '#f97316', description: 'Sample question papers' }
  };

  // Load study materials from localStorage
  useEffect(() => {
    const savedMaterials = localStorage.getItem('instructorStudyMaterials');
    if (savedMaterials) {
      setStudyMaterials(JSON.parse(savedMaterials));
    }
  }, []);

  // Filter materials based on selection
  const filteredMaterials = studyMaterials.filter(material => {
    const subjectMatch = selectedSubject === 'ALL' || material.subject === selectedSubject;
    const categoryMatch = selectedCategory === 'ALL' || material.category === selectedCategory;
    const searchMatch = searchTerm === '' || 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return subjectMatch && categoryMatch && searchMatch;
  });

  // Download material
  const downloadMaterial = (material) => {
    try {
      // Set loading state
      setDownloadingId(material.id);

      // Check if fileContent exists and is valid
      if (!material.fileContent) {
        alert('❌ File content not available for download');
        setDownloadingId(null);
        return;
      }

      // Create a blob from the file content
      let blob;
      if (material.fileContent.startsWith('data:')) {
        // If it's a data URL, convert it to blob
        const response = fetch(material.fileContent);
        response.then(res => res.blob()).then(blobData => {
          const url = window.URL.createObjectURL(blobData);
          const link = document.createElement('a');
          link.href = url;
          link.download = material.fileName || 'download';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }).catch(error => {
          console.error('Download error:', error);
          alert('Failed to download file. Please try again.');
        });
      } else {
        // Direct download for other formats
        const link = document.createElement('a');
        link.href = material.fileContent;
        link.download = material.fileName || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Show success message
      console.log('Download started for:', material.fileName);

      // Clear loading state and show feedback
      setTimeout(() => {
        setDownloadingId(null);
        alert(`✅ Download Started!\n\nFile: ${material.fileName}\n\nThe file should appear in your Downloads folder.\n\nNote: Your browser may show a download notification.`);
      }, 1000);

    } catch (error) {
      console.error('Download error:', error);
      setDownloadingId(null);
      alert('❌ Failed to download file. Please try again.');
    }
  };

  // Group materials by subject
  const materialsBySubject = filteredMaterials.reduce((acc, material) => {
    if (!acc[material.subject]) {
      acc[material.subject] = [];
    }
    acc[material.subject].push(material);
    return acc;
  }, {});

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#374151',
            border: '2px solid rgba(99, 102, 241, 0.3)',
            fontSize: '1rem',
            fontWeight: 'bold',
            padding: '12px 20px',
            borderRadius: '25px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            zIndex: 1000
          }}
        >
          ← Back to Hub
        </button>
      )}
      
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '1rem'
        }}>
          📚 Study Materials Library
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#64748b'
        }}>
          Access notes, assignments, presentations, and other study materials shared by your instructors
        </p>
      </div>

      {/* Filters and Search */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              🔍 Search Materials:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description, or subject..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Subject Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              📖 Filter by Subject:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              {SUBJECT_OPTIONS.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'ALL' ? '📚 All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              🏷️ Filter by Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              {Object.entries(CATEGORY_OPTIONS).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {key}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div style={{
          padding: '0.75rem',
          background: '#f1f5f9',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#475569'
        }}>
          📊 Showing {filteredMaterials.length} study materials
          {selectedSubject !== 'ALL' && ` in ${selectedSubject}`}
          {selectedCategory !== 'ALL' && ` • ${selectedCategory}`}
          {searchTerm && ` • Search: "${searchTerm}"`}
        </div>
      </div>

      {/* Study Materials */}
      {filteredMaterials.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No Study Materials Found</h3>
          <p style={{ color: '#9ca3af' }}>
            {searchTerm || selectedSubject !== 'ALL' || selectedCategory !== 'ALL' 
              ? 'Try adjusting your filters or search terms'
              : 'Your instructors haven\'t uploaded any study materials yet'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = material.categoryInfo.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {/* Material Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: `linear-gradient(135deg, ${material.categoryInfo.color}, ${material.categoryInfo.color}dd)`,
                  color: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '1.5rem',
                  marginRight: '1rem'
                }}>
                  {material.categoryInfo.icon}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    {material.title}
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    margin: 0
                  }}>
                    {material.subject} • {material.category}
                  </p>
                </div>
              </div>

              {/* Description */}
              {material.description && (
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {material.description}
                  </p>
                </div>
              )}

              {/* File Info */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  📄 {material.fileName}
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: '#64748b'
                }}>
                  <div>📁 Size: {material.fileSize}</div>
                  <div>📅 {new Date(material.uploadDate).toLocaleDateString()}</div>
                  <div style={{ gridColumn: '1 / -1' }}>👨‍🏫 Shared by: {material.uploadedBy}</div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => downloadMaterial(material)}
                disabled={downloadingId === material.id}
                style={{
                  width: '100%',
                  background: downloadingId === material.id
                    ? '#9ca3af'
                    : `linear-gradient(135deg, ${material.categoryInfo.color}, ${material.categoryInfo.color}dd)`,
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: downloadingId === material.id ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: downloadingId === material.id ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (downloadingId !== material.id) {
                    e.target.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (downloadingId !== material.id) {
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {downloadingId === material.id ? (
                  <>⏳ Downloading...</>
                ) : (
                  <>📥 Download Study Material</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {filteredMaterials.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          marginTop: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '1rem'
          }}>
            📊 Materials by Subject
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            {Object.entries(materialsBySubject).map(([subject, materials]) => (
              <div key={subject} style={{
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📚</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                  {materials.length}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  {subject}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStudyMaterials;
