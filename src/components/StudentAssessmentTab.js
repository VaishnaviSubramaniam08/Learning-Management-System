import React, { useState, useEffect } from "react";
import axios from "../api";

export default function StudentAssessmentTab({ studentId }) {
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch enrollments on mount
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await axios.get(`/courses/student/${studentId}/enrollments`);
        setEnrollments(response.data);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [studentId]);

  // Find selected course and module objects
  const selectedEnrollment = enrollments.find(
    (enr) => enr.course._id === selectedCourseId
  );
  const modules = selectedEnrollment?.course?.modules || [];
  const selectedModule = modules.find((m) => m._id === selectedModuleId);

  // Handle course selection
  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
    setSelectedModuleId("");
    setSelectedQuiz(null);
    setQuizAttempts([]);
    setCurrentQuiz(null);
    setQuizResult(null);
  };

  // Handle module selection
  const handleModuleChange = (e) => {
    setSelectedModuleId(e.target.value);
    setSelectedQuiz(null);
    setQuizAttempts([]);
    setCurrentQuiz(null);
    setQuizResult(null);
  };

  // Handle quiz selection and fetch attempts
  const handleQuizSelect = async () => {
    if (!selectedModule || !selectedModule.quiz) return;
    
    try {
      // Fetch full quiz details
      const quizResponse = await axios.get(`/quiz/${selectedModule.quiz._id || selectedModule.quiz}`);
      setSelectedQuiz(quizResponse.data);
      
      // Find attempts for this quiz in the enrollment's moduleProgress
      const mp = (selectedEnrollment?.moduleProgress || []).find(
        (mp) =>
          mp.module &&
          (mp.module._id === selectedModule._id || mp.module === selectedModule._id)
      );
      const attempts =
        mp?.quizAttempts?.filter(
          (qa) =>
            qa.quiz &&
            (qa.quiz._id === selectedModule.quiz._id ||
              qa.quiz === selectedModule.quiz._id)
        ) || [];
      setQuizAttempts(attempts);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
    }
  };

  // Start taking a quiz
  const startQuiz = () => {
    if (!selectedQuiz) return;
    setCurrentQuiz(selectedQuiz);
    setQuizAnswers(Array(selectedQuiz.questions.length).fill(''));
    setQuizResult(null);
  };

  // Handle answer selection
  const handleAnswerChange = (questionIndex, answer) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answer;
    setQuizAnswers(newAnswers);
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (!currentQuiz || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(`/quiz/${currentQuiz._id}/submit`, {
        studentId: studentId,
        answers: quizAnswers,
        timeTaken: 0 // You can add timer functionality later
      });
      
      setQuizResult(response.data);
      
      // Refresh attempts
      await handleQuizSelect();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset quiz
  const resetQuiz = () => {
    setCurrentQuiz(null);
    setQuizAnswers([]);
    setQuizResult(null);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Loading assessments...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', color: '#374151' }}>📝 My Assessments</h2>
      
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
              {enrollments.map((enr) => (
                <option key={enr.course._id} value={enr.course._id}>
                  {enr.course.title}
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
          
          {selectedModule && selectedModule.quiz && (
            <button
              onClick={handleQuizSelect}
              style={{
                background: '#6b46c1',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '24px'
              }}
            >
              View Quiz
            </button>
          )}
        </div>
        
        {selectedModule && !selectedModule.quiz && (
          <div style={{ marginTop: '16px', color: '#6b7280' }}>
            No quiz available for this module.
          </div>
        )}
      </div>

      {/* Quiz Information and Attempts */}
      {selectedQuiz && !currentQuiz && (
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
          </div>

          {/* Previous Attempts */}
          {quizAttempts.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Previous Attempts:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Attempt</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Score</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizAttempts.map((attempt, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px' }}>{idx + 1}</td>
                      <td style={{ padding: '8px' }}>{attempt.score || 'N/A'}%</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{
                          color: attempt.passed ? '#059669' : '#dc2626',
                          fontWeight: 'bold'
                        }}>
                          {attempt.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        {attempt.attemptedAt ? new Date(attempt.attemptedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Start Quiz Button */}
          {quizAttempts.length < (selectedQuiz.maxAttempts || 3) && (
            <button
              onClick={startQuiz}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {quizAttempts.length === 0 ? 'Start Quiz' : 'Retake Quiz'}
            </button>
          )}
          
          {quizAttempts.length >= (selectedQuiz.maxAttempts || 3) && (
            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>
              Maximum attempts reached for this quiz.
            </div>
          )}
        </div>
      )}

      {/* Active Quiz */}
      {currentQuiz && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#374151' }}>
            {currentQuiz.title}
          </h3>
          
          {currentQuiz.questions?.map((question, qIndex) => (
            <div key={qIndex} style={{ 
              marginBottom: '24px', 
              padding: '16px', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}>
              <h4 style={{ marginBottom: '12px', color: '#374151' }}>
                Question {qIndex + 1}: {question.question}
              </h4>
              
              {question.options?.map((option, oIndex) => (
                <label key={oIndex} style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={option}
                    checked={quizAnswers[qIndex] === option}
                    onChange={() => handleAnswerChange(qIndex, option)}
                    style={{ marginRight: '8px' }}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              onClick={submitQuiz}
              disabled={isSubmitting || quizAnswers.some(a => !a)}
              style={{
                background: isSubmitting || quizAnswers.some(a => !a) ? '#9ca3af' : '#6b46c1',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: isSubmitting || quizAnswers.some(a => !a) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
            
            <button
              onClick={resetQuiz}
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
        </div>
      )}

      {/* Quiz Result */}
      {quizResult && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px',
          marginTop: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#374151' }}>Quiz Result</h3>
          
          <div style={{ 
            background: quizResult.passed ? '#d1fae5' : '#fef2f2',
            padding: '16px',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <h4 style={{ 
              color: quizResult.passed ? '#059669' : '#dc2626',
              marginBottom: '8px'
            }}>
              {quizResult.passed ? '🎉 Congratulations! You Passed!' : '❌ Quiz Failed'}
            </h4>
            <p><strong>Score:</strong> {quizResult.score}%</p>
            <p><strong>Correct Answers:</strong> {quizResult.correctAnswers} / {quizResult.totalQuestions}</p>
            <p><strong>Attempt:</strong> {quizResult.attemptNumber} / {quizResult.maxAttempts}</p>
          </div>
          
          <button
            onClick={resetQuiz}
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
            Back to Quiz List
          </button>
        </div>
      )}

      {/* No Enrollments Message */}
      {enrollments.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px', 
          color: '#6b7280',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3>No Assessments Available</h3>
          <p>You need to enroll in courses to see available assessments.</p>
        </div>
      )}
    </div>
  );
}
