import React, { useState, useEffect } from 'react';
import axios from '../api';
import { validateFiles, formatFileSize, getFileIcon, createValidationErrorMessage } from '../utils/fileValidation';

const AssignmentManager = ({ user }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submissionText, setSubmissionText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');

  useEffect(() => {
    if (user?.id) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/courses/student/${user.id}/enrollments`);
      setEnrollments(response.data);
      
      // Fetch assignments for all enrolled courses
      const allAssignments = [];
      for (const enrollment of response.data) {
        try {
          const assignmentResponse = await axios.get(`/assignments/course/${enrollment.course._id}`);
          allAssignments.push(...assignmentResponse.data);
        } catch (error) {
          console.error('Error fetching assignments for course:', enrollment.course._id, error);
        }
      }
      
      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    // Validate files before setting them
    const validationResult = validateFiles(
      files,
      'assignment_submission',
      user?.role || 'student',
      selectedAssignment?.maxFiles || 5
    );

    if (!validationResult.isValid) {
      const errorMessage = createValidationErrorMessage(validationResult);
      alert(`File validation failed:\n\n${errorMessage}`);

      // Only set valid files if any exist
      if (validationResult.validFiles.length > 0) {
        const validFiles = validationResult.validFiles.map(f => f.file);
        setSubmissionFiles(validFiles);
        alert(`${validationResult.validFiles.length} valid files selected. ${validationResult.invalidFiles.length} files were rejected.`);
      } else {
        setSubmissionFiles([]);
      }
      return;
    }

    setSubmissionFiles(files);
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (submissionFiles.length === 0 && !submissionText.trim()) {
      alert('Please select files or enter submission text');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      submissionFiles.forEach(file => {
        formData.append('files', file);
      });
      
      if (submissionText.trim()) {
        formData.append('submissionText', submissionText);
      }

      const response = await axios.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Assignment submitted successfully!');
      setSubmissionFiles([]);
      setSubmissionText('');
      setSelectedAssignment(null);
      
      // Refresh assignments to update submission status
      fetchEnrollments();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
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

  const getStatusColor = (assignment) => {
    if (assignment.isSubmitted) {
      if (assignment.grade) return '#10b981'; // Green for graded
      return '#3b82f6'; // Blue for submitted
    }
    
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (now > dueDate) return '#ef4444'; // Red for overdue
    if (dueDate - now < 24 * 60 * 60 * 1000) return '#f59e0b'; // Orange for due soon
    return '#6b7280'; // Gray for normal
  };

  const getStatusText = (assignment) => {
    if (assignment.isSubmitted) {
      if (assignment.grade) return `Graded (${assignment.grade.letterGrade})`;
      return 'Submitted';
    }
    
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (now > dueDate) return 'Overdue';
    if (dueDate - now < 24 * 60 * 60 * 1000) return 'Due Soon';
    return 'Not Submitted';
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
        📚 Loading assignments...
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
          📚 Assignment Manager
        </h1>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px'
        }}>
          View and submit assignments for your enrolled courses
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '30px'
      }}>
        <button
          onClick={() => setActiveTab('assignments')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'assignments' ? '#3b82f6' : 'transparent',
            color: activeTab === 'assignments' ? 'white' : '#6b7280',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          📋 All Assignments
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'submitted' ? '#3b82f6' : 'transparent',
            color: activeTab === 'submitted' ? 'white' : '#6b7280',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            marginLeft: '8px'
          }}
        >
          ✅ Submitted
        </button>
      </div>

      {/* Assignment List */}
      {activeTab === 'assignments' && (
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {assignments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#6b7280',
              fontSize: '18px'
            }}>
              📝 No assignments found. Check back later!
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment._id} style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      color: '#1f2937',
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      {assignment.title}
                    </h3>
                    <p style={{
                      margin: '0 0 8px 0',
                      color: '#6b7280',
                      fontSize: '14px'
                    }}>
                      Course: {assignment.course?.title} • Instructor: {assignment.instructor?.firstName} {assignment.instructor?.lastName}
                    </p>
                    <p style={{
                      margin: '0 0 16px 0',
                      color: '#374151',
                      fontSize: '16px',
                      lineHeight: '1.5'
                    }}>
                      {assignment.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '20px',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <span>📅 Due: {formatDate(assignment.dueDate)}</span>
                      <span>🎯 Points: {assignment.maxPoints}</span>
                      <span>📎 Max Files: {assignment.maxFiles}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: getStatusColor(assignment),
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '12px'
                    }}>
                      {getStatusText(assignment)}
                    </div>
                    {!assignment.isSubmitted && (
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        📤 Submit
                      </button>
                    )}
                    {assignment.isSubmitted && assignment.grade && (
                      <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        color: '#0c4a6e'
                      }}>
                        Grade: {assignment.grade.points}/{assignment.maxPoints} ({assignment.grade.percentage.toFixed(1)}%)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Submitted Assignments */}
      {activeTab === 'submitted' && (
        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {assignments.filter(a => a.isSubmitted).length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#6b7280',
              fontSize: '18px'
            }}>
              📝 No submitted assignments yet.
            </div>
          ) : (
            assignments.filter(a => a.isSubmitted).map((assignment) => (
              <div key={assignment._id} style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
                      {assignment.title}
                    </h3>
                    <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                      Submitted: {assignment.submission ? formatDate(assignment.submission.submittedAt) : 'N/A'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {assignment.grade ? (
                      <div style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        {assignment.grade.letterGrade} ({assignment.grade.percentage.toFixed(1)}%)
                      </div>
                    ) : (
                      <div style={{
                        background: '#f59e0b',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        Pending Grade
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
              Submit Assignment: {selectedAssignment.title}
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#374151'
              }}>
                📎 Upload Files (Max {selectedAssignment.maxFiles} files)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
              {submissionFiles.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                    Selected files:
                  </p>
                  {submissionFiles.map((file, index) => (
                    <div key={index} style={{
                      background: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '4px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{getFileIcon(file.name, file.type)}</span>
                        <span>{file.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          {formatFileSize(file.size)}
                        </span>
                        <button
                          onClick={() => {
                            const newFiles = submissionFiles.filter((_, i) => i !== index);
                            setSubmissionFiles(newFiles);
                          }}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#374151'
              }}>
                📝 Submission Text (Optional)
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Enter any additional comments or explanations..."
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  resize: 'vertical',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setSubmissionFiles([]);
                  setSubmissionText('');
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitAssignment(selectedAssignment._id)}
                disabled={uploading}
                style={{
                  background: uploading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {uploading ? '⏳ Submitting...' : '📤 Submit Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManager;

// Instructor Assignment Management Component
export const InstructorAssignmentManager = ({ user }) => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxPoints: 100,
    maxFiles: 5,
    instructions: '',
    allowedFileTypes: ['pdf', 'doc', 'docx']
  });

  useEffect(() => {
    if (user?.id) {
      fetchInstructorData();
    }
  }, [user]);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);

      // Fetch instructor's courses
      const coursesResponse = await axios.get(`/courses/instructor/${user.id}`);
      setCourses(coursesResponse.data);

      // Fetch assignments for all courses
      const allAssignments = [];
      for (const course of coursesResponse.data) {
        try {
          const assignmentResponse = await axios.get(`/assignments/course/${course._id}`);
          allAssignments.push(...assignmentResponse.data);
        } catch (error) {
          console.error('Error fetching assignments for course:', course._id, error);
        }
      }

      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error fetching instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const response = await axios.post('/assignments', newAssignment);
      alert('Assignment created successfully!');
      setShowCreateForm(false);
      setNewAssignment({
        title: '',
        description: '',
        courseId: '',
        dueDate: '',
        maxPoints: 100,
        maxFiles: 5,
        instructions: '',
        allowedFileTypes: ['pdf', 'doc', 'docx']
      });
      fetchInstructorData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await axios.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(response.data);
      setSelectedAssignment(assignmentId);
      setActiveTab('submissions');
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleGradeSubmission = async (submissionId, grade) => {
    try {
      await axios.post(`/assignments/submission/${submissionId}/grade`, grade);
      alert('Submission graded successfully!');
      fetchSubmissions(selectedAssignment);
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Failed to grade submission');
    }
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
        📚 Loading assignments...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{
            margin: '0 0 10px 0',
            color: '#1f2937',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            📚 Assignment Management
          </h1>
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Create and manage assignments for your courses
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ➕ Create Assignment
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '30px'
      }}>
        <button
          onClick={() => setActiveTab('assignments')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'assignments' ? '#3b82f6' : 'transparent',
            color: activeTab === 'assignments' ? 'white' : '#6b7280',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          📋 My Assignments
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'submissions' ? '#3b82f6' : 'transparent',
            color: activeTab === 'submissions' ? 'white' : '#6b7280',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            marginLeft: '8px'
          }}
        >
          📝 Submissions
        </button>
      </div>

      {/* Assignment List */}
      {activeTab === 'assignments' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {assignments.map((assignment) => (
            <div key={assignment._id} style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '20px' }}>
                    {assignment.title}
                  </h3>
                  <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
                    Course: {assignment.course?.title}
                  </p>
                  <p style={{ margin: '0 0 16px 0', color: '#374151' }}>
                    {assignment.description}
                  </p>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#6b7280' }}>
                    <span>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    <span>🎯 Points: {assignment.maxPoints}</span>
                    <span>📊 Submissions: {assignment.submissionCount}</span>
                  </div>
                </div>
                <button
                  onClick={() => fetchSubmissions(assignment._id)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  📝 View Submissions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submissions List */}
      {activeTab === 'submissions' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {submissions.map((submission) => (
            <div key={submission._id} style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
                    {submission.student.firstName} {submission.student.lastName}
                  </h4>
                  <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                    Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                  <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                    Files: {submission.files.length} • Status: {submission.status}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {submission.grade ? (
                    <div style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {submission.grade.letterGrade} ({submission.grade.points} pts)
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const points = prompt('Enter points (0-100):');
                        const feedback = prompt('Enter feedback:');
                        if (points !== null && feedback !== null) {
                          handleGradeSubmission(submission._id, {
                            points: parseInt(points),
                            feedback
                          });
                        }
                      }}
                      style={{
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      📊 Grade
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
              Create New Assignment
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Title
              </label>
              <input
                type="text"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Course
              </label>
              <select
                value={newAssignment.courseId}
                onChange={(e) => setNewAssignment({...newAssignment, courseId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px'
                }}
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Max Points
                </label>
                <input
                  type="number"
                  value={newAssignment.maxPoints}
                  onChange={(e) => setNewAssignment({...newAssignment, maxPoints: parseInt(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer'
                }}
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
