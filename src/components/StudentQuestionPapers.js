import React, { useState, useEffect } from 'react';

const StudentQuestionPapers = ({ user }) => {
  const [uploadedPapers, setUploadedPapers] = useState([]);
  const [selectedExam, setSelectedExam] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState(null);

  // Exam options
  const EXAM_OPTIONS = {
    ALL: { name: 'All Exams', icon: '📚', color: '#6366f1' },
    NEET: { name: 'NEET', icon: '🏥', color: '#ef4444', fullName: 'National Eligibility cum Entrance Test' },
    JEE_MAIN: { name: 'JEE Main', icon: '⚙️', color: '#3b82f6', fullName: 'Joint Entrance Examination Main' },
    UPSC: { name: 'UPSC', icon: '🏛️', color: '#10b981', fullName: 'Union Public Service Commission' },
    IBPS: { name: 'IBPS', icon: '🏦', color: '#8b5cf6', fullName: 'Institute of Banking Personnel Selection' },
    RRB_NTPC: { name: 'RRB NTPC', icon: '🚂', color: '#f59e0b', fullName: 'Railway Recruitment Board NTPC' },
    NDA: { name: 'NDA', icon: '🛡️', color: '#06b6d4', fullName: 'National Defence Academy' }
  };

  const YEAR_OPTIONS = ['ALL', '2025', '2024', '2023', '2022'];

  // Load uploaded papers from localStorage
  useEffect(() => {
    const savedPapers = localStorage.getItem('instructorUploadedPapers');
    if (savedPapers) {
      setUploadedPapers(JSON.parse(savedPapers));
    }
  }, []);

  // Filter papers based on selection
  const filteredPapers = uploadedPapers.filter(paper => {
    const examMatch = selectedExam === 'ALL' || paper.exam === selectedExam;
    const yearMatch = selectedYear === 'ALL' || paper.year === selectedYear;
    return examMatch && yearMatch;
  });

  // Download paper
  const downloadPaper = (paper) => {
    try {
      // Set loading state
      setDownloadingId(paper.id);

      // Check if fileContent exists and is valid
      if (!paper.fileContent) {
        alert('❌ Question paper not available for download');
        setDownloadingId(null);
        return;
      }

      // Create a blob from the file content
      if (paper.fileContent.startsWith('data:')) {
        // If it's a data URL, convert it to blob
        const response = fetch(paper.fileContent);
        response.then(res => res.blob()).then(blobData => {
          const url = window.URL.createObjectURL(blobData);
          const link = document.createElement('a');
          link.href = url;
          link.download = paper.fileName || 'question_paper';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // Show success message and clear loading
          setTimeout(() => {
            setDownloadingId(null);
            alert(`✅ Download Started!\n\nFile: ${paper.fileName}\n\nThe question paper should appear in your Downloads folder.\n\nNote: Your browser may show a download notification.`);
          }, 1000);
        }).catch(error => {
          console.error('Download error:', error);
          setDownloadingId(null);
          alert('❌ Failed to download question paper. Please try again.');
        });
      } else {
        // Direct download for other formats
        const link = document.createElement('a');
        link.href = paper.fileContent;
        link.download = paper.fileName || 'question_paper';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message and clear loading
        setTimeout(() => {
          setDownloadingId(null);
          alert(`✅ Download Started!\n\nFile: ${paper.fileName}\n\nThe question paper should appear in your Downloads folder.\n\nNote: Your browser may show a download notification.`);
        }, 1000);
      }

    } catch (error) {
      console.error('Download error:', error);
      setDownloadingId(null);
      alert('❌ Failed to download question paper. Please try again.');
    }
  };

  // Group papers by exam
  const papersByExam = filteredPapers.reduce((acc, paper) => {
    if (!acc[paper.exam]) {
      acc[paper.exam] = [];
    }
    acc[paper.exam].push(paper);
    return acc;
  }, {});

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
          📚 Instructor Uploaded Question Papers
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#64748b'
        }}>
          Access real-time question papers uploaded by your instructors
        </p>
      </div>

      {/* Filters */}
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
          gap: '1rem'
        }}>
          {/* Exam Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Filter by Exam:
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              {Object.entries(EXAM_OPTIONS).map(([key, exam]) => (
                <option key={key} value={key}>
                  {exam.icon} {exam.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Filter by Year:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              {YEAR_OPTIONS.map(year => (
                <option key={year} value={year}>
                  {year === 'ALL' ? '📅 All Years' : year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f1f5f9',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#475569'
        }}>
          📊 Showing {filteredPapers.length} question papers
          {selectedExam !== 'ALL' && ` for ${EXAM_OPTIONS[selectedExam].name}`}
          {selectedYear !== 'ALL' && ` from ${selectedYear}`}
        </div>
      </div>

      {/* Question Papers */}
      {filteredPapers.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
          <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No Question Papers Found</h3>
          <p style={{ color: '#9ca3af' }}>
            {selectedExam !== 'ALL' || selectedYear !== 'ALL' 
              ? 'Try adjusting your filters to see more papers'
              : 'Your instructors haven\'t uploaded any question papers yet'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
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
                e.currentTarget.style.borderColor = paper.examInfo.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {/* Paper Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: `linear-gradient(135deg, ${paper.examInfo.color}, ${paper.examInfo.color}dd)`,
                  color: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '1.5rem',
                  marginRight: '1rem'
                }}>
                  {paper.examInfo.icon}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    {paper.examInfo.name} {paper.year}
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    margin: 0
                  }}>
                    {paper.examInfo.fullName}
                  </p>
                </div>
              </div>

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
                  📄 {paper.fileName}
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: '#64748b'
                }}>
                  <div>📁 Size: {paper.fileSize}</div>
                  <div>📅 {new Date(paper.uploadDate).toLocaleDateString()}</div>
                  <div style={{ gridColumn: '1 / -1' }}>👨‍🏫 Uploaded by: {paper.uploadedBy}</div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => downloadPaper(paper)}
                disabled={downloadingId === paper.id}
                style={{
                  width: '100%',
                  background: downloadingId === paper.id
                    ? '#9ca3af'
                    : `linear-gradient(135deg, ${paper.examInfo.color}, ${paper.examInfo.color}dd)`,
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: downloadingId === paper.id ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: downloadingId === paper.id ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (downloadingId !== paper.id) {
                    e.target.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (downloadingId !== paper.id) {
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {downloadingId === paper.id ? (
                  <>⏳ Downloading...</>
                ) : (
                  <>📥 Download Question Paper</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {filteredPapers.length > 0 && (
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
            📊 Quick Stats
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            {Object.entries(papersByExam).map(([exam, papers]) => (
              <div key={exam} style={{
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {EXAM_OPTIONS[exam]?.icon || '📄'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                  {papers.length}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  {EXAM_OPTIONS[exam]?.name || exam} Papers
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuestionPapers;
