import React, { useState, useEffect } from 'react';
import axios from '../api';

const StudentContests = ({ studentId }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState(null);
  const [showContestModal, setShowContestModal] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPublicContests();
  }, []);

  useEffect(() => {
    let timer;
    if (selectedContest && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitAnswers();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedContest, timeLeft]);

  const fetchPublicContests = async () => {
    try {
      setLoading(true);
      console.log('🔍 StudentContests Debug - Fetching contests for student:', studentId);
      const response = await axios.get(`/contests/student/${studentId}`);
      console.log('✅ StudentContests Debug - Contests fetched:', response.data);
      setContests(response.data);
    } catch (error) {
      console.error('❌ StudentContests Debug - Error fetching contests:', error);
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterForContest = async (contestId) => {
    try {
      await axios.post(`/contests/${contestId}/register`);
      alert('Successfully registered for contest!');
      fetchPublicContests();
    } catch (error) {
      console.error('Error registering for contest:', error);
      alert(error.response?.data?.message || 'Failed to register for contest');
    }
  };

  const handleStartContest = async (contest) => {
    try {
      const response = await axios.get(`/contests/${contest._id}`);
      setSelectedContest(response.data);
      setAnswers(new Array(response.data.questions.length).fill(''));
      setTimeLeft(response.data.duration * 60); // Convert minutes to seconds
      setShowContestModal(true);
    } catch (error) {
      console.error('Error starting contest:', error);
      alert('Failed to start contest');
    }
  };

  const handleSubmitAnswers = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const response = await axios.post(`/contests/${selectedContest._id}/submit`, {
        answers: answers
      });
      
      alert(`Contest submitted! Your score: ${response.data.score}/${response.data.totalPoints} (${response.data.percentage}%)`);
      setShowContestModal(false);
      setSelectedContest(null);
      fetchPublicContests();
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert(error.response?.data?.message || 'Failed to submit answers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  const getStatusColor = (status) => {
    const colors = {
      'registration-open': '#28a745',
      'active': '#007bff',
      'completed': '#17a2b8'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading contests...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>🏆 Available Contests</h2>

      {contests.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #dee2e6'
        }}>
          <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No contests available</h3>
          <p style={{ color: '#6c757d', margin: 0 }}>Check back later for new contests!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {contests.map(contest => {
            const isRegistered = contest.isRegistered;
            const canStart = contest.canParticipate;
            const canRegister = contest.canRegister;

            return (
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
                        📚 {contest.course?.title} {contest.enrolledCourse && '(Enrolled)'}
                      </span>
                      <span style={{ color: '#666', fontSize: '14px' }}>
                        👥 {contest.participants?.length || 0}/{contest.maxParticipants}
                      </span>
                      <span style={{ color: '#666', fontSize: '14px' }}>
                        🎯 {contest.type.toUpperCase()}
                      </span>
                      <span style={{ color: '#666', fontSize: '14px' }}>
                        ⏱️ {contest.duration} min
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {canRegister && (
                      <button
                        onClick={() => handleRegisterForContest(contest._id)}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '10px 20px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        Register Now
                      </button>
                    )}
                    {canStart && (
                      <button
                        onClick={() => handleStartContest(contest)}
                        style={{
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '10px 20px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        Start Contest
                      </button>
                    )}
                    {isRegistered && !canStart && (
                      <span style={{
                        background: '#17a2b8',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        Registered ✓
                      </span>
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
                    <strong style={{ color: '#495057', fontSize: '14px' }}>Registration Period:</strong>
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
                    <strong style={{ color: '#495057', fontSize: '14px' }}>Total Points:</strong>
                    <div style={{ fontSize: '13px', color: '#666' }}>{contest.totalPoints} points</div>
                  </div>
                  <div>
                    <strong style={{ color: '#495057', fontSize: '14px' }}>Difficulty:</strong>
                    <div style={{ fontSize: '13px', color: '#666', textTransform: 'capitalize' }}>{contest.difficulty}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contest Modal */}
      {showContestModal && selectedContest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
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
              <h3 style={{ margin: 0, color: '#2c3e50' }}>{selectedContest.title}</h3>
              <div style={{
                background: timeLeft < 300 ? '#dc3545' : '#007bff',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                ⏱️ {formatTime(timeLeft)}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              {selectedContest.questions.map((question, index) => (
                <div key={index} style={{
                  border: '1px solid #e1e5e9',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px',
                  background: '#f8f9fa'
                }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>
                    Question {index + 1} ({question.points} points)
                  </h4>
                  <p style={{ margin: '0 0 16px 0', lineHeight: '1.6' }}>{question.question}</p>
                  
                  {question.type === 'mcq' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={optionIndex}
                            checked={answers[index] === optionIndex.toString()}
                            onChange={(e) => {
                              const newAnswers = [...answers];
                              newAnswers[index] = e.target.value;
                              setAnswers(newAnswers);
                            }}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e1e5e9' }}>
              <button
                onClick={handleSubmitAnswers}
                disabled={isSubmitting}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentContests;
