import React, { useState, useEffect } from 'react';

const InstructorStudyMaterialUpload = ({ user }) => {
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedCategory, setSelectedCategory] = useState('Notes');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [uploadedMaterials, setUploadedMaterials] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Subject options
  const SUBJECT_OPTIONS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 
    'Geography', 'Economics', 'Political Science', 'Computer Science', 
    'Accountancy', 'Business Studies', 'Psychology', 'Sociology'
  ];

  // Category options
  const CATEGORY_OPTIONS = {
    'Notes': { icon: '📝', color: '#3b82f6', description: 'Study notes and summaries' },
    'Assignments': { icon: '📋', color: '#ef4444', description: 'Practice assignments' },
    'Reference Materials': { icon: '📚', color: '#10b981', description: 'Reference books and materials' },
    'Presentations': { icon: '📊', color: '#f59e0b', description: 'PowerPoint presentations' },
    'Videos': { icon: '🎥', color: '#8b5cf6', description: 'Educational videos' },
    'Worksheets': { icon: '📄', color: '#06b6d4', description: 'Practice worksheets' },
    'Lab Manuals': { icon: '🔬', color: '#84cc16', description: 'Laboratory manuals' },
    'Sample Papers': { icon: '📃', color: '#f97316', description: 'Sample question papers' }
  };

  // Load uploaded materials from localStorage
  useEffect(() => {
    const savedMaterials = localStorage.getItem('instructorStudyMaterials');
    if (savedMaterials) {
      setUploadedMaterials(JSON.parse(savedMaterials));
    }
  }, []);

  // Save materials to localStorage
  const saveMaterials = (materials) => {
    localStorage.setItem('instructorStudyMaterials', JSON.stringify(materials));
    setUploadedMaterials(materials);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (!materialTitle.trim()) {
      alert('Please enter a title for the study material');
      return;
    }

    setIsUploading(true);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newMaterial = {
          id: Date.now() + Math.random(),
          title: materialTitle,
          description: materialDescription,
          subject: selectedSubject,
          category: selectedCategory,
          fileName: file.name,
          fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          uploadDate: new Date().toISOString(),
          uploadedBy: user?.name || 'Instructor',
          fileContent: e.target.result, // Base64 content
          fileType: file.type,
          categoryInfo: CATEGORY_OPTIONS[selectedCategory]
        };

        const updatedMaterials = [...uploadedMaterials, newMaterial];
        saveMaterials(updatedMaterials);
      };
      reader.readAsDataURL(file);
    });

    setTimeout(() => {
      setIsUploading(false);
      setMaterialTitle('');
      setMaterialDescription('');
      alert('Study materials uploaded successfully!');
    }, 1000);
  };

  // Delete material
  const deleteMaterial = (materialId) => {
    const confirmed = window.confirm('Are you sure you want to delete this study material?');
    if (confirmed) {
      const updatedMaterials = uploadedMaterials.filter(material => material.id !== materialId);
      saveMaterials(updatedMaterials);
    }
  };

  // Download material
  const downloadMaterial = (material) => {
    const link = document.createElement('a');
    link.href = material.fileContent;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh' 
    }}>
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
          📚 Upload Study Materials
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#64748b'
        }}>
          Share notes, assignments, presentations, and other study materials with students
        </p>
      </div>

      {/* Upload Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '1.5rem'
        }}>
          📤 Upload New Study Material
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Title */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Material Title *
            </label>
            <input
              type="text"
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              placeholder="Enter title for the study material"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Subject */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              {SUBJECT_OPTIONS.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              {Object.entries(CATEGORY_OPTIONS).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {key} - {category.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Description (Optional)
          </label>
          <textarea
            value={materialDescription}
            onChange={(e) => setMaterialDescription(e.target.value)}
            placeholder="Enter description for the study material"
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Upload Files (PDF, DOC, PPT, Images, Videos, etc.)
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.mp3,.txt,.xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isUploading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px dashed #e5e7eb',
              fontSize: '16px',
              backgroundColor: isUploading ? '#f3f4f6' : 'white',
              cursor: isUploading ? 'not-allowed' : 'pointer'
            }}
          />
        </div>

        {isUploading && (
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            background: '#dbeafe',
            borderRadius: '8px',
            color: '#1e40af'
          }}>
            📤 Uploading study materials...
          </div>
        )}
      </div>

      {/* Uploaded Materials List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '1.5rem'
        }}>
          📋 Uploaded Study Materials ({uploadedMaterials.length})
        </h2>

        {uploadedMaterials.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <p>No study materials uploaded yet</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {uploadedMaterials.map((material) => (
              <div
                key={material.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = material.categoryInfo.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
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
                    background: material.categoryInfo.color,
                    color: 'white',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '1.2rem',
                    marginRight: '0.75rem'
                  }}>
                    {material.categoryInfo.icon}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: 0
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
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    marginBottom: '1rem',
                    lineHeight: '1.4'
                  }}>
                    {material.description}
                  </p>
                )}

                {/* File Info */}
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.25rem 0' }}>
                    📁 {material.fileName}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.25rem 0' }}>
                    📊 Size: {material.fileSize}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.25rem 0' }}>
                    📅 {new Date(material.uploadDate).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.25rem 0' }}>
                    👨‍🏫 {material.uploadedBy}
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => downloadMaterial(material)}
                    style={{
                      flex: 1,
                      background: material.categoryInfo.color,
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={() => deleteMaterial(material.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorStudyMaterialUpload;
