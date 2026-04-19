import React, { useState, useEffect } from 'react';

const InstructorQuestionUpload = ({ user }) => {
  const [selectedExam, setSelectedExam] = useState('NEET');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [uploadedPapers, setUploadedPapers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Exam options
  const EXAM_OPTIONS = {
    NEET: { name: 'NEET', icon: '🏥', color: '#ef4444', fullName: 'National Eligibility cum Entrance Test' },
    JEE_MAIN: { name: 'JEE Main', icon: '⚙️', color: '#3b82f6', fullName: 'Joint Entrance Examination Main' },
    UPSC: { name: 'UPSC', icon: '🏛️', color: '#10b981', fullName: 'Union Public Service Commission' },
    IBPS: { name: 'IBPS', icon: '🏦', color: '#8b5cf6', fullName: 'Institute of Banking Personnel Selection' },
    RRB_NTPC: { name: 'RRB NTPC', icon: '🚂', color: '#f59e0b', fullName: 'Railway Recruitment Board NTPC' },
    NDA: { name: 'NDA', icon: '🛡️', color: '#06b6d4', fullName: 'National Defence Academy' }
  };

  const YEAR_OPTIONS = ['2025', '2024', '2023', '2022'];

  // Load uploaded papers from localStorage
  useEffect(() => {
    const savedPapers = localStorage.getItem('instructorUploadedPapers');
    if (savedPapers) {
      setUploadedPapers(JSON.parse(savedPapers));
    }
  }, []);

  // Save papers to localStorage
  const savePapers = (papers) => {
    localStorage.setItem('instructorUploadedPapers', JSON.stringify(papers));
    setUploadedPapers(papers);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPaper = {
          id: Date.now() + Math.random(),
          exam: selectedExam,
          year: selectedYear,
          fileName: file.name,
          fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          uploadDate: new Date().toISOString(),
          uploadedBy: user?.name || 'Instructor',
          fileContent: e.target.result, // Base64 content
          fileType: file.type,
          examInfo: EXAM_OPTIONS[selectedExam]
        };

        const updatedPapers = [...uploadedPapers, newPaper];
        savePapers(updatedPapers);
      };
      reader.readAsDataURL(file);
    });

    setTimeout(() => {
      setIsUploading(false);
      alert('Question papers uploaded successfully!');
    }, 1000);
  };

  // Delete paper
  const deletePaper = (paperId) => {
    const confirmed = window.confirm('Are you sure you want to delete this question paper?');
    if (confirmed) {
      const updatedPapers = uploadedPapers.filter(paper => paper.id !== paperId);
      savePapers(updatedPapers);
    }
  };

  // Download paper
  const downloadPaper = (paper) => {
    const link = document.createElement('a');
    link.href = paper.fileContent;
    link.download = paper.fileName;
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
          📚 Upload Question Papers
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#64748b'
        }}>
          Upload real-time question papers for students to access
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
          📤 Upload New Question Paper
        </h2>

        {/* Exam Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Select Exam:
          </label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          >
            {Object.entries(EXAM_OPTIONS).map(([key, exam]) => (
              <option key={key} value={key}>
                {exam.icon} {exam.name} - {exam.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Select Year:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          >
            {YEAR_OPTIONS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
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
            Upload Question Paper (PDF, DOC, DOCX, JPG, PNG):
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
            📤 Uploading question papers...
          </div>
        )}
      </div>

      {/* Uploaded Papers List */}
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
          📋 Uploaded Question Papers ({uploadedPapers.length})
        </h2>

        {uploadedPapers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <p>No question papers uploaded yet</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {uploadedPapers.map((paper) => (
              <div
                key={paper.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = paper.examInfo.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                {/* Paper Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>
                    {paper.examInfo.icon}
                  </span>
                  <div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: 0
                    }}>
                      {paper.examInfo.name} {paper.year}
                    </h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      margin: 0
                    }}>
                      {paper.fileName}
                    </p>
                  </div>
                </div>

                {/* Paper Info */}
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.25rem 0' }}>
                    📁 Size: {paper.fileSize}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.25rem 0' }}>
                    📅 Uploaded: {new Date(paper.uploadDate).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.25rem 0' }}>
                    👨‍🏫 By: {paper.uploadedBy}
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => downloadPaper(paper)}
                    style={{
                      flex: 1,
                      background: paper.examInfo.color,
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
                    onClick={() => deletePaper(paper.id)}
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

export default InstructorQuestionUpload;
