import React, { useState, useEffect } from 'react';
import axios from '../api';

const InstructorContestManagement = ({ instructorId }) => {
  const [contests, setContests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [contestForm, setContestForm] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'quiz',
    difficulty: 'intermediate',
    maxParticipants: 100,
    registrationStartDate: '',
    registrationEndDate: '',
    startDate: '',
    endDate: '',
    duration: 60,
    rules: ['Follow academic integrity', 'Submit within time limit'],
    prizes: [{ position: 1, description: 'First Prize', value: 'Certificate + Badge' }],
    questions: [{ question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', points: 10 }],
    isPublic: true,
    tags: [],
    settings: {
      allowLateSubmissions: false,
      showLeaderboard: true,
      autoGrade: true,
      shuffleQuestions: false
    }
  });

  useEffect(() => {
    if (instructorId) {
      fetchContests();
      fetchCourses();
    }
  }, [instructorId]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/contests/instructor/${instructorId}`);
      setContests(response.data);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/courses?instructor=${instructorId}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const handleCreateContest = async (e) => {
    e.preventDefault();

    console.log('🔍 Frontend Contest Creation Debug - Form submitted');
    console.log('🔍 Frontend Contest Creation Debug - Contest form data:', JSON.stringify(contestForm, null, 2));

    // Validate required fields
    if (!contestForm.title || !contestForm.description || !contestForm.courseId) {
      alert('Please fill in all required fields: Title, Description, and Course');
      return;
    }

    // Validate questions
    const validQuestions = contestForm.questions.filter(q =>
      q.question && q.question.trim() !== '' &&
      (q.type !== 'mcq' || (q.options.some(opt => opt.trim() !== '') && q.correctAnswer !== ''))
    );

    if (validQuestions.length === 0) {
      alert('Please add at least one valid question with all required fields filled');
      return;
    }

    // Validate dates
    const now = new Date();
    const regStart = new Date(contestForm.registrationStartDate);
    const regEnd = new Date(contestForm.registrationEndDate);
    const contestStart = new Date(contestForm.startDate);
    const contestEnd = new Date(contestForm.endDate);

    if (regStart <= now) {
      alert('Registration start date must be in the future');
      return;
    }

    if (regEnd <= regStart) {
      alert('Registration end date must be after registration start date');
      return;
    }

    if (contestStart <= regEnd) {
      alert('Contest start date must be after registration end date');
      return;
    }

    if (contestEnd <= contestStart) {
      alert('Contest end date must be after contest start date');
      return;
    }

    try {
      // Prepare the data to send
      const contestData = {
        ...contestForm,
        questions: validQuestions
      };

      console.log('🔍 Frontend Contest Creation Debug - Sending data:', JSON.stringify(contestData, null, 2));

      const response = await axios.post('/contests', contestData);
      console.log('✅ Frontend Contest Creation Debug - Contest created successfully:', response.data);

      setShowCreateForm(false);
      setContestForm({
        title: '',
        description: '',
        courseId: '',
        type: 'quiz',
        difficulty: 'intermediate',
        maxParticipants: 100,
        registrationStartDate: '',
        registrationEndDate: '',
        startDate: '',
        endDate: '',
        duration: 60,
        rules: ['Follow academic integrity', 'Submit within time limit'],
        prizes: [{ position: 1, description: 'First Prize', value: 'Certificate + Badge' }],
        questions: [{ question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', points: 10 }],
        isPublic: true,
        tags: [],
        settings: {
          allowLateSubmissions: false,
          showLeaderboard: true,
          autoGrade: true,
          shuffleQuestions: false
        }
      });
      fetchContests();
      alert('Contest created successfully!');
    } catch (error) {
      console.error('❌ Frontend Contest Creation Debug - Error creating contest:', error);
      console.error('❌ Frontend Contest Creation Debug - Error response:', error.response?.data);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.errors?.join(', ') ||
                          'Failed to create contest. Please try again.';
      alert(errorMessage);
    }
  };

  const handleUpdateStatus = async (contestId, newStatus) => {
    try {
      await axios.patch(`/contests/${contestId}/status`, { status: newStatus });
      fetchContests();
      alert(`Contest status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating contest status:', error);
      alert('Failed to update contest status');
    }
  };

  const handleDeleteContest = async (contestId) => {
    if (!window.confirm('Are you sure you want to delete this contest?')) return;
    try {
      await axios.delete(`/contests/${contestId}`);
      fetchContests();
      alert('Contest deleted successfully');
    } catch (error) {
      console.error('Error deleting contest:', error);
      alert('Failed to delete contest');
    }
  };

  const addQuestion = () => {
    setContestForm(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', points: 10 }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setContestForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuestion = (index) => {
    setContestForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': '#6c757d',
      'registration-open': '#28a745',
      'registration-closed': '#ffc107',
      'active': '#007bff',
      'completed': '#17a2b8',
      'cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading contests...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>🏆 Contest Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          + Create New Contest
        </button>
      </div>

      {/* Contest List */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {contests.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #dee2e6'
          }}>
            <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No contests created yet</h3>
            <p style={{ color: '#6c757d', margin: 0 }}>Create your first contest to engage students with competitive learning!</p>
          </div>
        ) : (
          contests.map(contest => (
            <div key={contest._id} style={{
              background: 'white',
              border: '1px solid #e1e5e9',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{contest.title}</h3>
                  <p style={{ margin: '0 0 12px 0', color: '#666', lineHeight: '1.5' }}>{contest.description}</p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      background: getStatusColor(contest.status),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {contest.status.replace('-', ' ')}
                    </span>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      📚 {contest.course?.title}
                    </span>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      👥 {contest.participants?.length || 0}/{contest.maxParticipants} participants
                    </span>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      🎯 {contest.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  {contest.status === 'draft' && (
                    <button
                      onClick={() => handleUpdateStatus(contest._id, 'registration-open')}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Open Registration
                    </button>
                  )}
                  {contest.status === 'registration-open' && (
                    <button
                      onClick={() => handleUpdateStatus(contest._id, 'active')}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Start Contest
                    </button>
                  )}
                  {contest.status === 'active' && (
                    <button
                      onClick={() => handleUpdateStatus(contest._id, 'completed')}
                      style={{
                        background: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      End Contest
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedContest(contest);
                      setShowParticipants(true);
                    }}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    View Details
                  </button>
                  {['draft', 'registration-open'].includes(contest.status) && (
                    <button
                      onClick={() => handleDeleteContest(contest._id)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Contest Details */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <strong style={{ color: '#495057', fontSize: '14px' }}>Registration:</strong>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {formatDate(contest.registrationStartDate)} - {formatDate(contest.registrationEndDate)}
                  </div>
                </div>
                <div>
                  <strong style={{ color: '#495057', fontSize: '14px' }}>Contest Period:</strong>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {formatDate(contest.startDate)} - {formatDate(contest.endDate)}
                  </div>
                </div>
                <div>
                  <strong style={{ color: '#495057', fontSize: '14px' }}>Duration:</strong>
                  <div style={{ fontSize: '13px', color: '#666' }}>{contest.duration} minutes</div>
                </div>
                <div>
                  <strong style={{ color: '#495057', fontSize: '14px' }}>Total Points:</strong>
                  <div style={{ fontSize: '13px', color: '#666' }}>{contest.totalPoints} points</div>
                </div>
              </div>

              {/* Leaderboard Preview */}
              {contest.leaderboard && contest.leaderboard.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>🏆 Top Performers</h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {contest.leaderboard.slice(0, 3).map((entry, index) => (
                      <div key={entry.student._id} style={{
                        background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        #{entry.rank} {entry.student.firstName} {entry.student.lastName} - {entry.score} pts
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Contest Modal */}
      {showCreateForm && (
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
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>Create New Contest</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateContest} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                    Contest Title *
                  </label>
                  <input
                    type="text"
                    value={contestForm.title}
                    onChange={(e) => setContestForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                    Course *
                  </label>
                  <select
                    value={contestForm.courseId}
                    onChange={(e) => setContestForm(prev => ({ ...prev, courseId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                  Description *
                </label>
                <textarea
                  value={contestForm.description}
                  onChange={(e) => setContestForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '16px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                    Contest Type
                  </label>
                  <select
                    value={contestForm.type}
                    onChange={(e) => setContestForm(prev => ({ ...prev, type: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="quiz">Quiz</option>
                    <option value="coding">Coding</option>
                    <option value="project">Project</option>
                    <option value="essay">Essay</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                    Difficulty
                  </label>
                  <select
                    value={contestForm.difficulty}
                    onChange={(e) => setContestForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={contestForm.duration}
                    onChange={(e) => setContestForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    min="15"
                    max="480"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                    Registration Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={contestForm.registrationStartDate}
                    onChange={(e) => setContestForm(prev => ({ ...prev, registrationStartDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                    Registration End Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={contestForm.registrationEndDate}
                    onChange={(e) => setContestForm(prev => ({ ...prev, registrationEndDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                    Contest Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={contestForm.startDate}
                    onChange={(e) => setContestForm(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                    Contest End Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={contestForm.endDate}
                    onChange={(e) => setContestForm(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label style={{ fontWeight: 'bold', color: '#495057', fontSize: '18px' }}>
                    Contest Questions
                  </label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    + Add Question
                  </button>
                </div>

                {contestForm.questions.map((question, index) => (
                  <div key={index} style={{
                    border: '1px solid #e1e5e9',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                    background: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, color: '#495057' }}>Question {index + 1}</h4>
                      {contestForm.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          style={{
                            background: '#dc3545',
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
                      )}
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#495057' }}>
                        Question Text *
                      </label>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ced4da',
                          borderRadius: '6px',
                          fontSize: '14px',
                          minHeight: '80px'
                        }}
                        placeholder="Enter your question here..."
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#495057' }}>
                          Question Type
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="coding">Coding</option>
                          <option value="essay">Essay</option>
                          <option value="file-upload">File Upload</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#495057' }}>
                          Points
                        </label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                          min="1"
                          max="100"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#495057' }}>
                          Time Limit (min)
                        </label>
                        <input
                          type="number"
                          value={question.timeLimit || ''}
                          onChange={(e) => updateQuestion(index, 'timeLimit', parseInt(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                          min="1"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    {question.type === 'mcq' && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                          Answer Options
                        </label>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              checked={question.correctAnswer === optionIndex.toString()}
                              onChange={() => updateQuestion(index, 'correctAnswer', optionIndex.toString())}
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIndex] = e.target.value;
                                updateQuestion(index, 'options', newOptions);
                              }}
                              style={{
                                flex: 1,
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                          </div>
                        ))}
                        <small style={{ color: '#666' }}>Select the radio button next to the correct answer</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e1e5e9' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Create Contest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participant Details Modal */}
      {showParticipants && selectedContest && (
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
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>
                {selectedContest.title} - Participants & Results
              </h3>
              <button
                onClick={() => {
                  setShowParticipants(false);
                  setSelectedContest(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>

            {/* Contest Summary */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <strong style={{ color: '#495057' }}>Status:</strong>
                <div style={{ color: getStatusColor(selectedContest.status), fontWeight: 'bold' }}>
                  {selectedContest.status.replace('-', ' ').toUpperCase()}
                </div>
              </div>
              <div>
                <strong style={{ color: '#495057' }}>Participants:</strong>
                <div>{selectedContest.participants?.length || 0}/{selectedContest.maxParticipants}</div>
              </div>
              <div>
                <strong style={{ color: '#495057' }}>Total Points:</strong>
                <div>{selectedContest.totalPoints}</div>
              </div>
              <div>
                <strong style={{ color: '#495057' }}>Duration:</strong>
                <div>{selectedContest.duration} minutes</div>
              </div>
            </div>

            {/* Participants Table */}
            {selectedContest.participants && selectedContest.participants.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Rank</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Student</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Score</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Registered</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedContest.participants
                      .sort((a, b) => (b.score || 0) - (a.score || 0))
                      .map((participant, index) => (
                        <tr key={participant.student._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '12px' }}>
                            {participant.status === 'completed' ? (
                              <span style={{
                                background: index < 3 ? (index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32') : '#e9ecef',
                                color: index < 3 ? 'white' : '#495057',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                #{index + 1}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {participant.student.firstName} {participant.student.lastName}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              background: participant.status === 'completed' ? '#28a745' :
                                         participant.status === 'participating' ? '#007bff' : '#6c757d',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              textTransform: 'capitalize'
                            }}>
                              {participant.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>
                            {participant.score || 0}/{selectedContest.totalPoints}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                            {formatDate(participant.registeredAt)}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                            {participant.completedAt ? formatDate(participant.completedAt) : '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                background: '#f8f9fa',
                borderRadius: '8px',
                color: '#6c757d'
              }}>
                <h4>No participants yet</h4>
                <p>Students will appear here once they register for the contest.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple contest component for students (backward compatibility)
export default function Contests({ instructorId, isInstructor = false }) {
  if (isInstructor && instructorId) {
    return <InstructorContestManagement instructorId={instructorId} />;
  }

  // Default student view with dummy data for backward compatibility
  const contests = [
    { name: 'Hackathon June', status: 'Open', leaderboard: [
      { name: 'Vaish S', score: 95 },
      { name: 'Alex T', score: 90 },
    ]},
    { name: 'Quiz Bowl', status: 'Closed', leaderboard: [
      { name: 'Sam R', score: 88 },
      { name: 'Vaish S', score: 85 },
    ]},
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Contests</h2>
      {contests.map((c, i) => (
        <div key={i} style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{c.name} <span style={{ color: c.status === 'Open' ? 'green' : 'red', fontSize: 14 }}>({c.status})</span></div>
          {c.status === 'Open' && (
            <button style={{ background: '#a18cd1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', margin: '8px 0' }}>Register</button>
          )}
          <div style={{ marginTop: 8 }}>
            <strong>Leaderboard:</strong>
            <ol>
              {c.leaderboard.map((l, j) => (
                <li key={j}>{l.name} - {l.score} pts</li>
              ))}
            </ol>
          </div>
        </div>
      ))}
    </div>
  );
}