import React, { useState, useEffect, useRef } from 'react';
import axios from '../api';
import './MockTestSystem.css';

const MockTestSystem = ({ user, examCode }) => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, test, results, leaderboard
  const [tests, setTests] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [testSession, setTestSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Test State
  const [isTestActive, setIsTestActive] = useState(false);
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const [testResults, setTestResults] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Filters
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  
  const timerRef = useRef(null);

  useEffect(() => {
    fetchMockTests();
    fetchLeaderboard();
  }, [examCode]);

  useEffect(() => {
    if (isTestActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isTestActive, timeRemaining]);

  const fetchMockTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/career-exam-prep/mock-tests/${examCode}`);
      setTests(response.data);
    } catch (error) {
      setError('Failed to load mock tests');
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`/api/career-exam-prep/leaderboard/${examCode}`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const startTest = async (test) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/career-exam-prep/start-test', {
        testId: test._id,
        userId: user.id,
        examCode
      });
      
      setCurrentTest(test);
      setTestSession(response.data);
      setTimeRemaining(test.duration * 60); // Convert minutes to seconds
      setCurrentQuestion(0);
      setAnswers({});
      setMarkedForReview(new Set());
      setVisitedQuestions(new Set([0]));
      setIsTestActive(true);
      setCurrentView('test');
    } catch (error) {
      setError('Failed to start test');
      console.error('Error starting test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
    
    // Auto-save answer
    if (testSession) {
      axios.post('/api/career-exam-prep/save-answer', {
        sessionId: testSession.sessionId,
        questionIndex,
        answer
      }).catch(console.error);
    }
  };

  const navigateToQuestion = (questionIndex) => {
    setCurrentQuestion(questionIndex);
    setVisitedQuestions(prev => new Set([...prev, questionIndex]));
  };

  const markForReview = (questionIndex) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const handleSubmitTest = async () => {
    try {
      setLoading(true);
      setIsTestActive(false);
      clearInterval(timerRef.current);
      
      const response = await axios.post('/api/career-exam-prep/submit-test', {
        sessionId: testSession.sessionId,
        answers,
        timeSpent: (currentTest.duration * 60) - timeRemaining
      });
      
      setTestResults(response.data);
      setCurrentView('results');
      fetchLeaderboard(); // Refresh leaderboard
    } catch (error) {
      setError('Failed to submit test');
      console.error('Error submitting test:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    if (answers[index] !== undefined) {
      return markedForReview.has(index) ? 'answered-marked' : 'answered';
    }
    if (markedForReview.has(index)) {
      return 'marked';
    }
    if (visitedQuestions.has(index)) {
      return 'visited';
    }
    return 'not-visited';
  };

  const renderTestDashboard = () => (
    <div className="test-dashboard">
      <div className="dashboard-header">
        <h1>🎯 Mock Tests</h1>
        <p>Practice with real exam-like conditions</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{tests.length}</div>
          <div className="stat-label">Available Tests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tests.filter(t => t.testType === 'Full Length').length}</div>
          <div className="stat-label">Full Length</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tests.filter(t => t.testType === 'Subject Wise').length}</div>
          <div className="stat-label">Subject Wise</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tests.filter(t => t.testType === 'Previous Year').length}</div>
          <div className="stat-label">Previous Year</div>
        </div>
      </div>
      
      <div className="filters-section">
        <div className="filter-group">
          <label>Difficulty:</label>
          <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
            <option value="All">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Type:</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Full Length">Full Length</option>
            <option value="Subject Wise">Subject Wise</option>
            <option value="Topic Wise">Topic Wise</option>
            <option value="Previous Year">Previous Year</option>
          </select>
        </div>
        
        <button 
          className="leaderboard-btn"
          onClick={() => setCurrentView('leaderboard')}
        >
          🏆 View Leaderboard
        </button>
      </div>
      
      <div className="tests-grid">
        {tests
          .filter(test => selectedDifficulty === 'All' || test.difficulty === selectedDifficulty)
          .filter(test => selectedType === 'All' || test.testType === selectedType)
          .map(test => (
            <div key={test._id} className="test-card">
              <div className="test-header">
                <h3>{test.title}</h3>
                <span className={`difficulty-badge ${test.difficulty.toLowerCase()}`}>
                  {test.difficulty}
                </span>
              </div>
              
              <div className="test-details">
                <p>{test.description}</p>
                <div className="test-meta">
                  <span>📝 {test.questions?.length || test.totalQuestions} Questions</span>
                  <span>⏱️ {test.duration} minutes</span>
                  <span>🎯 {test.totalMarks} marks</span>
                  <span>📊 {test.testType}</span>
                </div>
                {test.negativeMarking && (
                  <div className="negative-marking">
                    ⚠️ Negative marking: -{test.markingScheme?.incorrect || 0.25} per wrong answer
                  </div>
                )}
              </div>
              
              <div className="test-actions">
                <button 
                  className="start-test-btn"
                  onClick={() => startTest(test)}
                >
                  🚀 Start Test
                </button>
                <button className="preview-btn">
                  👁️ Preview
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );

  const renderTestInterface = () => {
    if (!currentTest || !currentTest.questions) return null;
    
    const question = currentTest.questions[currentQuestion];
    const totalQuestions = currentTest.questions.length;
    
    return (
      <div className="test-interface">
        <div className="test-header-bar">
          <div className="test-info">
            <h2>{currentTest.title}</h2>
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
          </div>
          
          <div className="test-timer">
            <div className={`timer ${timeRemaining < 300 ? 'warning' : ''}`}>
              ⏰ {formatTime(timeRemaining)}
            </div>
          </div>
          
          <div className="test-actions">
            <button
              className="submit-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to submit the test? This action cannot be undone.')) {
                  handleSubmitTest();
                }
              }}
            >
              📤 Submit Test
            </button>
          </div>
        </div>
        
        <div className="test-content">
          <div className="question-panel">
            <div className="question-header">
              <div className="question-number">
                Question {currentQuestion + 1}
              </div>
              <div className="question-marks">
                Marks: {question.marks || 1}
                {currentTest.negativeMarking && (
                  <span className="negative-marks">
                    (-{question.negativeMarks || 0.25})
                  </span>
                )}
              </div>
            </div>
            
            <div className="question-text">
              {question.questionText}
            </div>
            
            <div className="options-container">
              {question.options?.map((option, index) => (
                <div 
                  key={index}
                  className={`option ${answers[currentQuestion] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(currentQuestion, option)}
                >
                  <div className="option-marker">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="option-text">{option}</div>
                </div>
              ))}
            </div>
            
            <div className="question-actions">
              <button 
                className="mark-review-btn"
                onClick={() => markForReview(currentQuestion)}
              >
                {markedForReview.has(currentQuestion) ? '🏷️ Unmark' : '🏷️ Mark for Review'}
              </button>
              
              <div className="navigation-buttons">
                <button 
                  className="nav-btn"
                  onClick={() => navigateToQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  ← Previous
                </button>
                <button 
                  className="nav-btn"
                  onClick={() => navigateToQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
                  disabled={currentQuestion === totalQuestions - 1}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
          
          <div className="question-palette">
            <h3>Question Palette</h3>
            <div className="palette-legend">
              <div className="legend-item">
                <div className="legend-color answered"></div>
                <span>Answered</span>
              </div>
              <div className="legend-item">
                <div className="legend-color marked"></div>
                <span>Marked</span>
              </div>
              <div className="legend-item">
                <div className="legend-color visited"></div>
                <span>Visited</span>
              </div>
              <div className="legend-item">
                <div className="legend-color not-visited"></div>
                <span>Not Visited</span>
              </div>
            </div>
            
            <div className="palette-grid">
              {Array.from({ length: totalQuestions }, (_, index) => (
                <button
                  key={index}
                  className={`palette-btn ${getQuestionStatus(index)} ${currentQuestion === index ? 'current' : ''}`}
                  onClick={() => navigateToQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className="palette-summary">
              <div className="summary-item">
                <span>Answered: {Object.keys(answers).length}</span>
              </div>
              <div className="summary-item">
                <span>Marked: {markedForReview.size}</span>
              </div>
              <div className="summary-item">
                <span>Remaining: {totalQuestions - Object.keys(answers).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!testResults) return null;
    
    return (
      <div className="test-results">
        <div className="results-header">
          <h1>📊 Test Results</h1>
          <p>{currentTest.title}</p>
        </div>
        
        <div className="results-overview">
          <div className="score-card">
            <div className="score-value">{testResults.score}</div>
            <div className="score-label">Score</div>
            <div className="score-percentage">{testResults.percentage}%</div>
          </div>
          
          <div className="rank-card">
            <div className="rank-value">#{testResults.rank}</div>
            <div className="rank-label">Your Rank</div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value correct">{testResults.analysis?.correctAnswers || 0}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div className="stat-item">
              <span className="stat-value incorrect">{testResults.analysis?.incorrectAnswers || 0}</span>
              <span className="stat-label">Incorrect</span>
            </div>
            <div className="stat-item">
              <span className="stat-value unattempted">{testResults.analysis?.unattempted || 0}</span>
              <span className="stat-label">Unattempted</span>
            </div>
          </div>
        </div>
        
        <div className="subject-wise-analysis">
          <h3>Subject-wise Performance</h3>
          <div className="subject-analysis-grid">
            {testResults.subjectWiseScore?.map(subject => (
              <div key={subject.subject} className="subject-score-card">
                <h4>{subject.subject}</h4>
                <div className="subject-score">{subject.score}/{subject.maxScore}</div>
                <div className="subject-percentage">{subject.percentage}%</div>
                <div className="subject-breakdown">
                  <span className="correct">✓ {subject.correctAnswers}</span>
                  <span className="incorrect">✗ {subject.incorrectAnswers}</span>
                  <span className="unattempted">- {subject.unattempted}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="recommendations">
          <h3>🎯 Recommendations</h3>
          <div className="recommendations-list">
            {testResults.analysis?.recommendations?.map((rec, index) => (
              <div key={index} className="recommendation-item">
                💡 {rec}
              </div>
            ))}
          </div>
        </div>
        
        <div className="results-actions">
          <button 
            className="review-btn"
            onClick={() => setCurrentView('review')}
          >
            📝 Review Answers
          </button>
          <button 
            className="retake-btn"
            onClick={() => startTest(currentTest)}
          >
            🔄 Retake Test
          </button>
          <button 
            className="dashboard-btn"
            onClick={() => setCurrentView('dashboard')}
          >
            🏠 Back to Dashboard
          </button>
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top performers in {examCode}</p>
        <button 
          className="back-btn"
          onClick={() => setCurrentView('dashboard')}
        >
          ← Back to Tests
        </button>
      </div>
      
      <div className="leaderboard-table">
        <div className="table-header">
          <div>Rank</div>
          <div>Name</div>
          <div>Score</div>
          <div>Tests</div>
          <div>Avg Score</div>
        </div>
        
        {leaderboard.map((entry, index) => (
          <div 
            key={entry.userId} 
            className={`table-row ${entry.userId === user.id ? 'current-user' : ''}`}
          >
            <div className="rank">
              {index + 1}
              {index < 3 && <span className="medal">{['🥇', '🥈', '🥉'][index]}</span>}
            </div>
            <div className="name">{entry.name}</div>
            <div className="score">{entry.bestScore}%</div>
            <div className="tests">{entry.testsAttempted}</div>
            <div className="avg-score">{entry.averageScore}%</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mock-test-system">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading mock tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mock-test-system">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchMockTests} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-test-system">
      {currentView === 'dashboard' && renderTestDashboard()}
      {currentView === 'test' && renderTestInterface()}
      {currentView === 'results' && renderResults()}
      {currentView === 'leaderboard' && renderLeaderboard()}
    </div>
  );
};

export default MockTestSystem;
