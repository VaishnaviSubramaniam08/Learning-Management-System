import React, { useState, useEffect } from 'react';
import NotesRepository from './NotesRepository';
import StudyPlanGenerator from './StudyPlanGenerator';
import ProgressAnalytics from './ProgressAnalytics';
import MockTestSystem from './MockTestSystem';
import DoubtForum from './DoubtForum';
import './CareerExamPrep.css';

const CareerExamPrep = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExam, setSelectedExam] = useState('JEE');
  const [examConfigs, setExamConfigs] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const EXAM_TYPES = [
    { code: 'JEE', name: 'JEE Main/Advanced', category: 'Engineering', icon: '⚙️' },
    { code: 'NEET', name: 'NEET', category: 'Medical', icon: '🏥' },
    { code: 'GATE', name: 'GATE', category: 'Engineering', icon: '🎓' },
    { code: 'UPSC', name: 'UPSC Civil Services', category: 'Government', icon: '🏛️' },
    { code: 'TNPSC', name: 'TNPSC', category: 'Government', icon: '🏢' },
    { code: 'SSC', name: 'SSC CGL/CHSL', category: 'Government', icon: '📋' },
    { code: 'BANK', name: 'Banking Exams', category: 'Banking', icon: '🏦' },
    { code: 'RRB', name: 'Railway Exams', category: 'Railway', icon: '🚂' }
  ];

  const TABS = [
    { key: 'overview', label: '📊 Overview', component: null },
    { key: 'notes', label: '📚 Notes Repository', component: NotesRepository },
    { key: 'study-plan', label: '📅 Study Planner', component: StudyPlanGenerator },
    { key: 'analytics', label: '📈 Analytics', component: ProgressAnalytics },
    { key: 'mock-tests', label: '🎯 Mock Tests', component: MockTestSystem },
    { key: 'doubt-forum', label: '💬 Doubt Forum', component: DoubtForum }
  ];

  useEffect(() => {
    fetchInitialData();
  }, [selectedExam]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch exam configurations, user stats, and notifications
      // This would be actual API calls in a real implementation
      
      // Mock data for demonstration
      setExamConfigs(EXAM_TYPES);
      setUserStats({
        totalStudyTime: 156,
        testsAttempted: 23,
        averageScore: 78,
        currentStreak: 12,
        weakSubjects: ['Physics', 'Mathematics'],
        strongSubjects: ['Chemistry', 'Biology'],
        upcomingTests: 3,
        pendingDoubts: 2
      });
      setNotifications([
        { id: 1, type: 'test', message: 'New mock test available for Physics', time: '2 hours ago' },
        { id: 2, type: 'doubt', message: 'Your doubt in Mathematics was answered', time: '5 hours ago' },
        { id: 3, type: 'achievement', message: 'You earned a new badge: Study Streak!', time: '1 day ago' }
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="overview-section">
      <div className="welcome-banner">
        <div className="banner-content">
          <h2>Welcome to Career & Exam Preparation! 🚀</h2>
          <p>Your comprehensive platform for competitive exam success</p>
          <div className="current-exam">
            <span>Currently preparing for: </span>
            <strong>{EXAM_TYPES.find(e => e.code === selectedExam)?.name}</strong>
          </div>
        </div>
        <div className="banner-stats">
          <div className="stat-item">
            <span className="stat-value">{userStats?.currentStreak || 0}</span>
            <span className="stat-label">Day Streak</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userStats?.totalStudyTime || 0}h</span>
            <span className="stat-label">Study Time</span>
          </div>
        </div>
      </div>

      <div className="quick-stats">
        <div className="stats-grid">
          <div className="stat-card study-time">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-number">{userStats?.totalStudyTime || 0}</div>
              <div className="stat-title">Hours Studied</div>
              <div className="stat-subtitle">This month</div>
            </div>
          </div>
          
          <div className="stat-card tests">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{userStats?.testsAttempted || 0}</div>
              <div className="stat-title">Tests Attempted</div>
              <div className="stat-subtitle">Average: {userStats?.averageScore || 0}%</div>
            </div>
          </div>
          
          <div className="stat-card upcoming">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-number">{userStats?.upcomingTests || 0}</div>
              <div className="stat-title">Upcoming Tests</div>
              <div className="stat-subtitle">This week</div>
            </div>
          </div>
          
          <div className="stat-card doubts">
            <div className="stat-icon">💬</div>
            <div className="stat-content">
              <div className="stat-number">{userStats?.pendingDoubts || 0}</div>
              <div className="stat-title">Pending Doubts</div>
              <div className="stat-subtitle">Need answers</div>
            </div>
          </div>
        </div>
      </div>

      <div className="overview-content">
        <div className="main-content">
          <div className="performance-overview">
            <h3>📊 Performance Overview</h3>
            <div className="performance-grid">
              <div className="performance-item">
                <h4>Strong Subjects</h4>
                <div className="subject-list strong">
                  {userStats?.strongSubjects?.map(subject => (
                    <span key={subject} className="subject-tag strong">{subject}</span>
                  ))}
                </div>
              </div>
              
              <div className="performance-item">
                <h4>Areas to Improve</h4>
                <div className="subject-list weak">
                  {userStats?.weakSubjects?.map(subject => (
                    <span key={subject} className="subject-tag weak">{subject}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>🚀 Quick Actions</h3>
            <div className="actions-grid">
              <button 
                className="action-card"
                onClick={() => setActiveTab('study-plan')}
              >
                <div className="action-icon">📅</div>
                <div className="action-content">
                  <h4>Create Study Plan</h4>
                  <p>Generate AI-powered study schedule</p>
                </div>
              </button>
              
              <button 
                className="action-card"
                onClick={() => setActiveTab('mock-tests')}
              >
                <div className="action-icon">🎯</div>
                <div className="action-content">
                  <h4>Take Mock Test</h4>
                  <p>Practice with real exam conditions</p>
                </div>
              </button>
              
              <button 
                className="action-card"
                onClick={() => setActiveTab('notes')}
              >
                <div className="action-icon">📚</div>
                <div className="action-content">
                  <h4>Browse Notes</h4>
                  <p>Access comprehensive study materials</p>
                </div>
              </button>
              
              <button 
                className="action-card"
                onClick={() => setActiveTab('doubt-forum')}
              >
                <div className="action-icon">💬</div>
                <div className="action-content">
                  <h4>Ask Doubt</h4>
                  <p>Get help from AI or community</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="notifications-panel">
            <h3>🔔 Recent Updates</h3>
            <div className="notifications-list">
              {notifications.map(notification => (
                <div key={notification.id} className={`notification-item ${notification.type}`}>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="exam-selector">
            <h3>🎯 Select Exam</h3>
            <div className="exam-grid">
              {EXAM_TYPES.map(exam => (
                <button
                  key={exam.code}
                  className={`exam-card ${selectedExam === exam.code ? 'selected' : ''}`}
                  onClick={() => setSelectedExam(exam.code)}
                >
                  <div className="exam-icon">{exam.icon}</div>
                  <div className="exam-name">{exam.code}</div>
                  <div className="exam-category">{exam.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveComponent = () => {
    const activeTabData = TABS.find(tab => tab.key === activeTab);
    
    if (activeTab === 'overview') {
      return renderOverview();
    }
    
    if (activeTabData?.component) {
      const Component = activeTabData.component;
      return <Component user={user} examCode={selectedExam} />;
    }
    
    return <div>Component not found</div>;
  };

  if (loading) {
    return (
      <div className="career-exam-prep">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Career & Exam Preparation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="career-exam-prep">
      {/* Back Button */}
      {onBack && (
        <button 
          className="back-button"
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
          ← Back to Dashboard
        </button>
      )}
      
      <div className="prep-header">
        <div className="header-content">
          <h1>🎓 Career & Competitive Exam Preparation</h1>
          <p>Master your exams with AI-powered study tools and comprehensive resources</p>
        </div>
        
        <div className="header-info">
          <div className="current-exam-display">
            <span>Preparing for:</span>
            <div className="exam-badge">
              {EXAM_TYPES.find(e => e.code === selectedExam)?.icon} {selectedExam}
            </div>
          </div>
        </div>
      </div>

      <div className="prep-navigation">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="prep-content">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default CareerExamPrep;
