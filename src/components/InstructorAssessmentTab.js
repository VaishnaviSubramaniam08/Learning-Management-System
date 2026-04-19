import React, { useState, useEffect } from "react";
import axios from "../api";

export default function InstructorAssessmentTab({ instructorId }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 3,
    questions: [{ question: '', options: ['', ''], correctAnswer: '' }]
  });
  const [loading, setLoading] = useState(true);

  // Fetch instructor's courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`/courses?instructor=${instructorId}`);
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [instructorId]);

  // Find selected course and module objects
  const selectedCourse = courses.find(course => course._id === selectedCourseId);
  const modules = selectedCourse?.modules || [];
  const selectedModule = modules.find(module => module._id === selectedModuleId);

  // Handle course selection
  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
    setSelectedModuleId("");
    setSelectedQuiz(null);
    setAllSubmissions([]);
    setShowQuizForm(false);
  };

  // Handle module selection
  const handleModuleChange = (e) => {
    setSelectedModuleId(e.target.value);
    setSelectedQuiz(null);
    setAllSubmissions([]);
    setShowQuizForm(false);
  };

  // Handle quiz selection and fetch all submissions
  const handleQuizSelect = async () => {
    if (!selectedModule || !selectedModule.quiz) return;
    
    try {
      // Fetch full quiz details
      const quizResponse = await axios.get(`/quiz/${selectedModule.quiz._id || selectedModule.quiz}`);
      setSelectedQuiz(quizResponse.data);
      
      // Fetch all submissions for this quiz
      const submissionsResponse = await axios.get(`/quiz/${selectedModule.quiz._id || selectedModule.quiz}/submissions`);
      setAllSubmissions(submissionsResponse.data);
    } catch (error) {
      console.error('Error fetching quiz details or submissions:', error);
    }
  };

  // Handle quiz form changes
  const handleQuizFormChange = (e, idx, field, optIdx) => {
    if (typeof idx === 'number') {
      const updatedQuestions = [...quizForm.questions];
      if (field === 'options') {
        updatedQuestions[idx].options[optIdx] = e.target.value;
      } else {
        updatedQuestions[idx][field] = e.target.value;
      }
      setQuizForm({ ...quizForm, questions: updatedQuestions });
    } else {
      setQuizForm({ ...quizForm, [e.target.name]: e.target.value });
    }
  };

  // Add new question
  const handleAddQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, { question: '', options: ['', ''], correctAnswer: '' }]
    });
  };

  // Add option to question
  const handleAddOption = (qIdx) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[qIdx].options.push('');
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  // Remove option from question
  const handleRemoveOption = (qIdx, optIdx) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[qIdx].options.splice(optIdx, 1);
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  // Remove question
  const handleRemoveQuestion = (qIdx) => {
    const updatedQuestions = quizForm.questions.filter((_, idx) => idx !== qIdx);
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  // Create quiz
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedModule) {
      alert('Please select a module');
      return;
    }

    try {
      await axios.post('/quiz', { 
        ...quizForm, 
        moduleId: selectedModule._id 
      });
      
      setShowQuizForm(false);
      setQuizForm({
        title: '',
        timeLimit: 30,
        passingScore: 70,
        maxAttempts: 3,
        questions: [{ question: '', options: ['', ''], correctAnswer: '' }]
      });
      
      // Refresh the module to show the new quiz
      const courseResponse = await axios.get(`/courses/${selectedCourse._id}`);
      const updatedCourse = courseResponse.data;
      setCourses(prev => prev.map(c => c._id === selectedCourse._id ? updatedCourse : c));
      
      alert('Quiz created successfully!');
    } catch (err) {
      console.error('Error creating quiz:', err);
      alert('Failed to create quiz. Please try again.');
    }
  };

  // Grade submission
  const handleGrade = async (submissionId, grade, feedback) => {
    try {
      await axios.post(`/quiz/${selectedQuiz._id}/grade`, { 
        submissionId, 
        grade, 
        feedback 
      });
      
      // Refresh submissions
      const submissionsResponse = await axios.get(`/quiz/${selectedQuiz._id}/submissions`);
      setAllSubmissions(submissionsResponse.data);
      
      alert('Grade submitted successfully!');
    } catch (err) {
      console.error('Error grading submission:', err);
      alert('Failed to grade submission. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Loading instructor courses...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', color: '#374151' }}>📝 Assessment Management</h2>
      
      {/* Course and Module Selection */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Select Course:
            </label>
            <select 
              value={selectedCourseId} 
              onChange={handleCourseChange}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                minWidth: '200px'
              }}
            >
              <option value="">Choose a course...</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          
    <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Select Module:
            </label>
            <select
              value={selectedModuleId}
              onChange={handleModuleChange}
              disabled={!selectedCourseId}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                minWidth: '200px',
                opacity: selectedCourseId ? 1 : 0.6
              }}
            >
              <option value="">Choose a module...</option>
              {modules.map((module) => (
                <option key={module._id} value={module._id}>
                  {module.title}
                </option>
              ))}
          </select>
          </div>
          
          {selectedModule && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              {selectedModule.quiz ? (
                <button
                  onClick={handleQuizSelect}
                  style={{
                    background: '#6b46c1',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  View Quiz & Submissions
                </button>
              ) : (
                <button
                  onClick={() => setShowQuizForm(true)}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  + Create Quiz
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Quiz Form */}
      {showQuizForm && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#374151' }}>
            Create Quiz for {selectedModule?.title}
          </h3>
          
          <form onSubmit={handleCreateQuiz}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Quiz Title:
              </label>
              <input
                type="text"
                name="title"
                value={quizForm.title}
                onChange={handleQuizFormChange}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Time Limit (minutes):
                </label>
                <input
                  type="number"
                  name="timeLimit"
                  value={quizForm.timeLimit}
                  onChange={handleQuizFormChange}
                  min="1"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Passing Score (%):
                </label>
                <input
                  type="number"
                  name="passingScore"
                  value={quizForm.passingScore}
                  onChange={handleQuizFormChange}
                  min="0"
                  max="100"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Max Attempts:
                </label>
                <input
                  type="number"
                  name="maxAttempts"
                  value={quizForm.maxAttempts}
                  onChange={handleQuizFormChange}
                  min="1"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '12px', color: '#374151' }}>Questions:</h4>
              {quizForm.questions.map((q, qIdx) => (
                <div key={qIdx} style={{ 
                  border: '1px solid #e5e7eb', 
                  padding: '16px', 
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ margin: 0, color: '#374151' }}>Question {qIdx + 1}</h5>
                    {quizForm.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Question Text:
                    </label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuizFormChange(e, qIdx, 'question')}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Options:
                    </label>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleQuizFormChange(e, qIdx, 'options', optIdx)}
                          required
                          placeholder={`Option ${optIdx + 1}`}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db'
                          }}
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIdx, optIdx)}
                            style={{
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddOption(qIdx)}
                      style={{
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      + Add Option
                    </button>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Correct Answer:
                    </label>
                    <input
                      type="text"
                      value={q.correctAnswer}
                      onChange={(e) => handleQuizFormChange(e, qIdx, 'correctAnswer')}
                      required
                      placeholder="Enter the correct answer"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddQuestion}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                + Add Question
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  background: '#6b46c1',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Create Quiz
              </button>
              
              <button
                type="button"
                onClick={() => setShowQuizForm(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quiz Information and Submissions */}
      {selectedQuiz && (
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#374151' }}>
            Quiz: {selectedQuiz.title}
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <p><strong>Questions:</strong> {selectedQuiz.questions?.length || 0}</p>
            <p><strong>Time Limit:</strong> {selectedQuiz.timeLimit || 30} minutes</p>
            <p><strong>Passing Score:</strong> {selectedQuiz.passingScore || 70}%</p>
            <p><strong>Max Attempts:</strong> {selectedQuiz.maxAttempts || 3}</p>
            <p><strong>Total Submissions:</strong> {allSubmissions.length}</p>
          </div>

          {/* Student Submissions */}
          {allSubmissions.length > 0 ? (
            <div>
              <h4 style={{ marginBottom: '12px', color: '#374151' }}>Student Submissions:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Student</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Score</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Attempt</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allSubmissions.map((submission, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px' }}>
                        {submission.student?.firstName} {submission.student?.lastName}
                      </td>
                      <td style={{ padding: '8px' }}>{submission.score || 'N/A'}%</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{
                          color: submission.passed ? '#059669' : '#dc2626',
                          fontWeight: 'bold'
                        }}>
                          {submission.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>{submission.attemptNumber || 'N/A'}</td>
                      <td style={{ padding: '8px' }}>
                        {submission.attemptedAt ? new Date(submission.attemptedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <GradeForm 
                          submission={submission} 
                          onGrade={handleGrade} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>
              No submissions yet for this quiz.
            </div>
          )}
        </div>
      )}

      {/* No Courses Message */}
      {courses.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px', 
          color: '#6b7280',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3>No Courses Available</h3>
          <p>You need to create courses to manage assessments.</p>
        </div>
      )}
    </div>
  );
}

// Grade Form Component
function GradeForm({ submission, onGrade }) {
  const [grade, setGrade] = useState(submission.grade || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [isGrading, setIsGrading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGrading(true);
    
    try {
      await onGrade(submission._id, grade, feedback);
      setIsGrading(false);
    } catch (error) {
      setIsGrading(false);
    }
  };

  if (submission.status === 'Graded') {
    return (
      <div style={{ fontSize: '12px', color: '#059669' }}>
        <div>Grade: {submission.grade}%</div>
        <div>Feedback: {submission.feedback}</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      <input
        type="number"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        placeholder="Grade %"
        required
        min="0"
        max="100"
        style={{ 
          width: '60px', 
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #d1d5db',
          fontSize: '12px'
        }}
      />
      <input
        type="text"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Feedback"
        style={{ 
          width: '80px', 
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #d1d5db',
          fontSize: '12px'
        }}
      />
      <button
        type="submit"
        disabled={isGrading}
        style={{
          background: '#10b981',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: isGrading ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          opacity: isGrading ? 0.6 : 1
        }}
      >
        {isGrading ? 'Grading...' : 'Grade'}
      </button>
    </form>
  );
}
